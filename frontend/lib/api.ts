export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })
}
