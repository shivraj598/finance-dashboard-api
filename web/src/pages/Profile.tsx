import { useEffect, useState } from "react"
import { useAuth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, apiFetch } from "@/lib/api"

interface Session {
  id: number
  ip_address: string | null
  user_agent: string | null
  expires_at: string
  revoked: boolean
  created_at: string
}

export function Profile() {
  const { user, logout } = useAuth()
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiFetch<Session[]>("/auth/sessions")
      .then((s) => {
        if (!cancelled) setSessions(s)
      })
      .catch(() => {
        if (!cancelled) setSessions([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function logoutEverywhere() {
    // Two-step inline confirm — no native dialog.
    if (!confirmAll) {
      setConfirmAll(true)
      setTimeout(() => setConfirmAll(false), 3000)
      return
    }
    setConfirmAll(false)
    setBusy(true)
    try {
      await apiFetch("/auth/logout-all", { method: "POST" })
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed.")
    } finally {
      setBusy(false)
    }
    await logout()
  }

  if (!user) return null

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-pine-600 text-base font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge
              variant={user.role === "admin" ? "outline" : "secondary"}
              className="ml-auto"
            >
              {user.role}
            </Badge>
          </div>
          <Separator className="my-4" />
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-medium">#{user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant="income">Active</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            {sessions === null
              ? "Loading…"
              : `${sessions.length} signed-in device${sessions.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessions === null && <Skeleton className="h-24 w-full" />}
          {sessions !== null && sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">No active sessions.</p>
          )}
          {sessions?.map((s) => (
            <div
              key={s.id}
              className="rounded-md border border-border px-3 py-2.5 text-sm"
            >
              <p className="font-medium">{s.ip_address || "Unknown IP"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.user_agent || "Unknown device"}
              </p>
            </div>
          ))}
          <div className="mt-1 flex gap-2">
            <Button variant="outline" onClick={logoutEverywhere} disabled={busy}>
              {busy ? "Please wait…" : confirmAll ? "Click again to confirm" : "Sign out everywhere"}
            </Button>
            <Button variant="destructive" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
