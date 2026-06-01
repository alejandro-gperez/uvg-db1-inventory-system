"use client"

import { useState, useEffect } from "react"
import { Plus, Package, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiFetch } from "@/lib/api"
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

import { useRouter } from "next/navigation"

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

type Producto = {
  id: number
  nombre: string
  precio: number
  id_categoria: number
  id_proveedor: number
  id_marca: number
}

const categorias = ["Electrónica", "Accesorios", "Audio", "Mobiliario"]

const categoryColors: Record<string, string> = {
  "Electrónica": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Accesorios": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "Audio": "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  "Mobiliario": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
}

export default function ProductosPage() {

  const router = useRouter() // ✅ AQUÍ

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    precio: "",
    categoria: "",
  })

  useEffect(() => {
    setLoading(true)

    apiFetch("/productos")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

  }, [])

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id_categoria).includes(searchTerm)
  )

  const handleAddProduct = async () => {
    if (newProduct.nombre && newProduct.precio) {
      const res = await apiFetch("/productos", {
        method: "POST",
        body: JSON.stringify({
          nombre: newProduct.nombre,
          precio: parseFloat(newProduct.precio),
          id_categoria: 1,
          id_proveedor: 1,
          id_marca: 1,
        }),
      })
      const product = await res.json()
      setProductos([...productos, product])
      setNewProduct({ nombre: "", precio: "", categoria: "" })
      setIsOpen(false)
    }
  }

  if (loading) return <p className="p-6">Cargando productos...</p>

  return (
    <DashboardLayout
      title="Productos"
      description="Gestiona el inventario de productos"
      allowedRoles={["administrador", "bodeguero"]}
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Agregar Producto
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Nuevo Producto</DialogTitle>

              <Input
                value={newProduct.nombre}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, nombre: e.target.value })
                }
                placeholder="Nombre"
              />

              <Input
                value={newProduct.precio}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, precio: e.target.value })
                }
                placeholder="Precio"
              />

              <Button onClick={handleAddProduct}>
                Guardar
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProductos.map((producto) => (
              <TableRow
                key={producto.id}
                onClick={() => router.push(`/productos/${producto.id}`)}
                className="cursor-pointer hover:bg-muted/30"
              >
                <TableCell>
                  <Package />
                </TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.id_categoria}</TableCell>
                <TableCell>${producto.precio.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  )
}
