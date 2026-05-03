-- =====================
-- CATEGORIA
-- =====================
INSERT INTO Categoria (nombre)
VALUES ('Electrónica'), ('Ropa'), ('Hogar'), ('Deportes');

-- =====================
-- PROVEEDOR
-- =====================
INSERT INTO Proveedor (nombre, telefono)
SELECT 
  'Proveedor ' || i,
  '555-000' || i
FROM generate_series(1, 20) AS i;

-- =====================
-- MARCA
-- =====================
INSERT INTO Marca (nombre)
SELECT 
  'Marca ' || i
FROM generate_series(1, 20) AS i;
-- =====================
-- CLIENTE
-- =====================
INSERT INTO Cliente (nombre, correo)
SELECT 
  'Cliente ' || i,
  'cliente' || i || '@correo.com'
FROM generate_series(1, 100) AS i;

-- =====================
-- EMPLEADO
-- =====================
INSERT INTO Empleado (nombre)
SELECT 
  'Empleado ' || i
FROM generate_series(1, 10) AS i;

-- =====================
-- METODO PAGO
-- =====================
INSERT INTO Metodo_Pago (nombre)
VALUES ('Efectivo'), ('Tarjeta'), ('Transferencia');

-- =====================
-- PRODUCTO
-- =====================
INSERT INTO Producto (nombre, precio, id_categoria, id_proveedor, id_marca)
SELECT 
  'Producto ' || i,
  (random() * 100 + 10)::numeric(10,2),
  (random() * 3 + 1)::int,
  (random() * 19 + 1)::int,
  (random() * 19 + 1)::int
FROM generate_series(1, 100) AS i;

-- =====================
-- INVENTARIO
-- =====================
INSERT INTO Inventario (id_producto, stock_actual, stock_minimo)
SELECT 
  id_producto,
  (random() * 100)::int,
  5
FROM Producto;