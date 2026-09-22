import { Menu, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  title: string
  subtitle: string
  onMenu: () => void
  search: string
  onSearch: (v: string) => void
  onAddRecord: () => void
  canAdd: boolean
}

export function Topbar({ title, subtitle, onMenu, search, onSearch, onAddRecord, canAdd }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-paper/90 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0">
        <h1 className="truncate font-serif text-xl font-bold leading-tight">{title}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search category…"
            className="h-9 w-56 rounded-md border border-input bg-card pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {canAdd && (
          <Button onClick={onAddRecord} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" /> Add record
          </Button>
        )}
      </div>
    </header>
  )
}
