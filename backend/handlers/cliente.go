package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type Cliente struct {
	ID     int    `json:"id"`
	Nombre string `json:"nombre"`
	Correo string `json:"correo"`
}

func GetClientes(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT id_cliente, nombre, correo
			FROM Cliente
			ORDER BY id_cliente
		`)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		clientes := []Cliente{}

		for rows.Next() {
			var c Cliente
			if err := rows.Scan(&c.ID, &c.Nombre, &c.Correo); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			clientes = append(clientes, c)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(clientes)
	}
}

func CreateCliente(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var c Cliente
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		if c.Nombre == "" {
			http.Error(w, "nombre es requerido", 400)
			return
		}

		err := db.QueryRow(`
			INSERT INTO Cliente (nombre, correo)
			VALUES ($1, $2)
			RETURNING id_cliente
		`, c.Nombre, c.Correo).Scan(&c.ID)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(c)
	}
}

func UpdateCliente(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		id := r.URL.Path[len("/clientes/"):]
		if id == "" {
			http.Error(w, "id requerido", 400)
			return
		}

		var c Cliente
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		_, err := db.Exec(`
			UPDATE Cliente
			SET nombre = $1, correo = $2
			WHERE id_cliente = $3
		`, c.Nombre, c.Correo, id)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"message": "Cliente actualizado",
		})
	}
}

func DeleteCliente(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		id := r.URL.Path[len("/clientes/"):]
		if id == "" {
			http.Error(w, "id requerido", 400)
			return
		}

		_, err := db.Exec(`
			DELETE FROM Cliente WHERE id_cliente = $1
		`, id)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"message": "Cliente eliminado",
		})
	}
}
