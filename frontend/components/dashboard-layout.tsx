"use client"

import { AppSidebar } from "./app-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-72 min-h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="px-10 py-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="px-10 py-8">{children}</div>
      </main>
      
      {/* Footer */}
      <footer className="ml-72 border-t border-border/60 bg-background/50 px-10 py-5">
        <p className="text-center text-sm text-muted-foreground/70">
          © 2026 Alejandro Pérez
        </p>
      </footer>
    </div>
  )
}
