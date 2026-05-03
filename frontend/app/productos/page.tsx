"use client"

import { useState } from "react"
import { Plus, Package, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { productos as initialProductos, type Producto } from "@/lib/data"

const categorias = ["Electrónica", "Accesorios", "Audio", "Mobiliario"]

const categoryColors: Record<string, string> = {
  "Electrónica": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Accesorios": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "Audio": "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  "Mobiliario": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>(initialProductos)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    precio: "",
    categoria: "",
  })

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    if (newProduct.nombre && newProduct.precio && newProduct.categoria) {
      const product: Producto = {
        id: String(productos.length + 1),
        nombre: newProduct.nombre,
        precio: parseFloat(newProduct.precio),
        categoria: newProduct.categoria,
      }
      setProductos([...productos, product])
      setNewProduct({ nombre: "", precio: "", categoria: "" })
      setIsOpen(false)
    }
  }

  return (
    <DashboardLayout
      title="Productos"
      description="Gestiona el inventario de productos"
    >
      <div className="space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 bg-card/50 pl-11 text-sm transition-all duration-200 focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2.5 px-5 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-2.5">
                <DialogTitle className="text-xl">Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo producto al inventario de tu tienda
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="nombre" className="text-sm font-medium">Nombre del Producto</Label>
                  <Input
                    id="nombre"
                    value={newProduct.nombre}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, nombre: e.target.value })
                    }
                    placeholder="Ej: MacBook Pro 14"
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="precio" className="text-sm font-medium">Precio (USD)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={newProduct.precio}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, precio: e.target.value })
                    }
                    placeholder="0.00"
                    className="h-11 font-mono"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="categoria" className="text-sm font-medium">Categoría</Label>
                  <Select
                    value={newProduct.categoria}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, categoria: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-3 sm:gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="h-10">
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct} className="h-10 px-6">
                  Guardar Producto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-14 py-4 pl-6"></TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Nombre</TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Categoría</TableHead>
                <TableHead className="py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto, index) => (
                <TableRow
                  key={producto.id}
                  className="group cursor-pointer border-border/40 transition-all duration-200 hover:bg-muted/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/30">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium text-foreground/90">{producto.nombre}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${categoryColors[producto.categoria] || "bg-secondary text-secondary-foreground ring-secondary/50"}`}>
                      {producto.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <span className="font-mono text-sm font-semibold text-foreground/90">
                      ${producto.precio.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Empty State */}
          {filteredProductos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-2xl bg-muted/30 p-5">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">
                No se encontraron productos
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between rounded-xl bg-muted/20 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filteredProductos.length}</span> de{" "}
            <span className="font-medium text-foreground">{productos.length}</span> productos
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
