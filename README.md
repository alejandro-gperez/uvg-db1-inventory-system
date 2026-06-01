# StoreHub - Proyecto 3

Sistema full-stack para gestión de tienda con PostgreSQL, Go, GORM, Next.js y Docker. El Proyecto 3 incorpora ORM, roles de base de datos, permisos por mínimo privilegio, stored procedures, autenticación con sesiones y protección por rol en backend y frontend.

# Cómo iniciar el proyecto

1. Crear el archivo `.env` desde `.env.example`.
2. Verificar las credenciales requeridas:

```env
POSTGRES_USER=proy3
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda
DB_USER=proy3
DB_PASSWORD=secret
DB_NAME=tienda
DB_SSLMODE=disable
NEXT_PUBLIC_API_URL=http://localhost:8080
CORS_ALLOWED_ORIGIN=http://localhost:3000
```

3. Levantar todos los servicios:

```bash
docker compose up
```

Servicios:

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

# Usuarios de Prueba

Usuarios de aplicación para login web:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| admin | secret | administrador |
| gerente | secret | gerente |
| empleado | secret | empleado |
| bodeguero | secret | bodeguero |
| auditor | secret | auditor_externo |

Usuarios PostgreSQL para demostrar permisos de base de datos:

| Usuario PostgreSQL | Contraseña | Rol PostgreSQL |
| --- | --- | --- |
| admin_test | secret | administrador |
| gerente_test | secret | gerente |
| empleado_test | secret | empleado |
| bodeguero_test | secret | bodeguero |
| auditor_test | secret | auditor_externo |

# Esquema de Roles y Permisos

| Rol | Responsabilidad | Tablas accesibles | Vistas accesibles | Permisos permitidos | Stored procedures permitidos |
| --- | --- | --- | --- | --- | --- |
| administrador | Administración completa del sistema | Todas las tablas | Todas las vistas | SELECT, INSERT, UPDATE, DELETE, EXECUTE | Todos |
| gerente | Consulta de métricas y reportes | Sin acceso directo operativo amplio | vista_ventas, vw_reporte_ventas, vw_top_productos, vw_stock_bajo | SELECT sobre vistas, EXECUTE limitado | sp_resumen_ventas_periodo |
| empleado | Gestión operativa de ventas y clientes | Cliente, Venta, Detalle_Venta, Metodo_Pago, Producto, Inventario, Movimiento_Inventario | vista_ventas, vw_catalogo_productos | SELECT/INSERT/UPDATE necesarios para ventas y clientes; sin administración de usuarios | sp_registrar_venta |
| bodeguero | Gestión de productos e inventario | Producto, Inventario, Movimiento_Inventario, Categoria, Marca, Proveedor | vw_catalogo_productos, vw_stock_bajo, vw_auditoria_inventario | SELECT/INSERT/UPDATE necesarios para inventario; sin ventas ni usuarios | sp_ajustar_inventario, sp_ingresar_inventario |
| auditor_externo | Auditoría de solo lectura | Ninguna tabla operativa directa | vw_auditoria_ventas, vw_auditoria_inventario, vw_auditoria_productos | Solo SELECT sobre vistas de auditoría | Ninguno |

El acceso del auditor externo se revoca o expira desactivando el usuario de aplicación, asignando `expires_at`, revocando sesiones en `sesion_aplicacion` o ejecutando `REVOKE auditor_externo FROM auditor_test` en PostgreSQL.

# Stored Procedures implementados

| Procedure | Propósito | Característica evaluable |
| --- | --- | --- |
| sp_registrar_venta | Registra venta, detalle y descuenta inventario | Transacción explícita y rollback |
| sp_cancelar_venta | Cancela venta y repone inventario | Manejo de excepciones |
| sp_ajustar_inventario | Aplica ajuste positivo o negativo de stock | IN/OUT con stock resultante |
| sp_ingresar_inventario | Registra ingreso de unidades a inventario | IN/OUT con stock resultante |
| sp_resumen_ventas_periodo | Resume ventas por rango de fechas | Reporte de negocio invocable desde backend |

El backend invoca los procedimientos con SQL explícito desde handlers donde corresponde, manteniendo GORM para CRUD simple.

# Arquitectura de autenticación

La autenticación usa sesiones tradicionales con cookie `HttpOnly`.

| Componente | Responsabilidad |
| --- | --- |
| usuario_aplicacion | Usuarios que inician sesión en la aplicación |
| sesion_aplicacion | Tokens de sesión hasheados, expiración y revocación |
| POST /auth/login | Valida credenciales, crea sesión y envía cookie |
| POST /auth/logout | Revoca sesión y limpia cookie |
| GET /auth/me | Devuelve el usuario autenticado actual |
| RequireAuth | Rechaza peticiones sin sesión válida |
| RequireRole | Autoriza endpoints según rol |
| AuthProvider | Mantiene sesión en frontend consultando `/auth/me` |
| ProtectedPage | Protege páginas y redirige según rol |

El backend es la fuente real de autorización. El filtrado del sidebar solo mejora la experiencia visual.

# Cómo probar cada rol

1. Entrar a http://localhost:3000/login.
2. Iniciar sesión con `admin / secret` y verificar acceso a productos, inventario, ventas, clientes, reportes y auditoría.
3. Iniciar sesión con `gerente / secret` y verificar acceso solo a reportes.
4. Iniciar sesión con `empleado / secret` y verificar acceso a ventas y clientes.
5. Iniciar sesión con `bodeguero / secret` y verificar acceso a productos e inventario.
6. Iniciar sesión con `auditor / secret` y verificar acceso únicamente a auditoría.
7. Intentar abrir manualmente una ruta no permitida para cada rol y verificar redirección o error 403 desde backend.
8. Presionar Salir y verificar que `/auth/me` responda no autenticado.

# Endpoints principales

| Área | Endpoints |
| --- | --- |
| Auth | POST /auth/login, POST /auth/logout, GET /auth/me |
| Productos | GET/POST /productos, PUT/DELETE /productos/:id |
| Clientes | GET/POST /clientes, PUT/DELETE /clientes/:id |
| Ventas | GET/POST /ventas, GET /ventas/:id, POST /ventas/:id/cancelar |
| Inventario | POST /inventario/ingreso, POST /inventario/ajuste |
| Reportes | /reportes/ventas, /reportes/top-productos, /reportes/cte, /reportes/productos-vendidos, /reportes/ventas-altas, /reportes/resumen |
| Auditoría | /auditoria/ventas, /auditoria/inventario, /auditoria/productos |

# Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Base de datos | PostgreSQL |
| Backend | Go, net/http, GORM |
| Frontend | Next.js, React, Tailwind CSS |
| Despliegue | Docker Compose |

# Estructura del proyecto

```text
proyecto_2/
├── backend/          # API Go, GORM, auth y handlers
├── frontend/         # Aplicación Next.js
├── db/               # Schema, roles, vistas, stored procedures y seed
├── docker-compose.yml
└── README.md
```
