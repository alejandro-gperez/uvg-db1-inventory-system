package handlers

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

func AuditoriaVentas(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type VentaAuditoria struct {
			IDVenta    int     `gorm:"column:id_venta" json:"id_venta"`
			Fecha      string  `json:"fecha"`
			Estado     string  `json:"estado"`
			Empleado   string  `json:"empleado"`
			MetodoPago string  `gorm:"column:metodo_pago" json:"metodo_pago"`
			Total      float64 `json:"total"`
		}

		rows := []VentaAuditoria{}
		if err := db.Raw("SELECT id_venta, fecha, estado, empleado, metodo_pago, total FROM vw_auditoria_ventas ORDER BY fecha DESC").Scan(&rows).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rows)
	}
}

func AuditoriaInventario(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type InventarioAuditoria struct {
			IDMovimiento  int    `gorm:"column:id_movimiento" json:"id_movimiento"`
			Fecha         string `json:"fecha"`
			Producto      string `json:"producto"`
			Tipo          string `json:"tipo"`
			Cantidad      int    `json:"cantidad"`
			StockAnterior int    `gorm:"column:stock_anterior" json:"stock_anterior"`
			StockNuevo    int    `gorm:"column:stock_nuevo" json:"stock_nuevo"`
			Motivo        string `json:"motivo"`
		}

		rows := []InventarioAuditoria{}
		if err := db.Raw("SELECT id_movimiento, fecha, producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo FROM vw_auditoria_inventario ORDER BY fecha DESC").Scan(&rows).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rows)
	}
}

func AuditoriaProductos(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type ProductoAuditoria struct {
			IDProducto int     `gorm:"column:id_producto" json:"id_producto"`
			Producto   string  `json:"producto"`
			Categoria  string  `json:"categoria"`
			Proveedor  string  `json:"proveedor"`
			Marca      string  `json:"marca"`
			Precio     float64 `json:"precio"`
			Activo     bool    `json:"activo"`
		}

		rows := []ProductoAuditoria{}
		if err := db.Raw("SELECT id_producto, producto, categoria, proveedor, marca, precio, activo FROM vw_auditoria_productos ORDER BY id_producto").Scan(&rows).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rows)
	}
}
