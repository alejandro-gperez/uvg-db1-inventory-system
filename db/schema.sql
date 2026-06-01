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

CREATE TABLE Movimiento_Inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    motivo TEXT,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

CREATE VIEW vw_catalogo_productos AS
SELECT
    p.id_producto,
    p.nombre AS producto,
    p.precio,
    p.activo,
    c.nombre AS categoria,
    pr.nombre AS proveedor,
    ma.nombre AS marca,
    i.stock_actual,
    i.stock_minimo
FROM Producto p
JOIN Categoria c ON p.id_categoria = c.id_categoria
JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
LEFT JOIN Marca ma ON p.id_marca = ma.id_marca
LEFT JOIN Inventario i ON p.id_producto = i.id_producto;

CREATE VIEW vw_stock_bajo AS
SELECT
    id_producto,
    producto,
    categoria,
    proveedor,
    stock_actual,
    stock_minimo
FROM vw_catalogo_productos
WHERE stock_actual <= stock_minimo;

CREATE VIEW vw_reporte_ventas AS
SELECT
    v.id_venta,
    v.fecha,
    v.estado,
    c.nombre AS cliente,
    e.nombre AS empleado,
    m.nombre AS metodo_pago,
    COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0)::numeric(10,2) AS total
FROM Venta v
JOIN Cliente c ON v.id_cliente = c.id_cliente
JOIN Empleado e ON v.id_empleado = e.id_empleado
JOIN Metodo_Pago m ON v.id_metodo_pago = m.id_metodo_pago
LEFT JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
GROUP BY v.id_venta, v.fecha, v.estado, c.nombre, e.nombre, m.nombre;

CREATE VIEW vw_top_productos AS
SELECT
    p.id_producto,
    p.nombre AS producto,
    COALESCE(SUM(dv.cantidad), 0)::int AS total_vendido,
    COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0)::numeric(10,2) AS ingresos
FROM Producto p
LEFT JOIN Detalle_Venta dv ON p.id_producto = dv.id_producto
GROUP BY p.id_producto, p.nombre
ORDER BY total_vendido DESC, ingresos DESC;

CREATE VIEW vw_auditoria_ventas AS
SELECT
    id_venta,
    fecha,
    estado,
    empleado,
    metodo_pago,
    total
FROM vw_reporte_ventas;

CREATE VIEW vw_auditoria_inventario AS
SELECT
    mi.id_movimiento,
    mi.fecha,
    p.nombre AS producto,
    mi.tipo,
    mi.cantidad,
    mi.stock_anterior,
    mi.stock_nuevo,
    mi.motivo
FROM Movimiento_Inventario mi
JOIN Producto p ON mi.id_producto = p.id_producto;

CREATE VIEW vw_auditoria_productos AS
SELECT
    id_producto,
    producto,
    categoria,
    proveedor,
    marca,
    precio,
    activo
FROM vw_catalogo_productos;

-- =====================
-- STORED PROCEDURES
-- =====================

CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    IN p_id_cliente INT,
    IN p_id_empleado INT,
    IN p_id_metodo_pago INT,
    IN p_detalles JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta INT;
    v_item JSONB;
    v_id_producto INT;
    v_cantidad INT;
    v_precio NUMERIC(10,2);
    v_stock_actual INT;
