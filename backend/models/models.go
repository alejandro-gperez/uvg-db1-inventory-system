package models

type Producto struct {
	ID          int     `gorm:"column:id_producto;primaryKey" json:"id"`
	Nombre      string  `gorm:"column:nombre" json:"nombre"`
	Precio      float64 `gorm:"column:precio" json:"precio"`
	CategoriaID int     `gorm:"column:id_categoria" json:"id_categoria"`
	ProveedorID int     `gorm:"column:id_proveedor" json:"id_proveedor"`
	MarcaID     int     `gorm:"column:id_marca" json:"id_marca"`
	Activo      bool    `gorm:"column:activo" json:"activo"`
}

func (Producto) TableName() string {
	return "producto"
}

type Cliente struct {
	ID     int    `gorm:"column:id_cliente;primaryKey" json:"id"`
	Nombre string `gorm:"column:nombre" json:"nombre"`
	Correo string `gorm:"column:correo" json:"correo"`
}

func (Cliente) TableName() string {
	return "cliente"
}

type Inventario struct {
	ID          int `gorm:"column:id_inventario;primaryKey" json:"id"`
	ProductoID  int `gorm:"column:id_producto" json:"id_producto"`
	StockActual int `gorm:"column:stock_actual" json:"stock_actual"`
	StockMinimo int `gorm:"column:stock_minimo" json:"stock_minimo"`
}

func (Inventario) TableName() string {
	return "inventario"
}
