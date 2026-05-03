"use client"

import { useState } from "react"
import { Plus, Users, Search, Mail, User } from "lucide-react"
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
import { clientes as initialClientes, type Cliente } from "@/lib/data"

const avatarColors = [
  "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  "bg-rose-500/15 text-rose-400 ring-rose-500/30",
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    correo: "",
  })

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCliente = () => {
    if (newCliente.nombre && newCliente.correo) {
      const cliente: Cliente = {
        id: String(clientes.length + 1),
        nombre: newCliente.nombre,
        correo: newCliente.correo,
      }
      setClientes([...clientes, cliente])
      setNewCliente({ nombre: "", correo: "" })
      setIsOpen(false)
    }
  }

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length]
  }

  return (
    <DashboardLayout
      title="Clientes"
      description="Administra la información de tus clientes"
    >
      <div className="space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 bg-card/50 pl-11 text-sm transition-all duration-200 focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2.5 px-5 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-2.5">
                <DialogTitle className="text-xl">Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo cliente a tu base de datos
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="nombre" className="text-sm font-medium">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="nombre"
                      value={newCliente.nombre}
                      onChange={(e) =>
                        setNewCliente({ ...newCliente, nombre: e.target.value })
                      }
                      placeholder="Juan Pérez"
                      className="h-11 pl-11"
                    />
                  </div>
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="correo" className="text-sm font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="correo"
                      type="email"
                      value={newCliente.correo}
                      onChange={(e) =>
                        setNewCliente({ ...newCliente, correo: e.target.value })
                      }
                      placeholder="juan@ejemplo.com"
                      className="h-11 pl-11"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3 sm:gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="h-10">
                  Cancelar
                </Button>
                <Button onClick={handleAddCliente} className="h-10 px-6">
                  Guardar Cliente
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
                <TableHead className="py-4 pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Correo Electrónico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente, index) => (
                <TableRow
                  key={cliente.id}
                  className="group cursor-pointer border-border/40 transition-all duration-200 hover:bg-muted/30"
                >
                  <TableCell className="py-4 pl-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-all duration-300 group-hover:scale-105 ${getAvatarColor(index)}`}>
                      <span className="text-sm font-semibold">
                        {cliente.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium text-foreground/90">{cliente.nombre}</span>
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-sm">{cliente.correo}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Empty State */}
          {filteredClientes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-2xl bg-muted/30 p-5">
                <Users className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">
                No se encontraron clientes
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
            Mostrando <span className="font-medium text-foreground">{filteredClientes.length}</span> de{" "}
            <span className="font-medium text-foreground">{clientes.length}</span> clientes
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
