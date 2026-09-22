export type RecordType = "income" | "expense"
export type Role = "viewer" | "analyst" | "admin"

export interface FinancialRecord {
  id: number
  amount: number
  type: RecordType
  category: string
  date: string
  notes: string | null
  user_id: number
  version: number
  created_at: string
  updated_at: string
}

export interface PaginatedRecords {
  total: number
  page: number
  limit: number
  records: FinancialRecord[]
}

export interface CategoryTotal {
  category: string
  total: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
  net: number
}

export interface DashboardSummary {
  total_income: number
  total_expenses: number
  net_balance: number
  category_totals: CategoryTotal[]
  monthly_trends: MonthlyTrend[]
  recent_records: FinancialRecord[]
}

export interface User {
  id: number
  email: string
  username: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface Tokens {
  access_token: string
  refresh_token: string
}
