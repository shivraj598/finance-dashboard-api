import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Scale,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactINR, formatINR } from "@/lib/api"
import type { DashboardSummary } from "@/lib/types"

const PIE_COLORS = [
  "#0e6b4e",
  "#e0682a",
  "#c9a227",
  "#3e9e7a",
  "#b94e1b",
  "#0a3d2e",
  "#e8a04c",
  "#7a5f0c",
  "#c93a2e",
  "#5aa88a",
]

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-")
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleString("en", { month: "short" }) + " " + String(y).slice(2)
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  loading,
}: {
  label: string
  value: string
  sub: string
  icon: typeof Scale
  iconClass: string
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-24" />
          </>
        ) : (
          <>
            <p className="font-serif text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function Overview({
  summary,
  loading,
}: {
  summary: DashboardSummary | null
  loading: boolean
}) {
  const rate =
    summary && summary.total_income > 0
      ? (summary.net_balance / summary.total_income) * 100
      : 0

  const trends = (summary?.monthly_trends ?? []).slice(-12).map((t) => ({
    ...t,
    label: monthLabel(t.month),
  }))

  const cats = [...(summary?.category_totals ?? [])]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
  const catTotal = cats.reduce((s, c) => s + c.total, 0) || 1

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total income"
          value={formatINR(summary?.total_income ?? 0)}
          sub="All time inflow"
          icon={ArrowUpRight}
          iconClass="bg-pine-100 text-pine-700"
          loading={loading}
        />
        <StatCard
          label="Total expenses"
          value={formatINR(summary?.total_expenses ?? 0)}
          sub={`Across ${summary?.category_totals.length ?? 0} categories`}
          icon={ArrowDownRight}
          iconClass="bg-ember-50 text-ember-700"
          loading={loading}
        />
        <StatCard
          label="Net balance"
          value={formatINR(summary?.net_balance ?? 0)}
          sub="Income minus expenses"
          icon={Scale}
          iconClass="bg-muted text-foreground"
          loading={loading}
        />
        <StatCard
          label="Savings rate"
          value={`${rate >= 0 ? "+" : ""}${rate.toFixed(1)}%`}
          sub="Share of income kept"
          icon={PiggyBank}
          iconClass="bg-pine-800 text-cream"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Monthly flow</CardTitle>
            <CardDescription>Income vs expenses per month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : trends.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No monthly data yet — add your first record.
              </p>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4ddcc" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e4ddcc" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => formatCompactINR(v)}
                      width={56}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatINR(Number(value ?? 0)),
                        name === "income" ? "Income" : "Expenses",
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e4ddcc",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="income"
                      stroke="#0e6b4e"
                      strokeWidth={2}
                      fill="#0e6b4e"
                      fillOpacity={0.12}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="expense"
                      stroke="#e0682a"
                      strokeWidth={2}
                      fill="#e0682a"
                      fillOpacity={0.12}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Where it goes</CardTitle>
            <CardDescription>Top categories by total</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : cats.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No category data yet.
              </p>
            ) : (
              <>
                <div className="h-[190px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cats}
                        dataKey="total"
                        nameKey="category"
                        innerRadius={58}
                        outerRadius={85}
                        paddingAngle={2}
                        strokeWidth={2}
                        stroke="#fffdf8"
                      >
                        {cats.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatINR(Number(value ?? 0))}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e4ddcc",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  {cats.slice(0, 5).map((c, i) => (
                    <div key={c.category}>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="font-medium">{c.category}</span>
                        <span className="ml-auto font-semibold">{formatINR(c.total)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${((c.total / catTotal) * 100).toFixed(1)}%`,
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest records across all time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !summary || summary.recent_records.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing here yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recent_records.slice(0, 6).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{r.date}</TableCell>
                    <TableCell>
                      <Badge variant={r.type === "income" ? "income" : "expense"}>
                        {r.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{r.category}</TableCell>
                    <TableCell
                      className={`text-right font-semibold tabular-nums ${
                        r.type === "income" ? "text-pine-600" : "text-rose-600"
                      }`}
                    >
                      {r.type === "income" ? "+" : "−"}
                      {formatINR(r.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
