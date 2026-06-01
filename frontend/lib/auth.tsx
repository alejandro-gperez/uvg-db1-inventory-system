"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

export type Role =
  | "administrador"
  | "gerente"
  | "empleado"
  | "bodeguero"
  | "auditor_externo"

export type AuthUser = {
  id: number
  username: string
  nombre: string
  rol: Role
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const res = await apiFetch("/auth/me")
    if (!res.ok) {
      setUser(null)
      setLoading(false)
      return
    }
    setUser(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const login = async (username: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      throw new Error(await res.text())
    }
    const authenticatedUser = await res.json()
    setUser(authenticatedUser)
    return authenticatedUser
  }

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}

export function roleCanAccess(role: Role, allowedRoles: Role[]) {
  return role === "administrador" || allowedRoles.includes(role)
}

export function ProtectedPage({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[]
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
      return
    }
    if (!loading && user && !roleCanAccess(user.rol, allowedRoles)) {
      router.replace(defaultPathForRole(user.rol))
    }
  }, [allowedRoles, loading, router, user])

  if (loading || !user) {
    return <p className="p-6">Cargando sesion...</p>
  }
  if (!roleCanAccess(user.rol, allowedRoles)) {
    return <p className="p-6">Redirigiendo...</p>
  }

  return <>{children}</>
}

export function defaultPathForRole(role: Role) {
  switch (role) {
    case "gerente":
      return "/reportes"
    case "empleado":
      return "/ventas"
    case "bodeguero":
      return "/inventario"
    case "auditor_externo":
      return "/auditoria"
    default:
      return "/productos"
  }
}
