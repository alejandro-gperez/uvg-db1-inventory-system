"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// ===== TYPES =====
type VentaReporte = {
  id_venta: number
  total: number
}

type TopProducto = {
  producto: string
  total_vendido: number
}

type CTEProducto = {
  producto: string
  ingresos: number
}

type VentaView = {
  id_venta: number
  fecha: string
  cliente: string
}

// ===== PAGE =====
export default function ReportesPage() {
  const [ventas, setVentas] = useState<VentaReporte[]>([])
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [cteData, setCteData] = useState<CTEProducto[]>([])
  const [ventasView, setVentasView] = useState<VentaView[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/reportes/ventas").then(r => r.json()),
      fetch("http://localhost:8080/reportes/top-productos").then(r => r.json()),
      fetch("http://localhost:8080/reportes/cte").then(r => r.json()),
      fetch("http://localhost:8080/ventas-view").then(r => r.json()),
    ])
      .then(([ventasData, topData, cte, view]) => {
        setVentas(Array.isArray(ventasData) ? ventasData : [])
        setTopProductos(Array.isArray(topData) ? topData : [])
        setCteData(Array.isArray(cte) ? cte : [])
        setVentasView(Array.isArray(view) ? view : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="p-6">Cargando reportes...</p>

  // ===== METRICS =====
  const totalVentas = (ventas || []).reduce(
    (sum, v) => sum + (v.total || 0),
    0
  )
  const promedioVenta = ventas.length > 0 ? totalVentas / ventas.length : 0

  // ===== CHART DATA =====
  const salesData = ventas.map((v, i) => ({
    name: `V${i + 1}`,
    ventas: v.total,
  }))

  const topProductsData = topProductos.map((p) => ({
    name: p.producto,
    ventas: p.total_vendido,
  }))

  const stats = [
    {
      title: "Total Ventas",
      value: `$${totalVentas.toFixed(2)}`,
      change: "—",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      ringColor: "ring-primary/20",
    },
    {
      title: "Promedio por Venta",
      value: `$${promedioVenta.toFixed(2)}`,
      change: "—",
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      ringColor: "ring-chart-2/20",
    },
    {
      title: "Productos",
      value: topProductos.length.toString(),
      change: "—",
      icon: Package,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      ringColor: "ring-chart-4/20",
    },
    {
      title: "Ventas",
      value: ventas.length.toString(),
      change: "—",
      icon: Users,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      ringColor: "ring-chart-3/20",
    },
  ]

  return (
    <DashboardLayout
      title="Reportes"
      description="Visualiza el rendimiento de tu negocio"
    >
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="ventas" fill="#3b82f6" stroke="#3b82f6" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Productos</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={topProductsData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ventasView.slice(0, 5).map((venta) => (
                <div
                  key={venta.id_venta}
                  className="flex justify-between border p-4 rounded"
                >
                  <span>{venta.cliente}</span>
                  <span>{venta.fecha}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}