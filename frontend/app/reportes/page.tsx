"use client"

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
import { ventas, productos, clientes } from "@/lib/data"

const salesData = [
  { name: "Ene", ventas: 4000 },
  { name: "Feb", ventas: 3000 },
  { name: "Mar", ventas: 5000 },
  { name: "Abr", ventas: 4500 },
  { name: "May", ventas: 6000 },
]

const topProductsData = [
  { name: "Laptop Pro", ventas: 15 },
  { name: "Monitor 4K", ventas: 12 },
  { name: "Silla Gaming", ventas: 10 },
  { name: "Teclado RGB", ventas: 8 },
  { name: "Auriculares", ventas: 6 },
]

export default function ReportesPage() {
  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  const promedioVenta = totalVentas / ventas.length

  const stats = [
    {
      title: "Total Ventas",
      value: `$${totalVentas.toFixed(2)}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      ringColor: "ring-primary/20",
    },
    {
      title: "Promedio por Venta",
      value: `$${promedioVenta.toFixed(2)}`,
      change: "+8.2%",
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      ringColor: "ring-chart-2/20",
    },
    {
      title: "Productos",
      value: productos.length.toString(),
      change: "+2 nuevos",
      icon: Package,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      ringColor: "ring-chart-4/20",
    },
    {
      title: "Clientes",
      value: clientes.length.toString(),
      change: "+3 nuevos",
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
        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="group overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-chart-2" />
                      <span className="text-xs font-medium text-chart-2">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 ring-1 transition-all duration-300 group-hover:scale-105 ${stat.bgColor} ${stat.ringColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales Trend */}
          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Tendencia de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="oklch(0.72 0.14 220)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.72 0.14 220)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.26 0.01 260)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="oklch(0.62 0.01 260)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="oklch(0.62 0.01 260)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0.005 260)",
                        border: "1px solid oklch(0.26 0.01 260)",
                        borderRadius: "12px",
                        color: "oklch(0.96 0 0)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        padding: "12px 16px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Ventas"]}
                      labelStyle={{ marginBottom: "4px", fontWeight: 500 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="oklch(0.72 0.14 220)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10 ring-1 ring-chart-2/20">
                  <ShoppingCart className="h-4 w-4 text-chart-2" />
                </div>
                Top Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" barSize={20}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.26 0.01 260)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="oklch(0.62 0.01 260)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="oklch(0.62 0.01 260)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.17 0.005 260)",
                        border: "1px solid oklch(0.26 0.01 260)",
                        borderRadius: "12px",
                        color: "oklch(0.96 0 0)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        padding: "12px 16px",
                      }}
                      formatter={(value: number) => [value, "Unidades vendidas"]}
                    />
                    <Bar
                      dataKey="ventas"
                      fill="oklch(0.72 0.14 220)"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Summary */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
            <CardTitle className="text-lg font-semibold">Resumen de Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {ventas.slice(0, 5).map((venta, index) => (
                <div
                  key={venta.id}
                  className="group flex items-center justify-between rounded-xl border border-border/40 bg-background/30 p-4 transition-all duration-200 hover:border-border/60 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-all duration-300 group-hover:scale-105 ${
                      ["bg-blue-500/15 text-blue-400 ring-blue-500/30",
                       "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
                       "bg-violet-500/15 text-violet-400 ring-violet-500/30",
                       "bg-amber-500/15 text-amber-400 ring-amber-500/30",
                       "bg-rose-500/15 text-rose-400 ring-rose-500/30"][index % 5]
                    }`}>
                      <span className="text-sm font-semibold">
                        {venta.clienteNombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{venta.clienteNombre}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {venta.productos.length} producto{venta.productos.length > 1 ? "s" : ""} • {venta.fecha}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-chart-2/10 px-4 py-2 font-mono text-sm font-bold text-chart-2 ring-1 ring-chart-2/20">
                    ${venta.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
