import { useState } from "react"
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useAuth } from "@/auth"
import { ApiError } from "@/lib/api"
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
import { cn } from "@/lib/utils"

function LedgerPreview() {
  const rows = [
    { label: "Salary · Acme Studio", amount: "+₹82,400.00", income: true },
    { label: "Rent · September", amount: "−₹24,000.00", income: false },
    { label: "Groceries · Big Bazaar", amount: "−₹6,430.50", income: false },
  ]
  return (
    <div className="rounded-xl border border-white/10 bg-cream p-5 text-foreground shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            September net
          </p>
          <p className="font-serif text-3xl font-bold tabular-nums">+₹51,969.50</p>
        </div>
        <span className="rounded-md bg-pine-100 px-2.5 py-1 text-xs font-bold tabular-nums text-pine-800">
          +18.6%
        </span>
      </div>
      <svg viewBox="0 0 200 56" className="mt-3 h-14 w-full" aria-hidden="true">
        <path
          d="M0,44 C20,40 30,30 45,32 S70,44 85,36 S110,14 130,18 S160,34 180,22 L200,16 L200,56 L0,56 Z"
          fill="#0e6b4e"
          fillOpacity="0.1"
        />
        <path
          d="M0,44 C20,40 30,30 45,32 S70,44 85,36 S110,14 130,18 S160,34 180,22 L200,16"
          fill="none"
          stroke="#0e6b4e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                r.income ? "text-pine-600" : "text-rose-600"
              )}
            >
              {r.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [identifier, setIdentifier] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === "login") {
        await login(identifier, password)
      } else {
        await register(email.trim(), username.trim(), password)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login")
    setError(null)
    setShowPassword(false)
  }

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* ── Brand panel ── */}
      <section
        aria-label="About Mintleaf"
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-pine-900 p-10 text-[#f5f1e8] lg:flex xl:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(245,241,232,0.7) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine-600 font-serif text-lg font-bold text-white">
            ◈
          </span>
          <span className="font-serif text-xl font-bold">Mintleaf</span>
          <span className="ml-1 rounded-md border border-white/15 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider text-[#b9c4bd]">
            Finance OS
          </span>
        </div>

        <div className="relative mt-10">
          <h1 className="max-w-[16ch] text-balance font-serif text-[2.75rem] font-bold leading-[1.02]">
            Clarity for <em className="text-pine-100">every rupee.</em>
          </h1>
          <p className="mt-4 max-w-[42ch] leading-relaxed text-[#b9c4bd]">
            Mintleaf turns scattered income and spending into one calm ledger
            you will actually open.
          </p>

          <div className="mt-8 max-w-md">
            <LedgerPreview />
          </div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6">
            {[
              ["₹4.2L", "tracked monthly"],
              ["18.6%", "avg. savings lift"],
              ["15 min", "token lifetime"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-xl font-bold tabular-nums text-cream">
                  {value}
                </dd>
                <dd className="mt-0.5 text-xs text-[#8b968f]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative mt-10 max-w-md rounded-xl border border-white/10 bg-white/5 p-4">
          <blockquote className="text-sm leading-relaxed text-[#e6e2d4]">
            “I check it with morning coffee. Two minutes, zero dread — my rent,
            SIPs and spending, all in one glance.”
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-600 text-xs font-bold text-white">
              ST
            </span>
            <span className="text-xs">
              <span className="block font-semibold">Shivraj Timilsena</span>
              <span className="text-[#8b968f]">Lalitpur, Nepal</span>
            </span>
          </figcaption>
        </figure>
      </section>

      {/* ── Form side ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(#d9d1bc 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(70% 60% at 50% 40%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(70% 60% at 50% 40%, black, transparent)",
          }}
        />
        <div className="relative w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-600 font-serif text-base font-bold text-white">
              ◈
            </span>
            <span className="font-serif text-lg font-bold">Mintleaf</span>
          </div>

          <h2 className="font-serif text-[1.7rem] font-bold leading-tight">
            {mode === "login" ? "Welcome back" : "Start your ledger"}
          </h2>
          <p className="mb-6 mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in with your username or email to continue."
              : "One account, one calm ledger. Takes thirty seconds."}
          </p>

          <Card>
            <CardHeader className="pb-4">
              <div
                role="tablist"
                aria-label="Sign in or create account"
                className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
              >
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => mode !== m && switchMode()}
                    className={cn(
                      "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      mode === m
                        ? "bg-card font-semibold text-foreground shadow-[0_1px_2px_rgba(26,36,32,0.12)]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "login" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
              <CardTitle className="sr-only">
                {mode === "login" ? "Sign in" : "Create account"}
              </CardTitle>
              <CardDescription className="sr-only">
                {mode === "login"
                  ? "Enter your credentials below"
                  : "Choose your email, username and password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {mode === "login" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="identifier">Username or email</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="identifier"
                        placeholder="johndoe or you@example.com"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="username"
                          placeholder="johndoe"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {mode === "register" && (
                    <p className="text-xs text-muted-foreground">
                      Min 8 characters, 1 uppercase letter, 1 number.
                    </p>
                  )}
                </div>

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-rose-600/25 bg-rose-600/10 px-3 py-2 text-sm text-rose-600"
                  >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Please wait…
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "Sign in" : "Create account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {mode === "register" && (
                  <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                    The first account on a fresh server becomes admin
                    automatically.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New to Mintleaf?{" "}
                <button
                  onClick={switchMode}
                  className="cursor-pointer font-semibold text-pine-600 underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={switchMode}
                  className="cursor-pointer font-semibold text-pine-600 underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secured with short-lived JWTs and revocable sessions.
          </p>
        </div>
      </div>
    </div>
  )
}
