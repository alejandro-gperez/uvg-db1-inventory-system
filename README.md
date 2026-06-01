# StoreHub - Project 3

### Inventory, Sales, Security and Database Management Platform

**Course:** CC3088 Bases de Datos 1
**Institution:** Universidad del Valle de Guatemala
**Student:** Alejandro Pérez

---

# Overview

StoreHub is a full-stack inventory and sales management platform developed for the **CC3088 Database Systems course**.

The application demonstrates advanced database concepts including:

* Relational schema design
* Role-based access control (RBAC)
* PostgreSQL roles and permissions
* Stored Procedures
* Transactions and rollback mechanisms
* ORM integration using GORM
* Session-based authentication
* Backend and frontend authorization
* SQL views and reporting
* Dockerized deployment

The system manages:

* Products
* Inventory
* Clients
* Sales
* Reports
* Auditing

while enforcing security and minimum-privilege principles.

---

# Technology Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Database       | PostgreSQL                                         |
| Backend        | Go, net/http, GORM                                 |
| Frontend       | Next.js, React, Tailwind CSS                       |
| Authentication | Session-based authentication with HttpOnly cookies |
| Deployment     | Docker & Docker Compose                            |

---

# Features

## Database & Security

* PostgreSQL relational schema
* Database roles with CREATE ROLE
* Principle of least privilege
* Role-specific permissions
* SQL views for reporting and auditing
* Stored procedures invoked from backend
* Explicit transaction handling
* Rollback support
* Session persistence
* Authentication and authorization

## Backend

* REST API
* GORM ORM integration
* Session middleware
* Role middleware
* CRUD operations
* Report generation
* Stored procedure execution

## Frontend

* Dashboard interface
* Inventory management
* Client management
* Sales workflow
* Reports and analytics
* Audit views
* Login and logout
* Role-aware navigation
* Route protection

---

# Setup Instructions

## Prerequisites

* Docker
* Docker Desktop
* Go 1.21+
* Node.js
* pnpm

---

## Environment Configuration

Create a `.env` file based on `.env.example`.

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

---

## Start the Application

```bash
docker compose up --build
```

---

## Services

| Service    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:8080 |
| PostgreSQL | localhost:5433        |

---

# Application Users

All application users use the password:

```text
secret
```

| Username  | Password | Role            |
| --------- | -------- | --------------- |
| admin     | secret   | administrador   |
| gerente   | secret   | gerente         |
| empleado  | secret   | empleado        |
| bodeguero | secret   | bodeguero       |
| auditor   | secret   | auditor_externo |

---

# PostgreSQL Users

These users exist exclusively to demonstrate PostgreSQL permissions and role inheritance.

| PostgreSQL User | Password | Role            |
| --------------- | -------- | --------------- |
| admin_test      | secret   | administrador   |
| gerente_test    | secret   | gerente         |
| empleado_test   | secret   | empleado        |
| bodeguero_test  | secret   | bodeguero       |
| auditor_test    | secret   | auditor_externo |

---

# Role and Permission Model

| Role            | Responsibility              |
| --------------- | --------------------------- |
| administrador   | Full system administration  |
| gerente         | Reports and analytics       |
| empleado        | Sales and client operations |
| bodeguero       | Products and inventory      |
| auditor_externo | Read-only auditing          |

---

## Detailed Permissions

| Role            | Accessible Objects                         |
| --------------- | ------------------------------------------ |
| administrador   | All tables, views and procedures           |
| gerente         | Reporting views and reporting procedures   |
| empleado        | Sales, clients, products, payment methods  |
| bodeguero       | Products, inventory, suppliers, categories |
| auditor_externo | Audit views only                           |

---

# Stored Procedures

| Procedure                 | Purpose                            |
| ------------------------- | ---------------------------------- |
| sp_registrar_venta        | Register sale and update inventory |
| sp_cancelar_venta         | Cancel sale and restore inventory  |
| sp_ajustar_inventario     | Manual stock adjustment            |
| sp_ingresar_inventario    | Inventory intake                   |
| sp_resumen_ventas_periodo | Sales summary reporting            |

---

# Authentication Architecture

Authentication uses:

* HttpOnly session cookies
* Session tokens stored hashed
* Session expiration
* Session revocation
* Backend authorization middleware

Database tables:

```text
usuario_aplicacion
sesion_aplicacion
```

Authentication endpoints:

```http
POST /auth/login
POST /auth/logout
GET  /auth/me
```

Middleware:

```text
RequireAuth
RequireRole
```

---

# API Endpoints

## Authentication

```http
POST /auth/login
POST /auth/logout
GET  /auth/me
```

---

## Products

```http
GET    /productos
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
```

---

## Clients

```http
GET    /clientes
POST   /clientes
PUT    /clientes/:id
DELETE /clientes/:id
```

---

## Sales

```http
GET  /ventas
POST /ventas
GET  /ventas/:id
POST /ventas/:id/cancelar
```

---

## Inventory

```http
POST /inventario/ingreso
POST /inventario/ajuste
```

---

## Reports

```http
GET /reportes/ventas
GET /reportes/top-productos
GET /reportes/cte
GET /reportes/productos-vendidos
GET /reportes/ventas-altas
GET /reportes/resumen
```

---

## Auditing

```http
GET /auditoria/ventas
GET /auditoria/inventario
GET /auditoria/productos
```

---

# Role Validation Guide

### Administrator

Can access:

* Products
* Inventory
* Clients
* Sales
* Reports
* Auditing

---

### Manager

Can access:

* Reports only

---

### Employee

Can access:

* Sales
* Clients

---

### Warehouse Manager

Can access:

* Products
* Inventory

---

### External Auditor

Can access:

* Auditing only

---

# Project Structure

```text
proyecto_2/
├── backend/
│   ├── auth/
│   ├── handlers/
│   ├── models/
│   └── main.go
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
│
├── db/
│   ├── schema.sql
│   └── seed.sql
│
├── docker-compose.yml
└── README.md
```

---

# Database Design

![DDL Diagram](images/ddl.png)

---

# Application Preview

![Main Page](images/mainpage.png)

---

# Validation Checklist

After running:

```bash
docker compose up --build
```

verify:

* Login works
* Logout works
* Sessions persist
* Role restrictions work
* Reports load correctly
* Stored procedures execute correctly
* Auditor cannot access operational tables
* PostgreSQL role permissions are enforced

---

# Academic Notes

This project was developed as part of **CC3088 Bases de Datos 1** and demonstrates the integration of:

* SQL DDL
* SQL DML
* Views
* Stored Procedures
* Transactions
* ORM usage
* Authentication
* Authorization
* Docker deployment
* Full-stack application development
