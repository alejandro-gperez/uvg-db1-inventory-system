package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type Producto struct {
	ID     int     `json:"id"`
	Nombre string  `json:"nombre"`
	Precio float64 `json:"precio"`
}

func GetProductos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id_producto, nombre, precio FROM Producto")
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		productos := []Producto{}

		for rows.Next() {
			var p Producto
			rows.Scan(&p.ID, &p.Nombre, &p.Precio)
			productos = append(productos, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productos)
	}
}
