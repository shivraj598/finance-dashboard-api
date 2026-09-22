import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError, apiFetch, formatINR } from "@/lib/api"
import type { PaginatedRecords, RecordType } from "@/lib/types"

const LIMIT = 15

interface Filters {
  type: "" | RecordType
  category: string
  from: string
  to: string
}

export function Records({
  filters,
  onFiltersChange,
  isAdmin,
  refreshKey,
  onCountChange,
  onChanged,
}: {
  filters: Filters
  onFiltersChange: (f: Filters) => void
  isAdmin: boolean
  refreshKey: number
  onCountChange: (n: number) => void
  onChanged: () => void
}) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedRecords | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(LIMIT),
        })
        if (filters.type) params.set("type", filters.type)
        if (filters.category.trim()) params.set("category", filters.category.trim())
        if (filters.from) params.set("date_from", filters.from)
        if (filters.to) params.set("date_to", filters.to)
        const res = await apiFetch<PaginatedRecords>(`/finance/?${params}`)
        if (!cancelled) {
          setData(res)
          onCountChange(res.total)
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Failed to load records.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const t = setTimeout(load, filters.category ? 350 : 0)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, refreshKey])

  // Reset to first page whenever filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  async function onDelete(id: number) {
    // Two-step inline confirm — no native dialog.
    if (confirmId !== id) {
      setConfirmId(id)
      setTimeout(() => {
        setConfirmId((current) => (current === id ? null : current))
      }, 3000)
      return
    }
    setConfirmId(null)
    setDeleting(id)
    try {
      await apiFetch(`/finance/${id}`, { method: "DELETE" })
      onChanged()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed.")
    } finally {
      setDeleting(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial records</CardTitle>
        <CardDescription>
          {data ? `${data.total} record${data.total === 1 ? "" : "s"}` : "Loading…"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[160px_1fr_160px_160px_auto]">
          <div className="grid gap-1.5">
            <Label htmlFor="f-type">Type</Label>
            <select
              id="f-type"
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({ ...filters, type: e.target.value as Filters["type"] })
              }
              className="h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="f-cat">Category</Label>
            <Input
              id="f-cat"
              placeholder="Filter by category…"
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="f-from">From</Label>
            <Input
              id="f-from"
              type="date"
              value={filters.from}
              onChange={(e) => onFiltersChange({ ...filters, from: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="f-to">To</Label>
            <Input
              id="f-to"
              type="date"
              value={filters.to}
              onChange={(e) => onFiltersChange({ ...filters, to: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ type: "", category: "", from: "", to: "" })}
            >
              Clear
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <p className="rounded-md border border-rose-600/25 bg-rose-600/10 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        ) : !data || data.records.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No records found. Try clearing the filters.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {r.date}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.type === "income" ? "income" : "expense"}>
                        {r.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{r.category}</TableCell>
                    <TableCell
                      className={`whitespace-nowrap text-right font-semibold tabular-nums ${
                        r.type === "income" ? "text-pine-600" : "text-rose-600"
                      }`}
                    >
                      {r.type === "income" ? "+" : "−"}
                      {formatINR(r.amount)}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {r.notes || "—"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant={confirmId === r.id ? "destructive" : "ghost"}
                          size={confirmId === r.id ? "sm" : "icon"}
                          onClick={() => onDelete(r.id)}
                          disabled={deleting === r.id}
                          aria-label={confirmId === r.id ? "Confirm delete" : "Delete record"}
                          className={
                            confirmId === r.id
                              ? undefined
                              : "text-muted-foreground hover:text-rose-600"
                          }
                        >
                          {confirmId === r.id ? (
                            "Confirm?"
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export type { Filters }
