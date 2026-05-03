-- =====================
-- CATEGORIA
-- =====================
INSERT INTO Categoria (nombre) VALUES 
('Perfumes'),
('Ropa'),
('Accesorios');

-- =====================
-- PROVEEDOR
-- =====================
INSERT INTO Proveedor (nombre, telefono) VALUES
('Proveedor A', '1111'),
('Proveedor B', '2222'),
('Proveedor C', '3333');

-- =====================
-- MARCA
-- =====================
INSERT INTO Marca (nombre) VALUES
('Dior'),
('Nike'),
('Adidas');

-- =====================
-- CLIENTE
-- =====================
INSERT INTO Cliente (nombre, correo) VALUES
('Juan Pérez', 'juan@test.com'),
('Ana López', 'ana@test.com'),
('Carlos Ruiz', 'carlos@test.com');

-- =====================
-- EMPLEADO
-- =====================
INSERT INTO Empleado (nombre) VALUES
('Empleado 1'),
('Empleado 2'),
('Empleado 3');

-- =====================
-- METODO PAGO
-- =====================
INSERT INTO Metodo_Pago (nombre) VALUES
('Efectivo'),
('Tarjeta'),
('Transferencia');

-- =====================
-- PRODUCTO
-- =====================
INSERT INTO Producto (nombre, precio, id_categoria, id_proveedor, id_marca)
VALUES
('Perfume X', 50, 1, 1, 1),
('Camiseta Y', 25, 2, 2, 2),
('Gorra Z', 15, 3, 3, 3);

-- =====================
-- INVENTARIO
-- =====================
INSERT INTO Inventario (id_producto, stock_actual, stock_minimo)
VALUES
(1, 100, 10),
(2, 50, 5),
(3, 30, 3);