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

	http.HandleFunc("/productos", handlers.GetProductos(conn))

	log.Println("Servidor corriendo en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
