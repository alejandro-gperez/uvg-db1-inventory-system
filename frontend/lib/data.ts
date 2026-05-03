export interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
}

export interface Cliente {
  id: string
  nombre: string
  correo: string
}

export interface Venta {
  id: string
  clienteId: string
  clienteNombre: string
  productos: { productoId: string; nombre: string; cantidad: number; precio: number }[]
  total: number
  fecha: string
}

export const productos: Producto[] = [
  { id: "1", nombre: "Laptop Pro 15", precio: 1299.99, categoria: "Electrónica" },
  { id: "2", nombre: "Mouse Ergonómico", precio: 49.99, categoria: "Accesorios" },
  { id: "3", nombre: "Teclado Mecánico RGB", precio: 129.99, categoria: "Accesorios" },
  { id: "4", nombre: "Monitor 4K 27\"", precio: 449.99, categoria: "Electrónica" },
  { id: "5", nombre: "Webcam HD 1080p", precio: 79.99, categoria: "Accesorios" },
  { id: "6", nombre: "Auriculares Bluetooth", precio: 159.99, categoria: "Audio" },
  { id: "7", nombre: "Silla Gaming Pro", precio: 349.99, categoria: "Mobiliario" },
  { id: "8", nombre: "Escritorio Ajustable", precio: 599.99, categoria: "Mobiliario" },
]

export const clientes: Cliente[] = [
  { id: "1", nombre: "María García", correo: "maria.garcia@email.com" },
  { id: "2", nombre: "Carlos López", correo: "carlos.lopez@email.com" },
  { id: "3", nombre: "Ana Martínez", correo: "ana.martinez@email.com" },
  { id: "4", nombre: "Juan Rodríguez", correo: "juan.rodriguez@email.com" },
  { id: "5", nombre: "Laura Sánchez", correo: "laura.sanchez@email.com" },
]

export const ventas: Venta[] = [
  {
    id: "1",
    clienteId: "1",
    clienteNombre: "María García",
    productos: [
      { productoId: "1", nombre: "Laptop Pro 15", cantidad: 1, precio: 1299.99 },
      { productoId: "2", nombre: "Mouse Ergonómico", cantidad: 2, precio: 49.99 },
    ],
    total: 1399.97,
    fecha: "2026-05-01",
  },
  {
    id: "2",
    clienteId: "2",
    clienteNombre: "Carlos López",
    productos: [
      { productoId: "4", nombre: "Monitor 4K 27\"", cantidad: 2, precio: 449.99 },
    ],
    total: 899.98,
    fecha: "2026-05-02",
  },
  {
    id: "3",
    clienteId: "3",
    clienteNombre: "Ana Martínez",
    productos: [
      { productoId: "6", nombre: "Auriculares Bluetooth", cantidad: 1, precio: 159.99 },
      { productoId: "3", nombre: "Teclado Mecánico RGB", cantidad: 1, precio: 129.99 },
    ],
    total: 289.98,
    fecha: "2026-05-02",
  },
  {
    id: "4",
    clienteId: "4",
    clienteNombre: "Juan Rodríguez",
    productos: [
      { productoId: "7", nombre: "Silla Gaming Pro", cantidad: 1, precio: 349.99 },
      { productoId: "8", nombre: "Escritorio Ajustable", cantidad: 1, precio: 599.99 },
    ],
    total: 949.98,
    fecha: "2026-05-03",
  },
]
