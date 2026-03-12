// Dev: Vite proxy forwards /api/* → localhost:8000 (no CORS). Production: set VITE_API_URL to backend origin.
const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(
    public detail: string,
    public status: number,
  ) {
    super(detail)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.detail) detail = body.detail
    } catch {}
    throw new ApiError(detail, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plan {
  id: number
  stripe_price_id: string
  name: string
  description: string
  features: string[]
  amount: number
  currency: string
  interval: string
  display_order: number
}

export interface UserOut {
  id: number
  email: string
  first_name: string
  last_name: string
  is_email_verified: boolean
  company_id: number | null
  avatar: string | null
}

export interface LoginOut {
  token: string
  user: UserOut
}

export interface RegisterIn {
  email: string
  password1: string
  password2: string
  first_name: string
  last_name: string
  stripe_price_id: string
  company_name: string
  company_slug: string
}

export interface RegisterOut {
  detail: string
  user_id: number
  email: string
  requires_email_confirmation: boolean
  payment_client_secret: string | null
  subscription_id: number
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const plansApi = () =>
  request<Plan[]>('/api/subscriptions/plans')

export const registerApi = (payload: RegisterIn) =>
  request<RegisterOut>('/api/users/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const loginApi = (email: string, password: string) =>
  request<LoginOut>('/api/users/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const logoutApi = (token: string) =>
  request<{ detail: string }>('/api/users/auth/logout', {
    method: 'POST',
    headers: bearer(token),
  })

export const getMeApi = (token: string) =>
  request<UserOut>('/api/users/auth/me', {
    headers: bearer(token),
  })
