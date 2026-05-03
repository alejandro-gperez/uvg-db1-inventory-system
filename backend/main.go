package main

import (
	"log"
	"net/http"
	"os"

	"proyecto_2/backend/db"
	"proyecto_2/backend/handlers"
)

func main() {

	os.Setenv("POSTGRES_USER", "proy2")
	os.Setenv("POSTGRES_PASSWORD", "secret")
	os.Setenv("POSTGRES_DB", "tienda")

	conn, err := db.Connect()
	if err != nil {
		log.Fatal(err)
	}

	// ===== HANDLERS PRODUCTO =====

	http.HandleFunc("/productos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetProductos(conn)(w, r)
		case http.MethodPost:
			handlers.CreateProducto(conn)(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/productos/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodDelete:
			handlers.DeleteProducto(conn)(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	// ===== HANDLERS VENTA =====

	http.HandleFunc("/ventas", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlers.CreateVenta(conn)(w, r)
		case http.MethodGet:
			handlers.GetVentas(conn)(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/ventas/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handlers.GetVentaDetalle(conn)(w, r)
			return
		}
		http.Error(w, "Método no permitido", 405)
	})

	// ===== HANDLERS REPORTES =====

	http.HandleFunc("/reportes/ventas", handlers.ReporteVentas(conn))
	http.HandleFunc("/reportes/top-productos", handlers.TopProductos(conn))
	http.HandleFunc("/reportes/cte", handlers.ReporteCTE(conn))
	http.HandleFunc("/reportes/productos-vendidos", handlers.ProductosVendidos(conn))
	http.HandleFunc("/reportes/ventas-altas", handlers.VentasAltas(conn))

	http.HandleFunc("/ventas-view", handlers.GetVentasView(conn))

	// ===== HANDLERS CLIENTE =====

	http.HandleFunc("/clientes", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetClientes(conn)(w, r)
		case http.MethodPost:
			handlers.CreateCliente(conn)(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	http.HandleFunc("/clientes/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			handlers.UpdateCliente(conn)(w, r)
		case http.MethodDelete:
			handlers.DeleteCliente(conn)(w, r)
		default:
			http.Error(w, "Método no permitido", 405)
		}
	})

	log.Println("Servidor corriendo en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
