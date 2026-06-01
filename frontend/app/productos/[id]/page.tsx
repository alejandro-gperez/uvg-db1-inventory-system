"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ProtectedPage } from "@/lib/auth"

type Producto = {
  id: number
  nombre: string
  precio: number
  id_categoria: number
  id_proveedor: number
  id_marca: number
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/productos")
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: Producto) => p.id == Number(id))
        setProducto(found)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="p-6">Cargando producto...</p>

  if (!producto) return <p className="p-6">Producto no encontrado</p>

  return (
    <ProtectedPage allowedRoles={["administrador", "bodeguero"]}>
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">{producto.nombre}</h1>

        <p className="text-muted-foreground">
          ID: {producto.id}
        </p>

        <p className="text-lg">
          Precio: <span className="font-semibold">${producto.precio.toFixed(2)}</span>
        </p>

        <p className="text-sm text-muted-foreground">
          Categoría ID: {producto.id_categoria}
        </p>

        <p className="text-sm text-muted-foreground">
          Proveedor ID: {producto.id_proveedor}
        </p>

        <p className="text-sm text-muted-foreground">
          Marca ID: {producto.id_marca}
        </p>
      </div>
    </ProtectedPage>
  )
}
