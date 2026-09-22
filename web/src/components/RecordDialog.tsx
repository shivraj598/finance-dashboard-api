import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, apiFetch } from "@/lib/api"
import type { RecordType } from "@/lib/types"

export function RecordDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<RecordType>("expense")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setError(null)
      setDate(new Date().toISOString().slice(0, 10))
    }
  }, [open ])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0 || !category.trim() || !date) {
      setError("Amount, category and date are required.")
      return
    }
    setBusy(true)
    try {
      await apiFetch("/finance/", {
        method: "POST",
        body: JSON.stringify({
          amount: parsed,
          type,
          category: category.trim(),
          date,
          notes: notes.trim() || null,
        }),
      })
      setAmount("")
      setCategory("")
      setNotes("")
      onOpenChange(false)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the record.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New record</DialogTitle>
          <DialogDescription>
            Log income or an expense to your ledger.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="r-amount">Amount (₹)</Label>
              <Input
                id="r-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-type">Type</Label>
              <select
                id="r-type"
                value={type}
                onChange={(e) => setType(e.target.value as RecordType)}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="r-cat">Category</Label>
              <Input
                id="r-cat"
                placeholder="e.g. Salary, Rent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r-date">Date</Label>
              <Input
                id="r-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-notes">Notes (optional)</Label>
            <Input
              id="r-notes"
              placeholder="Any additional details…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-md border border-rose-600/25 bg-rose-600/10 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
