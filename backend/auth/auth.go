package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"proyecto_2/backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const SessionCookieName = "storehub_session"

type contextKey string

const userContextKey contextKey = "auth_user"

var allRoles = []string{
	"administrador",
	"gerente",
	"empleado",
	"bodeguero",
	"auditor_externo",
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type currentUserResponse struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Nombre   string `json:"nombre"`
	Rol      string `json:"rol"`
}

func EnsureSchemaAndSeed(db *gorm.DB) error {
	users := []models.UsuarioAplicacion{
		{Username: "admin", Nombre: "Administrador", Rol: "administrador", Activo: true},
		{Username: "gerente", Nombre: "Gerente", Rol: "gerente", Activo: true},
		{Username: "empleado", Nombre: "Empleado", Rol: "empleado", Activo: true},
		{Username: "bodeguero", Nombre: "Bodeguero", Rol: "bodeguero", Activo: true},
		{Username: "auditor", Nombre: "Auditor Externo", Rol: "auditor_externo", Activo: true},
	}

	for _, user := range users {
		var existing models.UsuarioAplicacion
		err := db.Where("username = ?", user.Username).First(&existing).Error
		if err == nil {
			continue
		}
		if err != gorm.ErrRecordNotFound {
			return err
		}

		hash, err := bcrypt.GenerateFromPassword([]byte("secret"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.PasswordHash = string(hash)
		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}

	return nil
}

func LoginHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Metodo no permitido", http.StatusMethodNotAllowed)
			return
		}

		var req loginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var user models.UsuarioAplicacion
		if err := db.Where("username = ? AND activo = TRUE", req.Username).First(&user).Error; err != nil {
			http.Error(w, "credenciales invalidas", http.StatusUnauthorized)
			return
		}
		if user.ExpiresAt != nil && user.ExpiresAt.Before(time.Now()) {
			http.Error(w, "usuario expirado", http.StatusUnauthorized)
			return
		}
		if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
			http.Error(w, "credenciales invalidas", http.StatusUnauthorized)
			return
		}

		token, tokenHash, err := newSessionToken()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		session := models.SesionAplicacion{
			UsuarioID: user.ID,
			TokenHash: tokenHash,
			ExpiresAt: time.Now().Add(8 * time.Hour),
		}
		if err := db.Create(&session).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		setSessionCookie(w, token, session.ExpiresAt)
		writeJSON(w, userResponse(user))
	}
}

func LogoutHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if cookie, err := r.Cookie(SessionCookieName); err == nil {
			now := time.Now()
			db.Model(&models.SesionAplicacion{}).
				Where("token_hash = ? AND revoked_at IS NULL", hashToken(cookie.Value)).
				Update("revoked_at", now)
		}
		clearSessionCookie(w)
		writeJSON(w, map[string]string{"message": "logout"})
	}
}

func MeHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := CurrentUser(r)
		if !ok {
			http.Error(w, "no autenticado", http.StatusUnauthorized)
			return
		}
		writeJSON(w, userResponse(user))
	}
}

func RequireAuth(db *gorm.DB, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := authenticateRequest(db, r)
		if !ok {
			http.Error(w, "no autenticado", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

func RequireRole(db *gorm.DB, roles []string, next http.HandlerFunc) http.HandlerFunc {
	return RequireAuth(db, func(w http.ResponseWriter, r *http.Request) {
		user, _ := CurrentUser(r)
		if !roleAllowed(user.Rol, roles) {
			http.Error(w, "acceso denegado", http.StatusForbidden)
			return
		}
		next(w, r)
	})
}

func CurrentUser(r *http.Request) (models.UsuarioAplicacion, bool) {
	user, ok := r.Context().Value(userContextKey).(models.UsuarioAplicacion)
	return user, ok
}

func Roles(names ...string) []string {
	return names
}

func AllRoles() []string {
	return allRoles
}

func authenticateRequest(db *gorm.DB, r *http.Request) (models.UsuarioAplicacion, bool) {
	cookie, err := r.Cookie(SessionCookieName)
	if err != nil || cookie.Value == "" {
		return models.UsuarioAplicacion{}, false
	}

	var session models.SesionAplicacion
	err = db.Preload("Usuario").
		Where("token_hash = ? AND revoked_at IS NULL AND expires_at > ?", hashToken(cookie.Value), time.Now()).
		First(&session).Error
	if err != nil {
		return models.UsuarioAplicacion{}, false
	}
	if !session.Usuario.Activo || (session.Usuario.ExpiresAt != nil && session.Usuario.ExpiresAt.Before(time.Now())) {
		return models.UsuarioAplicacion{}, false
	}

	return session.Usuario, true
}

func roleAllowed(role string, allowed []string) bool {
	if role == "administrador" {
		return true
	}
	for _, allowedRole := range allowed {
		if role == allowedRole {
			return true
		}
	}
	return false
}

func newSessionToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	token := hex.EncodeToString(bytes)
	return token, hashToken(token), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func setSessionCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		MaxAge:   int(time.Until(expiresAt).Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func userResponse(user models.UsuarioAplicacion) currentUserResponse {
	return currentUserResponse{
		ID:       user.ID,
		Username: user.Username,
		Nombre:   user.Nombre,
		Rol:      user.Rol,
	}
}

func writeJSON(w http.ResponseWriter, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payload)
}
