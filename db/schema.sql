-- =====================
-- TABLAS BASE
-- =====================

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Marca (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE Metodo_Pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100)
);

CREATE TABLE Empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- =====================
-- PRODUCTO
-- =====================

CREATE TABLE Producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
    id_proveedor INT NOT NULL,
    id_marca INT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor),
    FOREIGN KEY (id_marca) REFERENCES Marca(id_marca)
);

-- =====================
-- INVENTARIO
-- =====================

CREATE TABLE Inventario (
    id_inventario SERIAL PRIMARY KEY,
    id_producto INT UNIQUE,
    stock_actual INT NOT NULL,
    stock_minimo INT NOT NULL,
    
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- =====================
-- VENTA
-- =====================

CREATE TABLE Venta (
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES Empleado(id_empleado),
    FOREIGN KEY (id_metodo_pago) REFERENCES Metodo_Pago(id_metodo_pago)
);

-- =====================
-- DETALLE VENTA
-- =====================

CREATE TABLE Detalle_Venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (id_venta) REFERENCES Venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE VIEW vista_ventas AS
SELECT 
    v.id_venta,
    v.fecha,
    c.nombre AS cliente,
    e.nombre AS empleado,
    m.nombre AS metodo_pago
FROM Venta v
JOIN Cliente c ON v.id_cliente = c.id_cliente
JOIN Empleado e ON v.id_empleado = e.id_empleado
JOIN Metodo_Pago m ON v.id_metodo_pago = m.id_metodo_pago;