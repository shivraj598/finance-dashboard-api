import { useCallback, useEffect, useState } from "react"
import { AuthProvider, useAuth } from "@/auth"
import { RecordDialog } from "@/components/RecordDialog"
import { Sidebar, type View } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"
import { Login } from "@/pages/Login"
import { Overview } from "@/pages/Overview"
import { Records, type Filters } from "@/pages/Records"
import { Profile } from "@/pages/Profile"
import { Team } from "@/pages/Team"
import { ApiError, apiFetch } from "@/lib/api"
import type { DashboardSummary } from "@/lib/types"

const TITLES: Record<View, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Your money at a glance",
  },
  records: {
    title: "Records",
    subtitle: "Every rupee, accounted for",
  },
  team: { title: "Team", subtitle: "Workspace members and roles" },
  profile: { title: "Profile", subtitle: "Account and sessions" },
}

function Shell() {
  const { user, loading: authLoading, logout } = useAuth()
  const [view, setView] = useState<View>("overview")
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [recordCount, setRecordCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    type: "",
    category: "",
    from: "",
    to: "",
  })

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const s = await apiFetch<DashboardSummary>("/dashboard/summary")
      setSummary(s)
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error(err)
      }
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) void loadSummary()
  }, [user, loadSummary, refreshKey])

  const refreshAll = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!user) return <Login />

  const isAdmin = user.role === "admin"

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-pine-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar
        view={view}
        onNavigate={setView}
        username={user.username}
        email={user.email}
        role={user.role}
        recordCount={recordCount}
        onAddRecord={() => setDialogOpen(true)}
        onLogout={() => void logout()}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={view === "overview" ? `Good day, ${user.username}` : TITLES[view].title}
          subtitle={TITLES[view].subtitle}
          onMenu={() => setMobileOpen(true)}
          search={filters.category}
          onSearch={(v) => {
            setFilters((f) => ({ ...f, category: v }))
            if (view !== "records") setView("records")
          }}
          onAddRecord={() => setDialogOpen(true)}
          canAdd={isAdmin}
        />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
          {view === "overview" && (
            <Overview summary={summary} loading={summaryLoading} />
          )}
          {view === "records" && (
            <Records
              filters={filters}
              onFiltersChange={setFilters}
              isAdmin={isAdmin}
              refreshKey={refreshKey}
              onCountChange={setRecordCount}
              onChanged={refreshAll}
            />
          )}
          {view === "team" && isAdmin && <Team />}
          {view === "profile" && <Profile />}
        </main>
      </div>
      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={refreshAll}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
