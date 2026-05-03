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
			SELECT id_producto, nombre, precio, id_categoria, id_proveedor, id_marca FROM Producto WHERE activo = TRUE`)
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

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), 500)
			return
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

func UpdateProducto(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")

		var p Producto
		err := json.NewDecoder(r.Body).Decode(&p)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		query := `
			UPDATE Producto
			SET nombre = $1,
			    precio = $2,
			    id_categoria = $3,
			    id_proveedor = $4,
			    id_marca = $5
			WHERE id_producto = $6
		`

		_, err = db.Exec(
			query,
			p.Nombre,
			p.Precio,
			p.CategoriaID,
			p.ProveedorID,
			p.MarcaID,
			id,
		)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Write([]byte("Producto actualizado"))
	}
}

func DeleteProducto(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Path[len("/productos/"):]

		if id == "" {
			http.Error(w, "id es requerido", 400)
			return
		}

		query := `
			UPDATE Producto
			SET activo = FALSE
			WHERE id_producto = $1
		`

		_, err := db.Exec(query, id)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Producto desactivado",
		})
	}
}
