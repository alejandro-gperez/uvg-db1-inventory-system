package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto_2/backend/models"

	"gorm.io/gorm"
)

func GetClientes(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clientes := []models.Cliente{}

		if err := db.Order("id_cliente").Find(&clientes).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(clientes)
	}
}

func CreateCliente(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var cliente models.Cliente
		if err := json.NewDecoder(r.Body).Decode(&cliente); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if cliente.Nombre == "" {
			http.Error(w, "nombre es requerido", http.StatusBadRequest)
			return
		}

		cliente.ID = 0
		if err := db.Create(&cliente).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(cliente)
	}
}

func UpdateCliente(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.URL.Path[len("/clientes/"):])
		if err != nil || id <= 0 {
			http.Error(w, "id de cliente invalido", http.StatusBadRequest)
			return
		}

		var input models.Cliente
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result := db.Model(&models.Cliente{}).
			Where("id_cliente = ?", id).
			Updates(map[string]interface{}{
				"nombre": input.Nombre,
				"correo": input.Correo,
			})
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		if result.RowsAffected == 0 {
			http.Error(w, "cliente no encontrado", http.StatusNotFound)
			return
		}

		var cliente models.Cliente
		if err := db.First(&cliente, "id_cliente = ?", id).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cliente)
	}
}

func DeleteCliente(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.URL.Path[len("/clientes/"):])
		if err != nil || id <= 0 {
			http.Error(w, "id de cliente invalido", http.StatusBadRequest)
			return
		}

		result := db.Delete(&models.Cliente{}, "id_cliente = ?", id)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		if result.RowsAffected == 0 {
			http.Error(w, "cliente no encontrado", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Cliente eliminado",
		})
	}
}
