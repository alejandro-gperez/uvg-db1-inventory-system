"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"

export default function InventarioPage() {
  const [productoID, setProductoID] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [delta, setDelta] = useState("")
  const [mensaje, setMensaje] = useState("")

  const ingresar = async () => {
    const res = await apiFetch("/inventario/ingreso", {
      method: "POST",
      body: JSON.stringify({
        id_producto: Number(productoID),
        cantidad: Number(cantidad),
        motivo: "Ingreso desde UI",
      }),
    })
    const data = await res.json()
    setMensaje(res.ok ? `Stock actual: ${data.stock_actual}` : "No se pudo ingresar inventario")
  }

  const ajustar = async () => {
    const res = await apiFetch("/inventario/ajuste", {
      method: "POST",
      body: JSON.stringify({
        id_producto: Number(productoID),
        delta: Number(delta),
        motivo: "Ajuste desde UI",
      }),
    })
    const data = await res.json()
    setMensaje(res.ok ? `Stock actual: ${data.stock_actual}` : "No se pudo ajustar inventario")
  }

  return (
    <DashboardLayout
      title="Inventario"
      description="Ingresos y ajustes de stock"
      allowedRoles={["administrador", "bodeguero"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingreso de inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="ID producto" value={productoID} onChange={setProductoID} />
            <Field label="Cantidad" value={cantidad} onChange={setCantidad} />
            <Button onClick={ingresar}>Registrar ingreso</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajuste de inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="ID producto" value={productoID} onChange={setProductoID} />
            <Field label="Delta" value={delta} onChange={setDelta} />
            <Button onClick={ajustar}>Aplicar ajuste</Button>
          </CardContent>
        </Card>
      </div>
      {mensaje && <p className="mt-6 text-sm text-muted-foreground">{mensaje}</p>}
    </DashboardLayout>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
