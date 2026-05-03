package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type DetalleVenta struct {
	ProductoID int `json:"id_producto"`
	Cantidad   int `json:"cantidad"`
}

type VentaRequest struct {
	ClienteID    int            `json:"id_cliente"`
	EmpleadoID   int            `json:"id_empleado"`
	MetodoPagoID int            `json:"id_metodo_pago"`
	Detalles     []DetalleVenta `json:"detalles"`
}

func CreateVenta(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VentaRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		var ventaID int
		err = tx.QueryRow(`
			INSERT INTO Venta (estado, id_cliente, id_empleado, id_metodo_pago)
			VALUES ('completada', $1, $2, $3)
			RETURNING id_venta
		`, req.ClienteID, req.EmpleadoID, req.MetodoPagoID).Scan(&ventaID)

		if err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), 500)
			return
		}

		for _, d := range req.Detalles {

			var precio float64
			err = tx.QueryRow(`
				SELECT precio FROM Producto WHERE id_producto = $1 AND activo = TRUE
			`, d.ProductoID).Scan(&precio)

			if err != nil {
				tx.Rollback()
				http.Error(w, "producto no válido", 400)
				return
			}

			var stock int
			err = tx.QueryRow(`
				SELECT stock_actual FROM Inventario WHERE id_producto = $1
			`, d.ProductoID).Scan(&stock)

			if err != nil || stock < d.Cantidad {
				tx.Rollback()
				http.Error(w, "stock insuficiente", 400)
				return
			}

			_, err = tx.Exec(`
				INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
				VALUES ($1, $2, $3, $4)
			`, ventaID, d.ProductoID, d.Cantidad, precio)

			if err != nil {
				tx.Rollback()
				http.Error(w, err.Error(), 500)
				return
			}

			_, err = tx.Exec(`
				UPDATE Inventario
				SET stock_actual = stock_actual - $1
				WHERE id_producto = $2
			`, d.Cantidad, d.ProductoID)

			if err != nil {
				tx.Rollback()
				http.Error(w, err.Error(), 500)
				return
			}
		}

		err = tx.Commit()
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":  "Venta creada",
			"id_venta": ventaID,
		})
	}
}

func GetVentas(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT 
				v.id_venta,
				v.fecha,
				c.nombre AS cliente,
				e.nombre AS empleado,
				m.nombre AS metodo_pago
			FROM Venta v
			JOIN Cliente c ON v.id_cliente = c.id_cliente
			JOIN Empleado e ON v.id_empleado = e.id_empleado
			JOIN Metodo_Pago m ON v.id_metodo_pago = m.id_metodo_pago
			ORDER BY v.fecha DESC
		`)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Venta struct {
			ID         int    `json:"id_venta"`
			Fecha      string `json:"fecha"`
			Cliente    string `json:"cliente"`
			Empleado   string `json:"empleado"`
			MetodoPago string `json:"metodo_pago"`
		}

		ventas := []Venta{}

		for rows.Next() {
			var v Venta
			err := rows.Scan(
				&v.ID,
				&v.Fecha,
				&v.Cliente,
				&v.Empleado,
				&v.MetodoPago,
			)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}

			ventas = append(ventas, v)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ventas)
	}
}

func GetVentaDetalle(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		id := r.URL.Path[len("/ventas/"):]

		rows, err := db.Query(`
			SELECT 
				p.nombre,
				dv.cantidad,
				dv.precio_unitario
			FROM Detalle_Venta dv
			JOIN Producto p ON dv.id_producto = p.id_producto
			WHERE dv.id_venta = $1
		`, id)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Detalle struct {
			Producto string  `json:"producto"`
			Cantidad int     `json:"cantidad"`
			Precio   float64 `json:"precio_unitario"`
		}

		detalles := []Detalle{}

		for rows.Next() {
			var d Detalle
			rows.Scan(&d.Producto, &d.Cantidad, &d.Precio)
			detalles = append(detalles, d)
		}

		json.NewEncoder(w).Encode(detalles)
	}
}

func ReporteVentas(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT 
				v.id_venta,
				SUM(dv.cantidad * dv.precio_unitario) AS total
			FROM Venta v
			JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
			GROUP BY v.id_venta
		`)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Reporte struct {
			VentaID int     `json:"id_venta"`
			Total   float64 `json:"total"`
		}

		reportes := []Reporte{}

		for rows.Next() {
			var r Reporte
			rows.Scan(&r.VentaID, &r.Total)
			reportes = append(reportes, r)
		}

		json.NewEncoder(w).Encode(reportes)
	}
}

func TopProductos(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT 
				p.nombre,
				SUM(dv.cantidad) AS total_vendido
			FROM Detalle_Venta dv
			JOIN Producto p ON dv.id_producto = p.id_producto
			GROUP BY p.nombre
			ORDER BY total_vendido DESC
		`)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Top struct {
			Producto string `json:"producto"`
			Total    int    `json:"total_vendido"`
		}

		result := []Top{}

		for rows.Next() {
			var t Top
			rows.Scan(&t.Producto, &t.Total)
			result = append(result, t)
		}

		json.NewEncoder(w).Encode(result)
	}
}

func ReporteCTE(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			WITH ventas_producto AS (
				SELECT 
					p.nombre,
					dv.cantidad,
					dv.precio_unitario,
					(dv.cantidad * dv.precio_unitario) AS total
				FROM Detalle_Venta dv
				JOIN Producto p ON dv.id_producto = p.id_producto
			)
			SELECT 
				nombre,
				SUM(cantidad) AS total_vendido,
				SUM(total) AS ingresos
			FROM ventas_producto
			GROUP BY nombre
			ORDER BY ingresos DESC;
		`)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Resultado struct {
			Producto string  `json:"producto"`
			Cantidad int     `json:"total_vendido"`
			Ingresos float64 `json:"ingresos"`
		}

		resultados := []Resultado{}

		for rows.Next() {
			var r Resultado
			rows.Scan(&r.Producto, &r.Cantidad, &r.Ingresos)
			resultados = append(resultados, r)
		}

		json.NewEncoder(w).Encode(resultados)
	}
}

func GetVentasView(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT id_venta, fecha, cliente, empleado, metodo_pago
			FROM vista_ventas
			ORDER BY fecha DESC
		`)

		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		type Venta struct {
			ID         int    `json:"id_venta"`
			Fecha      string `json:"fecha"`
			Cliente    string `json:"cliente"`
			Empleado   string `json:"empleado"`
			MetodoPago string `json:"metodo_pago"`
		}

		ventas := []Venta{}

		for rows.Next() {
			var v Venta
			rows.Scan(&v.ID, &v.Fecha, &v.Cliente, &v.Empleado, &v.MetodoPago)
			ventas = append(ventas, v)
		}

		json.NewEncoder(w).Encode(ventas)
	}
}
