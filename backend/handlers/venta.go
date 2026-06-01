package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
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

type InventarioMovimientoRequest struct {
	ProductoID int    `json:"id_producto"`
	Cantidad   int    `json:"cantidad"`
	Delta      int    `json:"delta"`
	Motivo     string `json:"motivo"`
}

func CreateVenta(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VentaRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if req.ClienteID == 0 || req.EmpleadoID == 0 || req.MetodoPagoID == 0 || len(req.Detalles) == 0 {
			http.Error(w, "cliente, empleado, metodo de pago y detalles son requeridos", http.StatusBadRequest)
			return
		}

		detalles, err := json.Marshal(req.Detalles)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err := db.Exec(
			"CALL sp_registrar_venta(?, ?, ?, ?::jsonb)",
			req.ClienteID,
			req.EmpleadoID,
			req.MetodoPagoID,
			string(detalles),
		).Error; err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Venta creada",
		})
	}
}

func CancelVenta(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idText := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/ventas/"), "/cancelar")
		id, err := strconv.Atoi(strings.Trim(idText, "/"))
		if err != nil || id <= 0 {
			http.Error(w, "id de venta invalido", http.StatusBadRequest)
			return
		}

		var req struct {
			Motivo string `json:"motivo"`
		}
		if r.Body != nil {
			_ = json.NewDecoder(r.Body).Decode(&req)
		}
		if req.Motivo == "" {
			req.Motivo = "Cancelacion solicitada desde backend"
		}

		if err := db.Exec("CALL sp_cancelar_venta(?, ?)", id, req.Motivo).Error; err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Venta cancelada",
		})
	}
}

func AjustarInventario(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req InventarioMovimientoRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if req.ProductoID == 0 || req.Delta == 0 {
			http.Error(w, "id_producto y delta son requeridos", http.StatusBadRequest)
			return
		}

		var stockNuevo int
		row := db.Raw(
			"CALL sp_ajustar_inventario(?, ?, ?, NULL)",
			req.ProductoID,
			req.Delta,
			req.Motivo,
		).Row()
		if err := row.Scan(&stockNuevo); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{
			"stock_actual": stockNuevo,
		})
	}
}

func IngresarInventario(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req InventarioMovimientoRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if req.ProductoID == 0 || req.Cantidad <= 0 {
			http.Error(w, "id_producto y cantidad positiva son requeridos", http.StatusBadRequest)
			return
		}

		var stockNuevo int
		row := db.Raw(
			"CALL sp_ingresar_inventario(?, ?, ?, NULL)",
			req.ProductoID,
			req.Cantidad,
			req.Motivo,
		).Row()
		if err := row.Scan(&stockNuevo); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{
			"stock_actual": stockNuevo,
		})
	}
}

func GetVentas(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Venta struct {
			ID         int    `json:"id_venta"`
			Fecha      string `json:"fecha"`
			Cliente    string `json:"cliente"`
			Empleado   string `json:"empleado"`
			MetodoPago string `json:"metodo_pago"`
		}

		ventas := []Venta{}
		if err := db.Raw(`
			SELECT
				v.id_venta AS id,
				v.fecha,
				c.nombre AS cliente,
				e.nombre AS empleado,
				m.nombre AS metodo_pago
			FROM Venta v
			JOIN Cliente c ON v.id_cliente = c.id_cliente
			JOIN Empleado e ON v.id_empleado = e.id_empleado
			JOIN Metodo_Pago m ON v.id_metodo_pago = m.id_metodo_pago
			ORDER BY v.fecha DESC
		`).Scan(&ventas).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ventas)
	}
}

func GetVentaDetalle(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Path[len("/ventas/"):]

		type Detalle struct {
			Producto string  `json:"producto"`
			Cantidad int     `json:"cantidad"`
			Precio   float64 `json:"precio_unitario"`
		}

		detalles := []Detalle{}
		if err := db.Raw(`
			SELECT
				p.nombre AS producto,
				dv.cantidad,
				dv.precio_unitario AS precio
			FROM Detalle_Venta dv
			JOIN Producto p ON dv.id_producto = p.id_producto
			WHERE dv.id_venta = ?
		`, id).Scan(&detalles).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(detalles)
	}
}

func ReporteVentas(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Reporte struct {
			VentaID int     `json:"id_venta"`
			Total   float64 `json:"total"`
		}

		reportes := []Reporte{}
		if err := db.Raw(`
			SELECT
				id_venta AS venta_id,
				total
			FROM vw_reporte_ventas
			WHERE estado = 'completada'
			ORDER BY fecha DESC
		`).Scan(&reportes).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(reportes)
	}
}

func TopProductos(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Top struct {
			Producto string `json:"producto"`
			Total    int    `json:"total_vendido"`
		}

		result := []Top{}
		if err := db.Raw(`
			SELECT
				producto,
				total_vendido AS total
			FROM vw_top_productos
			WHERE total_vendido > 0
			ORDER BY total_vendido DESC
		`).Scan(&result).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}

func ReporteCTE(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Resultado struct {
			Producto string  `json:"producto"`
			Cantidad int     `json:"total_vendido"`
			Ingresos float64 `json:"ingresos"`
		}

		resultados := []Resultado{}
		if err := db.Raw(`
			WITH ventas_producto AS (
				SELECT
					p.nombre,
					dv.cantidad,
					dv.precio_unitario,
					(dv.cantidad * dv.precio_unitario) AS total
				FROM Detalle_Venta dv
				JOIN Producto p ON dv.id_producto = p.id_producto
				JOIN Venta v ON dv.id_venta = v.id_venta
				WHERE v.estado = 'completada'
			)
			SELECT
				nombre AS producto,
				SUM(cantidad)::int AS cantidad,
				SUM(total)::float AS ingresos
			FROM ventas_producto
			GROUP BY nombre
			ORDER BY ingresos DESC;
		`).Scan(&resultados).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resultados)
	}
}

func ResumenVentasPeriodo(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		desde := r.URL.Query().Get("desde")
		hasta := r.URL.Query().Get("hasta")
		if desde == "" || hasta == "" {
			now := time.Now()
			desde = now.AddDate(0, -1, 0).Format("2006-01-02")
			hasta = now.Format("2006-01-02")
		}

		type Resumen struct {
			TotalVentas int     `json:"total_ventas"`
			Ingresos    float64 `json:"ingresos"`
		}

		var resumen Resumen
		row := db.Raw("CALL sp_resumen_ventas_periodo(?::date, ?::date, NULL, NULL)", desde, hasta).Row()
		if err := row.Scan(&resumen.TotalVentas, &resumen.Ingresos); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resumen)
	}
}

func GetVentasView(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Venta struct {
			ID         int    `json:"id_venta"`
			Fecha      string `json:"fecha"`
			Cliente    string `json:"cliente"`
			Empleado   string `json:"empleado"`
			MetodoPago string `json:"metodo_pago"`
		}

		ventas := []Venta{}
		if err := db.Raw(`
			SELECT
				id_venta AS id,
				fecha,
				cliente,
				empleado,
				metodo_pago
			FROM vista_ventas
			ORDER BY fecha DESC
		`).Scan(&ventas).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ventas)
	}
}

func VentasAltas(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Venta struct {
			ID int `json:"id_venta"`
		}

		result := []Venta{}
		if err := db.Raw(`
			SELECT id_venta AS id
			FROM Venta
			WHERE id_venta IN (
				SELECT id_venta
				FROM Detalle_Venta
				GROUP BY id_venta
				HAVING SUM(cantidad * precio_unitario) > 50
			)
		`).Scan(&result).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}
