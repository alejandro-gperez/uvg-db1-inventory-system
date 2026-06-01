"use client"

import { useState, useEffect } from "react"
import { Plus, ShoppingCart, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useRouter } from "next/navigation"

type Cliente = {
  id: number
  nombre: string
}

type Producto = {
  id: number
  nombre: string
  precio: number
}

type Venta = {
  id_venta: number
  total: number
}

export default function VentasPage() {
  const router = useRouter()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])

  const [loading, setLoading] = useState(true)

  const [selectedCliente, setSelectedCliente] = useState("")
  const [selectedProducto, setSelectedProducto] = useState("")
  const [cantidad, setCantidad] = useState("1")

  const [cartItems, setCartItems] = useState<
    { productoId: string; nombre: string; cantidad: number; precio: number }[]
  >([])

  // 🔥 FETCH REAL
  useEffect(() => {
    setLoading(true)

    Promise.all([
      apiFetch("/clientes").then(r => r.json()),
      apiFetch("/productos").then(r => r.json()),
      apiFetch("/reportes/ventas").then(r => r.json()),
    ])
      .then(([clientesData, productosData, ventasData]) => {
        setClientes(clientesData)
        setProductos(productosData)
        setVentas(ventasData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const addToCart = () => {
    if (!selectedProducto || !cantidad) return

    const producto = productos.find(
      (p) => p.id == Number(selectedProducto)
    )

    if (!producto) return

    const existing = cartItems.find(
      (item) => item.productoId === selectedProducto
    )

    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.productoId === selectedProducto
            ? {
                ...item,
                cantidad: item.cantidad + parseInt(cantidad),
              }
            : item
        )
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          productoId: String(producto.id),
          nombre: producto.nombre,
          cantidad: parseInt(cantidad),
          precio: producto.precio,
        },
      ])
    }

    setSelectedProducto("")
    setCantidad("1")
  }

  const removeFromCart = (productoId: string) => {
    setCartItems(cartItems.filter((item) => item.productoId !== productoId))
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  )

  // 🔥 POST REAL
  const handleCreateSale = async () => {
    if (!selectedCliente || cartItems.length === 0) return

    const payload = {
      id_cliente: Number(selectedCliente),
      id_empleado: 1,
      id_metodo_pago: 1,
      detalles: cartItems.map(item => ({
        id_producto: Number(item.productoId),
        cantidad: item.cantidad,
      })),
    }

    await apiFetch("/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // 🔥 refrescar ventas correctamente
    const nuevasVentas = await apiFetch("/reportes/ventas")
      .then(res => res.json())

    setVentas(nuevasVentas)

    setSelectedCliente("")
    setCartItems([])
  }

  if (loading) return <p className="p-6">Cargando ventas...</p>

  return (
    <DashboardLayout title="Ventas" description="Gestión de ventas" allowedRoles={["administrador", "empleado"]}>
      <div className="grid gap-8 lg:grid-cols-2">

        {/* NUEVA VENTA */}
        <Card>
          <CardHeader>
            <CardTitle>Nueva Venta</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <Select value={selectedCliente} onValueChange={setSelectedCliente}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                <SelectTrigger>
                  <SelectValue placeholder="Producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre} - ${p.precio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />

              <Button onClick={addToCart}>
                <Plus />
              </Button>
            </div>

            {cartItems.map(item => (
              <div key={item.productoId} className="flex justify-between">
                {item.nombre} x {item.cantidad}
                <Button onClick={() => removeFromCart(item.productoId)}>
                  <Trash2 />
                </Button>
              </div>
            ))}

            <div>Total: ${cartTotal.toFixed(2)}</div>

            <Button onClick={handleCreateSale}>
              Registrar Venta
            </Button>
          </CardContent>
        </Card>

        {/* TABLA */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ventas.map((v) => (
                  <TableRow
                    key={v.id_venta}
                    onClick={() => router.push(`/ventas/${v.id_venta}`)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>Venta {v.id_venta}</TableCell>
                    <TableCell>${v.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
