"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"

type Row = Record<string, unknown>

export default function AuditoriaPage() {
  const [ventas, setVentas] = useState<Row[]>([])
  const [inventario, setInventario] = useState<Row[]>([])
  const [productos, setProductos] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch("/auditoria/ventas").then((res) => res.json()),
      apiFetch("/auditoria/inventario").then((res) => res.json()),
      apiFetch("/auditoria/productos").then((res) => res.json()),
    ])
      .then(([ventasData, inventarioData, productosData]) => {
        setVentas(ventasData)
        setInventario(inventarioData)
        setProductos(productosData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-6">Cargando auditoria...</p>

  return (
    <DashboardLayout
      title="Auditoría"
      description="Consulta de solo lectura para auditor externo"
      allowedRoles={["administrador", "auditor_externo"]}
    >
      <div className="space-y-6">
        <AuditTable title="Ventas" rows={ventas} />
        <AuditTable title="Inventario" rows={inventario} />
        <AuditTable title="Productos" rows={productos} />
      </div>
    </DashboardLayout>
  )
}

function AuditTable({ title, rows }: { title: string; rows: Row[] }) {
  const columns = rows[0] ? Object.keys(rows[0]) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 10).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{String(row[column] ?? "")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