BEGIN
    IF p_detalles IS NULL OR jsonb_typeof(p_detalles) <> 'array' OR jsonb_array_length(p_detalles) = 0 THEN
        ROLLBACK;
        RAISE EXCEPTION 'La venta debe incluir al menos un producto';
    END IF;

    INSERT INTO Venta (estado, id_cliente, id_empleado, id_metodo_pago)
    VALUES ('completada', p_id_cliente, p_id_empleado, p_id_metodo_pago);

    v_id_venta := currval('venta_id_venta_seq');

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_producto := (v_item ->> 'id_producto')::INT;
        v_cantidad := (v_item ->> 'cantidad')::INT;

        IF v_id_producto IS NULL OR v_cantidad IS NULL OR v_cantidad <= 0 THEN
            ROLLBACK;
            RAISE EXCEPTION 'Detalle de venta invalido: %', v_item;
        END IF;

        SELECT precio
        INTO v_precio
        FROM Producto
        WHERE id_producto = v_id_producto AND activo = TRUE;

        IF NOT FOUND THEN
            ROLLBACK;
            RAISE EXCEPTION 'Producto % no existe o esta inactivo', v_id_producto;
        END IF;

        SELECT stock_actual
        INTO v_stock_actual
        FROM Inventario
        WHERE id_producto = v_id_producto
        FOR UPDATE;

        IF NOT FOUND THEN
            ROLLBACK;
            RAISE EXCEPTION 'Producto % no tiene registro de inventario', v_id_producto;
        END IF;

        IF v_stock_actual < v_cantidad THEN
            ROLLBACK;
            RAISE EXCEPTION 'Stock insuficiente para producto %. Disponible: %, solicitado: %',
                v_id_producto, v_stock_actual, v_cantidad;
        END IF;

        INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, precio_unitario)
        VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio);

        UPDATE Inventario
        SET stock_actual = stock_actual - v_cantidad
        WHERE id_producto = v_id_producto;

        INSERT INTO Movimiento_Inventario (
            id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo
        )
        VALUES (
            v_id_producto,
            'salida_venta',
            v_cantidad,
            v_stock_actual,
            v_stock_actual - v_cantidad,
            'Venta ' || v_id_venta
        );
    END LOOP;

    COMMIT;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_cancelar_venta(
    IN p_id_venta INT,
    IN p_motivo TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado VARCHAR(50);
    v_detalle RECORD;
    v_stock_actual INT;
BEGIN
    SELECT estado
    INTO STRICT v_estado
    FROM Venta
    WHERE id_venta = p_id_venta
    FOR UPDATE;

    IF v_estado = 'cancelada' THEN
        RAISE EXCEPTION 'La venta % ya esta cancelada', p_id_venta;
    END IF;

    FOR v_detalle IN
        SELECT id_producto, cantidad
        FROM Detalle_Venta
        WHERE id_venta = p_id_venta
    LOOP
        SELECT stock_actual
        INTO v_stock_actual
        FROM Inventario
        WHERE id_producto = v_detalle.id_producto
        FOR UPDATE;

        UPDATE Inventario
        SET stock_actual = stock_actual + v_detalle.cantidad
        WHERE id_producto = v_detalle.id_producto;

        INSERT INTO Movimiento_Inventario (
            id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo
        )
        VALUES (
            v_detalle.id_producto,
            'reversion_venta',
            v_detalle.cantidad,
            v_stock_actual,
            v_stock_actual + v_detalle.cantidad,
            COALESCE(p_motivo, 'Cancelacion de venta') || ' - Venta ' || p_id_venta
        );
    END LOOP;

    UPDATE Venta
    SET estado = 'cancelada'
    WHERE id_venta = p_id_venta;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE EXCEPTION 'La venta % no existe', p_id_venta;
    WHEN OTHERS THEN
        RAISE;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_ajustar_inventario(
    IN p_id_producto INT,
    IN p_delta INT,
    IN p_motivo TEXT,
    OUT p_stock_nuevo INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INT;
BEGIN
    IF p_delta = 0 THEN
        RAISE EXCEPTION 'El ajuste no puede ser cero';
    END IF;

    SELECT stock_actual
    INTO v_stock_actual
    FROM Inventario
    WHERE id_producto = p_id_producto
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no tiene inventario', p_id_producto;
    END IF;

    IF v_stock_actual + p_delta < 0 THEN
        RAISE EXCEPTION 'El ajuste deja stock negativo para producto %', p_id_producto;
    END IF;

    UPDATE Inventario
    SET stock_actual = stock_actual + p_delta
    WHERE id_producto = p_id_producto
    RETURNING stock_actual INTO p_stock_nuevo;

    INSERT INTO Movimiento_Inventario (
        id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo
    )
    VALUES (
        p_id_producto,
        'ajuste',
        p_delta,
        v_stock_actual,
        p_stock_nuevo,
        COALESCE(p_motivo, 'Ajuste manual')
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_ingresar_inventario(
    IN p_id_producto INT,
    IN p_cantidad INT,
    IN p_motivo TEXT,
    OUT p_stock_nuevo INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INT;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad de ingreso debe ser mayor que cero';
    END IF;

    SELECT stock_actual
    INTO v_stock_actual
    FROM Inventario
    WHERE id_producto = p_id_producto
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no tiene inventario', p_id_producto;
    END IF;

    UPDATE Inventario
    SET stock_actual = stock_actual + p_cantidad
    WHERE id_producto = p_id_producto
    RETURNING stock_actual INTO p_stock_nuevo;

    INSERT INTO Movimiento_Inventario (
        id_producto, tipo, cantidad, stock_anterior, stock_nuevo, motivo
    )
    VALUES (
        p_id_producto,
        'ingreso',
        p_cantidad,
        v_stock_actual,
        p_stock_nuevo,
        COALESCE(p_motivo, 'Ingreso de inventario')
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_resumen_ventas_periodo(
    IN p_desde DATE,
    IN p_hasta DATE,
    OUT p_total_ventas INT,
    OUT p_ingresos NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR p_desde > p_hasta THEN
        RAISE EXCEPTION 'Rango de fechas invalido';
    END IF;

    SELECT
        COUNT(DISTINCT v.id_venta)::INT,
        COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0)::NUMERIC(10,2)
    INTO p_total_ventas, p_ingresos
    FROM Venta v
    LEFT JOIN Detalle_Venta dv ON v.id_venta = dv.id_venta
    WHERE v.estado = 'completada'
      AND v.fecha::DATE BETWEEN p_desde AND p_hasta;
END;
$$;

-- =====================
-- ROLES Y PERMISOS
-- =====================

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

CREATE ROLE administrador NOLOGIN;
CREATE ROLE gerente NOLOGIN;
CREATE ROLE empleado NOLOGIN;
CREATE ROLE bodeguero NOLOGIN;
CREATE ROLE auditor_externo NOLOGIN;

CREATE USER admin_test WITH PASSWORD 'secret';
CREATE USER gerente_test WITH PASSWORD 'secret';
CREATE USER empleado_test WITH PASSWORD 'secret';
CREATE USER bodeguero_test WITH PASSWORD 'secret';
CREATE USER auditor_test WITH PASSWORD 'secret';

GRANT administrador TO admin_test;
GRANT gerente TO gerente_test;
GRANT empleado TO empleado_test;
GRANT bodeguero TO bodeguero_test;
GRANT auditor_externo TO auditor_test;
GRANT administrador TO proy3;

GRANT USAGE ON SCHEMA public TO administrador, gerente, empleado, bodeguero, auditor_externo;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO administrador;

GRANT SELECT ON vista_ventas, vw_reporte_ventas, vw_top_productos, vw_stock_bajo TO gerente;
GRANT EXECUTE ON PROCEDURE sp_resumen_ventas_periodo(DATE, DATE) TO gerente;

GRANT SELECT, INSERT, UPDATE ON Cliente TO empleado;
GRANT SELECT ON Metodo_Pago, Producto, Inventario, vw_catalogo_productos, vista_ventas TO empleado;
GRANT INSERT ON Venta, Detalle_Venta, Movimiento_Inventario TO empleado;
GRANT UPDATE ON Inventario TO empleado;
GRANT USAGE, SELECT ON SEQUENCE
    cliente_id_cliente_seq,
    venta_id_venta_seq,
    detalle_venta_id_detalle_seq,
    movimiento_inventario_id_movimiento_seq
TO empleado;
GRANT EXECUTE ON PROCEDURE sp_registrar_venta(INT, INT, INT, JSONB) TO empleado;

GRANT SELECT, INSERT, UPDATE ON Producto, Inventario TO bodeguero;
GRANT SELECT ON Categoria, Marca, Proveedor, vw_catalogo_productos, vw_stock_bajo, vw_auditoria_inventario TO bodeguero;
GRANT INSERT ON Movimiento_Inventario TO bodeguero;
GRANT USAGE, SELECT ON SEQUENCE
    producto_id_producto_seq,
    inventario_id_inventario_seq,
    movimiento_inventario_id_movimiento_seq
TO bodeguero;
GRANT EXECUTE ON PROCEDURE sp_ajustar_inventario(INT, INT, TEXT) TO bodeguero;
GRANT EXECUTE ON PROCEDURE sp_ingresar_inventario(INT, INT, TEXT) TO bodeguero;

GRANT SELECT ON vw_auditoria_ventas, vw_auditoria_inventario, vw_auditoria_productos TO auditor_externo;
