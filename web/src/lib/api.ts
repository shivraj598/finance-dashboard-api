const API = "/api/v1"

function getAccessToken() {
  return localStorage.getItem("access_token")
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem("access_token", data.access_token)
    return true
  } catch {
    return false
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 401 && retry) {
    const ok = await refreshAccessToken()
    if (ok) return apiFetch<T>(path, options, false)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.dispatchEvent(new CustomEvent("auth:expired"))
    throw new ApiError(401, "Session expired. Please sign in again.")
  }

  if (res.status === 204) return undefined as T

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const d = data as { detail?: unknown } | null
    const detail = d?.detail
    const message = Array.isArray(detail)
      ? detail.map((e) => (e as { msg?: string }).msg ?? "Invalid input").join(" ")
      : typeof detail === "string"
        ? detail
        : `Request failed (${res.status})`
    throw new ApiError(res.status, message)
  }
  return data as T
}

export function formatINR(n: number): string {
  return (
    "₹" +
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatCompactINR(n: number): string {
  if (Math.abs(n) >= 100000) return "₹" + (n / 100000).toFixed(1) + "L"
  if (Math.abs(n) >= 1000) return "₹" + (n / 1000).toFixed(1) + "k"
  return "₹" + n.toFixed(0)
}
