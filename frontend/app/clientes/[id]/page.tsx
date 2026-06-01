"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ProtectedPage } from "@/lib/auth"

export default function ClienteDetalle() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<any>(null)

  useEffect(() => {
    apiFetch("/clientes")
      .then(res => res.json())
      .then(data => {
        const found = data.find((c:any) => c.id == id)
        setCliente(found)
      })
  }, [id])

  if (!cliente) return <p>Cargando...</p>

  return (
    <ProtectedPage allowedRoles={["administrador", "empleado"]}>
      <div className="p-6">
        <h1>{cliente.nombre}</h1>
        <p>{cliente.correo}</p>
      </div>
    </ProtectedPage>
  )
}
