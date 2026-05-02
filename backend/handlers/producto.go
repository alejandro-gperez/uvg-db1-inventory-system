package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type Producto struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Precio      float64 `json:"precio"`
	CategoriaID int     `json:"id_categoria"`
	ProveedorID int     `json:"id_proveedor"`
	MarcaID     int     `json:"id_marca"`
}

func GetProductos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(`
			SELECT id_producto, nombre, precio, id_categoria, id_proveedor, id_marca
			FROM Producto
		`)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		productos := []Producto{}

		for rows.Next() {
			var p Producto
			err := rows.Scan(
				&p.ID,
				&p.Nombre,
				&p.Precio,
				&p.CategoriaID,
				&p.ProveedorID,
				&p.MarcaID,
			)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}

			productos = append(productos, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productos)
	}
}

func CreateProducto(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p Producto

		err := json.NewDecoder(r.Body).Decode(&p)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		query := `
			INSERT INTO Producto (nombre, precio, id_categoria, id_proveedor, id_marca)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id_producto
		`

		err = db.QueryRow(
			query,
			p.Nombre,
			p.Precio,
			p.CategoriaID,
			p.ProveedorID,
			p.MarcaID,
		).Scan(&p.ID)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}
