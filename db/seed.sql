INSERT INTO Categoria (nombre) VALUES ('Perfumes'), ('Ropa');

INSERT INTO Proveedor (nombre, telefono)
VALUES ('Proveedor A', '12345678');

INSERT INTO Marca (nombre)
VALUES ('Dior'), ('Nike');

INSERT INTO Producto (nombre, precio, id_categoria, id_proveedor, id_marca)
VALUES ('Perfume X', 50.00, 1, 1, 1);

INSERT INTO Inventario (id_producto, stock_actual, stock_minimo)
VALUES (1, 100, 10);