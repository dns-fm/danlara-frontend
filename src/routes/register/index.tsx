import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Badge } from '#/components/ui/badge'
import { Separator } from '#/components/ui/separator'
import { type Plan, type RegisterOut, plansApi, registerApi } from '#/lib/api'
import { ApiError } from '#/lib/api'

export const Route = createFileRoute('/register/')({ component: RegisterPage })

// Initialise Stripe once
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
)

// ─── Step types ───────────────────────────────────────────────────────────────

interface AccountFields {
  first_name: string
  last_name: string
  email: string
  password1: string
  password2: string
}

interface CompanyFields {
  company_name: string
  company_slug: string
}

type Step = 1 | 2 | 3 | 4

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatPrice(amount: number, currency: string, interval: string) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100)
  return `${formatted} / ${interval}`
}

// ─── Progress indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              n < current
                ? 'bg-[var(--lagoon)] text-white'
                : n === current
                  ? 'bg-[var(--sea-ink)] text-white'
                  : 'border border-[var(--line)] bg-white/50 text-[var(--sea-ink-soft)]'
            }`}
          >
            {n < current ? '✓' : n}
          </div>
          {n < total && (
            <div
              className={`h-px w-8 ${n < current ? 'bg-[var(--lagoon)]' : 'bg-[var(--line)]'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Account ─────────────────────────────────────────────────────────

function StepAccount({
  data,
  onNext,
}: {
  data: AccountFields
  onNext: (d: AccountFields) => void
}) {
  const [fields, setFields] = useState(data)
  const [error, setError] = useState('')

  const set = (k: keyof AccountFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fields.password1 !== fields.password2) {
      setError('Passwords do not match.')
      return
    }
    if (fields.password1.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    onNext(fields)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" value={fields.first_name} onChange={set('first_name')} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" value={fields.last_name} onChange={set('last_name')} required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={fields.email}
          onChange={set('email')}
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password1">Password</Label>
        <Input
          id="password1"
          type="password"
          value={fields.password1}
          onChange={set('password1')}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password2">Confirm password</Label>
        <Input
          id="password2"
          type="password"
          value={fields.password2}
          onChange={set('password2')}
          required
          autoComplete="new-password"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  )
}

// ─── Step 2: Company ─────────────────────────────────────────────────────────

function StepCompany({
  data,
  onBack,
  onNext,
}: {
  data: CompanyFields
  onBack: () => void
  onNext: (d: CompanyFields) => void
}) {
  const [fields, setFields] = useState(data)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFields((f) => ({
      ...f,
      company_name: name,
      company_slug: f.company_slug || slugify(name),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(fields)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          value={fields.company_name}
          onChange={handleNameChange}
          required
          placeholder="Acme Inc."
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company_slug">Company URL slug</Label>
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <span className="text-muted-foreground">danlara.com/</span>
          <input
            id="company_slug"
            className="flex-1 bg-transparent outline-none"
            value={fields.company_slug}
            onChange={(e) =>
              setFields((f) => ({ ...f, company_slug: slugify(e.target.value) }))
            }
            required
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers and hyphens only"
          />
        </div>
        <p className="text-xs text-[var(--sea-ink-soft)]">
          Lowercase letters, numbers, and hyphens only.
        </p>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}

// ─── Step 3: Plan selection ───────────────────────────────────────────────────

function StepPlan({
  selectedPriceId,
  onBack,
  onNext,
}: {
  selectedPriceId: string
  onBack: () => void
  onNext: (priceId: string) => void
}) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(selectedPriceId)

  useEffect(() => {
    plansApi()
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.display_order - b.display_order)
        setPlans(sorted)
        if (!selected && sorted.length) setSelected(sorted[0].stripe_price_id)
      })
      .catch((err: unknown) => {
        console.error('[plans] fetch error:', err)
        setError('Failed to load plans. Please refresh and try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--lagoon)] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </p>
    )
  }

  if (!plans.length) {
    return (
      <div className="grid gap-4">
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          No plans are available yet. Please contact support or try again later.
        </p>
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {plans.map((plan) => (
          <button
            key={plan.stripe_price_id}
            type="button"
            onClick={() => setSelected(plan.stripe_price_id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selected === plan.stripe_price_id
                ? 'border-[var(--lagoon)] bg-[rgba(79,184,178,0.08)]'
                : 'border-[var(--line)] bg-white/50 hover:border-[var(--lagoon-deep)]'
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-[var(--sea-ink)]">{plan.name}</span>
              <span className="text-sm font-medium text-[var(--lagoon-deep)]">
                {formatPrice(plan.amount, plan.currency, plan.interval)}
              </span>
            </div>
            {plan.description && (
              <p className="mb-2 text-sm text-[var(--sea-ink-soft)]">{plan.description}</p>
            )}
            {plan.features && plan.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {plan.features.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

// ─── Step 4: Payment ─────────────────────────────────────────────────────────

function PaymentForm({
  registerResult,
  onBack,
}: {
  registerResult: RegisterOut
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!stripe || !elements) return
    setError('')
    setLoading(true)
    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/register/complete`,
      },
    })
    if (stripeErr) {
      setError(stripeErr.message ?? 'Payment failed. Please try again.')
      setLoading(false)
    }
    // On success Stripe redirects — no need to reset loading
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-[var(--line)] bg-white/50 p-4">
        <p className="mb-1 text-sm font-medium text-[var(--sea-ink)]">
          Account: {registerResult.email}
        </p>
        <p className="text-xs text-[var(--sea-ink-soft)]">
          Please verify your email after completing payment.
        </p>
      </div>

      <Separator />

      <PaymentElement />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={loading || !stripe}
          className="flex-1"
        >
          {loading ? 'Processing…' : 'Confirm & Pay'}
        </Button>
      </div>
    </div>
  )
}

function StepPayment({
  account,
  company,
  stripePriceId,
  registerResult,
  onRegisterResult,
  onBack,
}: {
  account: AccountFields
  company: CompanyFields
  stripePriceId: string
  registerResult: RegisterOut | null
  onRegisterResult: (r: RegisterOut) => void
  onBack: () => void
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCreateAccount = async () => {
    setError('')
    setSubmitting(true)
    try {
      const result = await registerApi({
        email: account.email,
        password1: account.password1,
        password2: account.password2,
        first_name: account.first_name,
        last_name: account.last_name,
        stripe_price_id: stripePriceId,
        company_name: company.company_name,
        company_slug: company.company_slug,
      })
      onRegisterResult(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Once registered, show Stripe payment form
  if (registerResult?.payment_client_secret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: registerResult.payment_client_secret }}
      >
        <PaymentForm registerResult={registerResult} onBack={onBack} />
      </Elements>
    )
  }

  // Confirmation step — user reviews and clicks to create account
  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-[var(--line)] bg-white/50 p-4 grid gap-1.5 text-sm">
        <p>
          <span className="text-[var(--sea-ink-soft)]">Email: </span>
          <span className="font-medium text-[var(--sea-ink)]">{account.email}</span>
        </p>
        <p>
          <span className="text-[var(--sea-ink-soft)]">Name: </span>
          <span className="font-medium text-[var(--sea-ink)]">
            {account.first_name} {account.last_name}
          </span>
        </p>
        <p>
          <span className="text-[var(--sea-ink-soft)]">Company: </span>
          <span className="font-medium text-[var(--sea-ink)]">{company.company_name}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={submitting}>
          Back
        </Button>
        <Button type="button" onClick={handleCreateAccount} disabled={submitting} className="flex-1">
          {submitting ? 'Creating account…' : 'Create Account & Pay'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main register page ───────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  1: 'Your account',
  2: 'Your company',
  3: 'Choose a plan',
  4: 'Payment',
}

function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [account, setAccount] = useState<AccountFields>({
    first_name: '',
    last_name: '',
    email: '',
    password1: '',
    password2: '',
  })
  const [company, setCompany] = useState<CompanyFields>({
    company_name: '',
    company_slug: '',
  })
  const [stripePriceId, setStripePriceId] = useState('')
  // Lifted up so going back from step 4 doesn't re-register
  const [registerResult, setRegisterResult] = useState<RegisterOut | null>(null)

  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <p className="island-kicker mb-1 text-xs font-semibold uppercase tracking-widest">
            Danlara
          </p>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>{STEP_LABELS[step]}</CardDescription>
        </CardHeader>

        <CardContent>
          <StepIndicator current={step} total={4} />

          {step === 1 && (
            <StepAccount
              data={account}
              onNext={(d) => {
                setAccount(d)
                setStep(2)
              }}
            />
          )}

          {step === 2 && (
            <StepCompany
              data={company}
              onBack={() => setStep(1)}
              onNext={(d) => {
                setCompany(d)
                setStep(3)
              }}
            />
          )}

          {step === 3 && (
            <StepPlan
              selectedPriceId={stripePriceId}
              onBack={() => setStep(2)}
              onNext={(id) => {
                if (id !== stripePriceId) setRegisterResult(null)
                setStripePriceId(id)
                setStep(4)
              }}
            />
          )}

          {step === 4 && (
            <StepPayment
              account={account}
              company={company}
              stripePriceId={stripePriceId}
              registerResult={registerResult}
              onRegisterResult={(r) => setRegisterResult(r)}
              onBack={() => setStep(3)}
            />
          )}

          <p className="mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[var(--lagoon-deep)] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
