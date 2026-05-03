"use client"

import { useState } from "react"
import { Plus, ShoppingCart, Trash2, Receipt, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import {
  clientes,
  productos,
  ventas as initialVentas,
  type Venta,
} from "@/lib/data"

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas)
  const [selectedCliente, setSelectedCliente] = useState("")
  const [selectedProducto, setSelectedProducto] = useState("")
  const [cantidad, setCantidad] = useState("1")
  const [cartItems, setCartItems] = useState<
    { productoId: string; nombre: string; cantidad: number; precio: number }[]
  >([])

  const addToCart = () => {
    if (selectedProducto && cantidad) {
      const producto = productos.find((p) => p.id === selectedProducto)
      if (producto) {
        const existingItem = cartItems.find(
          (item) => item.productoId === selectedProducto
        )
        if (existingItem) {
          setCartItems(
            cartItems.map((item) =>
              item.productoId === selectedProducto
                ? { ...item, cantidad: item.cantidad + parseInt(cantidad) }
                : item
            )
          )
        } else {
          setCartItems([
            ...cartItems,
            {
              productoId: producto.id,
              nombre: producto.nombre,
              cantidad: parseInt(cantidad),
              precio: producto.precio,
            },
          ])
        }
        setSelectedProducto("")
        setCantidad("1")
      }
    }
  }

  const removeFromCart = (productoId: string) => {
    setCartItems(cartItems.filter((item) => item.productoId !== productoId))
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  )

  const handleCreateSale = () => {
    if (selectedCliente && cartItems.length > 0) {
      const cliente = clientes.find((c) => c.id === selectedCliente)
      const newVenta: Venta = {
        id: String(ventas.length + 1),
        clienteId: selectedCliente,
        clienteNombre: cliente?.nombre || "",
        productos: cartItems,
        total: cartTotal,
        fecha: new Date().toISOString().split("T")[0],
      }
      setVentas([newVenta, ...ventas])
      setSelectedCliente("")
      setCartItems([])
    }
  }

  return (
    <DashboardLayout
      title="Ventas"
      description="Registra nuevas ventas y visualiza el historial"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Nueva Venta */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Nueva Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Cliente Selection */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Seleccionar Cliente</Label>
              <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                <SelectTrigger className="h-11 bg-background/50 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Buscar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {cliente.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        {cliente.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Product */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Agregar Producto</Label>
              <div className="flex gap-3">
                <Select
                  value={selectedProducto}
                  onValueChange={setSelectedProducto}
                >
                  <SelectTrigger className="h-11 flex-1 bg-background/50 transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Seleccionar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{producto.nombre}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            ${producto.precio.toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="h-11 w-20 bg-background/50 text-center font-mono transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-primary/20"
                  placeholder="1"
                />
                <Button
                  onClick={addToCart}
                  variant="secondary"
                  className="h-11 w-11 shrink-0 transition-all duration-300 hover:bg-primary hover:text-primary-foreground active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cart */}
            {cartItems.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Carrito de Compras</Label>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-background/30">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.productoId}
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/30 ${
                        index !== cartItems.length - 1 ? "border-b border-border/40" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{item.nombre}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.cantidad} × ${item.precio.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold">
                          ${(item.cantidad * item.precio).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productoId)}
                          className="h-8 w-8 p-0 text-destructive/70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-4">
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                    <span className="font-mono text-lg font-bold text-primary">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleCreateSale}
              disabled={!selectedCliente || cartItems.length === 0}
              className="h-12 w-full gap-2.5 text-sm font-medium shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:shadow-none"
            >
              <Receipt className="h-4 w-4" />
              Registrar Venta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Ventas Recientes */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10 ring-1 ring-chart-2/20">
                <ShoppingCart className="h-4 w-4 text-chart-2" />
              </div>
              Ventas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Cliente</TableHead>
                    <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Fecha</TableHead>
                    <TableHead className="py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta, index) => (
                    <TableRow
                      key={venta.id}
                      className="group cursor-pointer border-border/40 transition-all duration-200 hover:bg-muted/30"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                            <span className="text-xs font-semibold text-primary">
                              {venta.clienteNombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{venta.clienteNombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-mono text-sm text-muted-foreground">
                        {venta.fecha}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <span className="rounded-lg bg-chart-2/10 px-3 py-1.5 font-mono text-sm font-bold text-chart-2 ring-1 ring-chart-2/20">
                          ${venta.total.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
