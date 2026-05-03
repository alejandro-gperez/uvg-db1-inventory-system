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

	log.Println("Servidor corriendo en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
