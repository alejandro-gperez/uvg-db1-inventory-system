package models

import "time"

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

type UsuarioAplicacion struct {
	ID           int        `gorm:"column:id_usuario;primaryKey" json:"id"`
	Username     string     `gorm:"column:username;uniqueIndex" json:"username"`
	PasswordHash string     `gorm:"column:password_hash" json:"-"`
	Nombre       string     `gorm:"column:nombre" json:"nombre"`
	Rol          string     `gorm:"column:rol" json:"rol"`
	Activo       bool       `gorm:"column:activo" json:"activo"`
	ExpiresAt    *time.Time `gorm:"column:expires_at" json:"expires_at,omitempty"`
	CreatedAt    time.Time  `gorm:"column:created_at" json:"created_at"`
}

func (UsuarioAplicacion) TableName() string {
	return "usuario_aplicacion"
}

type SesionAplicacion struct {
	ID        int               `gorm:"column:id_sesion;primaryKey" json:"id"`
	UsuarioID int               `gorm:"column:id_usuario" json:"id_usuario"`
	TokenHash string            `gorm:"column:token_hash;uniqueIndex" json:"-"`
	CreatedAt time.Time         `gorm:"column:created_at" json:"created_at"`
	ExpiresAt time.Time         `gorm:"column:expires_at" json:"expires_at"`
	RevokedAt *time.Time        `gorm:"column:revoked_at" json:"revoked_at,omitempty"`
	Usuario   UsuarioAplicacion `gorm:"foreignKey:UsuarioID;references:ID" json:"usuario"`
}

func (SesionAplicacion) TableName() string {
	return "sesion_aplicacion"
}
