import {
  ArrowLeftRight,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  Plus,
  Tags,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/types"

export type View = "overview" | "records" | "team" | "profile"

const NAV: { id: View; label: string; icon: typeof LayoutDashboard; admin?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "records", label: "Records", icon: ArrowLeftRight },
  { id: "team", label: "Team", icon: UsersRound, admin: true },
  { id: "profile", label: "Profile", icon: UserRound },
]

const SECONDARY = [
  { label: "Monthly trends", icon: ChartColumn, view: "overview" as View },
  { label: "Categories", icon: Tags, view: "overview" as View },
]

interface Props {
  view: View
  onNavigate: (v: View) => void
  username: string
  email: string
  role: Role
  recordCount: number
  onAddRecord: () => void
  onLogout: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  view,
  onNavigate,
  username,
  email,
  role,
  recordCount,
  onAddRecord,
  onLogout,
  mobileOpen,
  onCloseMobile,
}: Props) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-pine-950/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-cream transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-600 font-serif text-base font-bold text-cream">
            ◈
          </span>
          <div className="leading-tight">
            <p className="font-serif text-[1.05rem] font-bold">Mintleaf</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Finance OS
            </p>
          </div>
          <button
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-1.5 pt-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <nav className="flex flex-col gap-0.5">
            {NAV.filter((n) => !n.admin || role === "admin").map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  onNavigate(n.id)
                  onCloseMobile()
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  view === n.id
                    ? "bg-pine-100 text-pine-800"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
                {n.id === "records" && recordCount > 0 && (
                  <span className="ml-auto rounded-full bg-pine-600 px-2 py-0.5 text-[0.68rem] font-bold text-white">
                    {recordCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <p className="px-2 pb-1.5 pt-5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Insights
          </p>
          <nav className="flex flex-col gap-0.5">
            {SECONDARY.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  onNavigate(s.view)
                  onCloseMobile()
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-lg border border-border bg-muted p-3.5">
            <p className="text-sm font-semibold">✦ Pro insights</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Budgets, forecasts and auto-categorization.
            </p>
          </div>
        </div>

        <div className="border-t border-border p-3">
          <button
            onClick={onAddRecord}
            className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-pine-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-pine-700 active:translate-y-px"
          >
            <Plus className="h-4 w-4" /> New record
          </button>
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine-600 text-xs font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {email} · {role}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="ml-auto cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
