"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VentaDetalle() {
  const { id } = useParams()
  const router = useRouter()

  const [venta, setVenta] = useState<any>(null)

  useEffect(() => {
    fetch("http://localhost:8080/reportes/ventas")
      .then(res => res.json())
      .then(data => {
        const found = data.find((v:any) => v.id_venta == id)
        setVenta(found)
      })
  }, [id])

  if (!venta) return <p className="p-6">Cargando venta...</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Venta #{venta.id_venta}</h1>

      <p>Total: ${venta.total.toFixed(2)}</p>

      <button
        onClick={() => router.push("/ventas")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Volver
      </button>
    </div>
  )
}