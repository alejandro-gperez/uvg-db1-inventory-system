package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"proyecto_2/backend/auth"
	"proyecto_2/backend/db"
	"proyecto_2/backend/handlers"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
		if allowedOrigin == "" {
			allowedOrigin = "http://localhost:3000"
		}

		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	conn, err := db.Connect()
	if err != nil {
		log.Fatal(err)
	}
	if err := auth.EnsureSchemaAndSeed(conn); err != nil {
		log.Fatal(err)
	}

	// ===== HANDLERS AUTH =====

	http.HandleFunc("/auth/login", auth.LoginHandler(conn))
	http.HandleFunc("/auth/logout", auth.RequireAuth(conn, auth.LogoutHandler(conn)))
	http.HandleFunc("/auth/me", auth.RequireAuth(conn, auth.MeHandler()))

	// ===== HANDLERS PRODUCTO =====

	http.HandleFunc("/productos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero", "empleado"), handlers.GetProductos(conn))(w, r)
		case http.MethodPost:
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero"), handlers.CreateProducto(conn))(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/productos/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero"), handlers.UpdateProducto(conn))(w, r)
		case http.MethodDelete:
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero"), handlers.DeleteProducto(conn))(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	// ===== HANDLERS VENTA =====

	http.HandleFunc("/ventas", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.CreateVenta(conn))(w, r)
		case http.MethodGet:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.GetVentas(conn))(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/ventas/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/cancelar") {
			auth.RequireRole(conn, auth.Roles("administrador"), handlers.CancelVenta(conn))(w, r)
			return
		}
		if r.Method == http.MethodGet {
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.GetVentaDetalle(conn))(w, r)
			return
		}
		http.Error(w, "Método no permitido", 405)
	})

	// ===== HANDLERS REPORTES =====

	http.HandleFunc("/reportes/ventas", auth.RequireRole(conn, auth.Roles("administrador", "gerente", "empleado"), handlers.ReporteVentas(conn)))
	http.HandleFunc("/reportes/top-productos", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.TopProductos(conn)))
	http.HandleFunc("/reportes/cte", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.ReporteCTE(conn)))
	http.HandleFunc("/reportes/productos-vendidos", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.ProductosVendidos(conn)))
	http.HandleFunc("/reportes/ventas-altas", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.VentasAltas(conn)))
	http.HandleFunc("/reportes/resumen", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.ResumenVentasPeriodo(conn)))

	http.HandleFunc("/ventas-view", auth.RequireRole(conn, auth.Roles("administrador", "gerente"), handlers.GetVentasView(conn)))

	// ===== HANDLERS AUDITORIA =====

	http.HandleFunc("/auditoria/ventas", auth.RequireRole(conn, auth.Roles("administrador", "auditor_externo"), handlers.AuditoriaVentas(conn)))
	http.HandleFunc("/auditoria/inventario", auth.RequireRole(conn, auth.Roles("administrador", "auditor_externo"), handlers.AuditoriaInventario(conn)))
	http.HandleFunc("/auditoria/productos", auth.RequireRole(conn, auth.Roles("administrador", "auditor_externo"), handlers.AuditoriaProductos(conn)))

	// ===== HANDLERS INVENTARIO / STORED PROCEDURES =====

	http.HandleFunc("/inventario/ajuste", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero"), handlers.AjustarInventario(conn))(w, r)
			return
		}
		http.Error(w, "Método no permitido", 405)
	})

	http.HandleFunc("/inventario/ingreso", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			auth.RequireRole(conn, auth.Roles("administrador", "bodeguero"), handlers.IngresarInventario(conn))(w, r)
			return
		}
		http.Error(w, "Método no permitido", 405)
	})

	// ===== HANDLERS CLIENTE =====

	http.HandleFunc("/clientes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.GetClientes(conn))(w, r)
		case http.MethodPost:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.CreateCliente(conn))(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/clientes/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.UpdateCliente(conn))(w, r)
		case http.MethodDelete:
			auth.RequireRole(conn, auth.Roles("administrador", "empleado"), handlers.DeleteCliente(conn))(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	log.Println("Servidor corriendo en http://localhost:8080")

	handler := enableCORS(http.DefaultServeMux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}
