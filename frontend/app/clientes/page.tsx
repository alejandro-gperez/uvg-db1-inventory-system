"use client"

import { useState, useEffect } from "react"
import { Plus, Users } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useRouter } from "next/navigation"

type Cliente = {
  id: number
  nombre: string
  correo: string
}

const avatarColors = [
  "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  "bg-rose-500/15 text-rose-400 ring-rose-500/30",
]

export default function ClientesPage() {
  const router = useRouter() // ✅ AQUÍ VA

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    correo: "",
  })

  useEffect(() => {
    apiFetch("/clientes")
      .then(res => res.json())
      .then(data => {
        setClientes(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCliente = async () => {
    if (!newCliente.nombre || !newCliente.correo) return

    try {
      const res = await apiFetch("/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCliente),
      })

      const data = await res.json()

      setClientes([...clientes, data])
      setNewCliente({ nombre: "", correo: "" })
      setIsOpen(false)

    } catch (err) {
      console.error(err)
    }
  }

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length]
  }

  if (loading) return <p className="p-6">Cargando clientes...</p>

  return (
    <DashboardLayout title="Clientes" description="Administra clientes" allowedRoles={["administrador", "empleado"]}>
      <div className="space-y-8">

        <div className="flex justify-between gap-4">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <Plus size={16} /> Nuevo
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Nuevo Cliente</DialogTitle>

              <Input
                value={newCliente.nombre}
                onChange={(e) =>
                  setNewCliente({ ...newCliente, nombre: e.target.value })
                }
                placeholder="Nombre"
              />

              <Input
                value={newCliente.correo}
                onChange={(e) =>
                  setNewCliente({ ...newCliente, correo: e.target.value })
                }
                placeholder="Correo"
              />

              <Button onClick={handleAddCliente}>
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
              <TableHead>Correo</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredClientes.map((cliente, index) => (
              <TableRow
                key={cliente.id}
                onClick={() => router.push(`/clientes/${cliente.id}`)}
                className="cursor-pointer hover:bg-muted/30"
              >
                <TableCell>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(index)}`}>
                    {cliente.nombre[0]}
                  </div>
                </TableCell>

                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.correo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredClientes.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No hay clientes
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
