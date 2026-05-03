"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Store, Code, Database, Palette, Zap, Shield, Package, ShoppingCart, Users, BarChart3, Sparkles } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Gestión de Productos",
    description:
      "Administra tu inventario de manera eficiente con categorías, precios y búsqueda avanzada.",
    color: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Sistema de Ventas",
    description:
      "Registra ventas de forma rápida con carrito de compras intuitivo y seguimiento de historial.",
    color: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  {
    icon: Users,
    title: "Base de Clientes",
    description:
      "Mantén un registro organizado de todos tus clientes con información de contacto.",
    color: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "Reportes Detallados",
    description:
      "Visualiza el rendimiento de tu negocio con gráficos y estadísticas en tiempo real.",
    color: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  },
]

const techStack = [
  { icon: Code, name: "Next.js 16", description: "Framework React moderno", color: "bg-foreground/5 text-foreground ring-foreground/10" },
  { icon: Palette, name: "Tailwind CSS", description: "Estilos utilitarios", color: "bg-sky-500/10 text-sky-400 ring-sky-500/20" },
  { icon: Zap, name: "TypeScript", description: "Tipado estático", color: "bg-blue-500/10 text-blue-400 ring-blue-500/20" },
  { icon: Shield, name: "shadcn/ui", description: "Componentes accesibles", color: "bg-foreground/5 text-foreground ring-foreground/10" },
]

export default function AboutPage() {
  return (
    <DashboardLayout
      title="About"
      description="Información sobre el sistema de gestión"
    >
      <div className="space-y-10">
        {/* Hero Card */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardContent className="p-0">
            {/* Header with gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-8 py-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30 ring-4 ring-primary/20">
                  <Store className="h-9 w-9 text-primary-foreground" />
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-balance">StoreHub</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Sistema de Gestión de Tienda
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="border-t border-border/40 px-8 py-8">
              <p className="mx-auto max-w-2xl text-center leading-relaxed text-muted-foreground">
                StoreHub es una solución integral para la gestión de tu negocio.
                Diseñado con una interfaz moderna e intuitiva, te permite
                administrar productos, registrar ventas, gestionar clientes y
                visualizar reportes detallados de manera eficiente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Características Principales</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${feature.color}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 ring-1 ring-chart-2/20">
              <Code className="h-4 w-4 text-chart-2" />
            </div>
            <h3 className="text-lg font-semibold">Tecnologías Utilizadas</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {techStack.map((tech, index) => (
              <Card
                key={tech.name}
                className="group overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105 ${tech.color}`}>
                    <tech.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tech.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Version Info Card */}
        <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/60">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">StoreHub v1.0.0</p>
                  <p className="text-sm text-muted-foreground">
                    Sistema de Gestión de Tienda
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/30 px-5 py-3 text-center sm:text-right">
                <p className="text-xs text-muted-foreground">Desarrollado por</p>
                <p className="mt-0.5 font-semibold">Alejandro Pérez</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
