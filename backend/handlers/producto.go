package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto_2/backend/models"

	"gorm.io/gorm"
)

func GetProductos(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		productos := []models.Producto{}

		if err := db.Where("activo = ?", true).
			Order("id_producto").
			Find(&productos).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productos)
	}
}

func CreateProducto(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var producto models.Producto
		if err := json.NewDecoder(r.Body).Decode(&producto); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if producto.Nombre == "" || producto.Precio <= 0 || producto.CategoriaID == 0 || producto.ProveedorID == 0 {
			http.Error(w, "nombre, precio, id_categoria e id_proveedor son requeridos", http.StatusBadRequest)
			return
		}

		producto.ID = 0
		producto.Activo = true

		if err := db.Create(&producto).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(producto)
	}
}

func UpdateProducto(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.URL.Path[len("/productos/"):])
		if err != nil || id <= 0 {
			http.Error(w, "id de producto invalido", http.StatusBadRequest)
			return
		}

		var input models.Producto
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		updates := map[string]interface{}{
			"nombre":       input.Nombre,
			"precio":       input.Precio,
			"id_categoria": input.CategoriaID,
			"id_proveedor": input.ProveedorID,
			"id_marca":     input.MarcaID,
		}

		result := db.Model(&models.Producto{}).
			Where("id_producto = ?", id).
			Updates(updates)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		if result.RowsAffected == 0 {
			http.Error(w, "producto no encontrado", http.StatusNotFound)
			return
		}

		var producto models.Producto
		if err := db.First(&producto, "id_producto = ?", id).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(producto)
	}
}

func DeleteProducto(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.URL.Path[len("/productos/"):])
		if err != nil || id <= 0 {
			http.Error(w, "id de producto invalido", http.StatusBadRequest)
			return
		}

		result := db.Model(&models.Producto{}).
			Where("id_producto = ?", id).
			Update("activo", false)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		if result.RowsAffected == 0 {
			http.Error(w, "producto no encontrado", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Producto desactivado",
		})
	}
}

func ProductosVendidos(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type ProductoVendido struct {
			Nombre string `json:"nombre"`
		}

		result := []ProductoVendido{}
		if err := db.Raw(`
			SELECT nombre
			FROM Producto
			WHERE id_producto IN (
				SELECT id_producto FROM Detalle_Venta
			)
		`).Scan(&result).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}
