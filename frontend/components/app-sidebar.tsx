"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Info,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "About", href: "/about", icon: Info },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-sidebar-border/60 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3.5 border-b border-sidebar-border/60 px-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              StoreHub
            </span>
            <p className="text-xs text-sidebar-foreground/50">Gestión de Tienda</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Menu Principal
          </p>
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-sidebar-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-all duration-300",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/60 p-5">
          <div className="rounded-xl bg-sidebar-accent/30 p-4">
            <p className="text-xs font-medium text-sidebar-foreground/70">
              Sistema de Gestión
            </p>
            <p className="mt-0.5 text-[11px] text-sidebar-foreground/40">
              Versión 1.0.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
