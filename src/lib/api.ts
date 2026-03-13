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

async function requestMultipart<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options)
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

export interface SubscriptionOut {
  id: number
  stripe_subscription_id: string
  stripe_price_id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  canceled_at: string | null
  plan: Plan
}

export interface CompanyOut {
  id: number
  name: string
  slug: string
  owner_id: number | null
  stripe_customer_id: string | null
  active_subscription: SubscriptionOut | null
}

export interface DashboardStats {
  total_brands: number
  active_jobs: number
  conflicts_found: number
  monitored_markets: number
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

export const updateProfileApi = (token: string, data: { first_name: string; last_name: string }) =>
  request<UserOut>('/api/users/profile', {
    method: 'PATCH',
    headers: { ...bearer(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateAvatarApi = (token: string, formData: FormData) =>
  requestMultipart<UserOut>('/api/users/profile/avatar', {
    method: 'POST',
    headers: bearer(token),
    body: formData,
  })

export const changePasswordApi = (token: string, data: { current_password: string; new_password1: string; new_password2: string }) =>
  request<{ detail: string }>('/api/users/profile/password', {
    method: 'POST',
    headers: { ...bearer(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const getCompanyApi = (token: string) =>
  request<CompanyOut>('/api/users/company', {
    headers: bearer(token),
  })

export const getSubscriptionApi = (token: string) =>
  request<SubscriptionOut>('/api/users/company/subscription', {
    headers: bearer(token),
  })

export const getDashboardStatsApi = (token: string) =>
  request<DashboardStats>('/api/users/dashboard/stats', {
    headers: bearer(token),
  })

// ─── RNPI types ───────────────────────────────────────────────────────────────

export interface Report {
  id: string
  number: number
  name: string
  publication_date: string
  number_of_processes: number | null
  status: string
  size: number
  unit: string
  pdf: string
  xml: string
  created_at: string
}

export interface ProcessListItem {
  id: string
  number: string
  name: string | null
  nature: string | null
  presentation: string | null
  deposit_date: string | null
  grant_date: string | null
  validity_date: string | null
  nice_classes: string
  is_active: boolean
}

export interface ProcessDetail extends ProcessListItem {
  nice: unknown[] | null
  titular: unknown[] | null
  despacho: unknown[] | null
  vienna: unknown[] | null
  madrid: unknown[] | null
  logo_url: string | null
  metadata: string | null
  report_id: string
  report_number: number
  report_name: string
  updated_at: string
}

export interface TrademarkListItem extends ProcessListItem {
  report_id: string
  report_number: number
  report_name: string
  publication_date: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ─── RNPI API calls ───────────────────────────────────────────────────────────

export const getReportsApi = (
  token: string,
  params: { page?: number; page_size?: number; search?: string } = {},
) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.search) qs.set('search', params.search)
  return request<Paginated<Report>>(`/api/rnpi/reports?${qs}`, {
    headers: bearer(token),
  })
}

export const getProcessesApi = (
  token: string,
  reportId: string,
  params: { page?: number; page_size?: number; search?: string } = {},
) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.search) qs.set('search', params.search)
  return request<Paginated<ProcessListItem>>(
    `/api/rnpi/reports/${reportId}/processes?${qs}`,
    { headers: bearer(token) },
  )
}

export const getProcessApi = (token: string, processId: string) =>
  request<ProcessDetail>(`/api/rnpi/processes/${processId}`, {
    headers: bearer(token),
  })

export const getTrademarksApi = (
  token: string,
  params: {
    page?: number
    page_size?: number
    search?: string
    report_number?: number
    deposit_date_from?: string
    deposit_date_to?: string
  } = {},
) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.search) qs.set('search', params.search)
  if (params.report_number) qs.set('report_number', String(params.report_number))
  if (params.deposit_date_from) qs.set('deposit_date_from', params.deposit_date_from)
  if (params.deposit_date_to) qs.set('deposit_date_to', params.deposit_date_to)
  return request<Paginated<TrademarkListItem>>(`/api/rnpi/trademarks?${qs}`, {
    headers: bearer(token),
  })
}

// ─── Brands types ─────────────────────────────────────────────────────────────

export interface BrandListItem {
  id: string
  external_id: string | null
  name: string | null
  nice_class: string | null
  client: string | null
  deposit: string | null
  is_active: boolean
  logo_url: string | null
}

export interface BrandDetail {
  id: string
  external_id: string | null
  name: string | null
  nature: string | null
  nice_class: string | null
  status: string | null
  sector: string | null
  presentation: string | null
  reference: string | null
  client: string | null
  client_note: string | null
  logo_url: string | null
  titular: string | null
  services: string | null
  publications: string | null
  priority: string | null
  unfolding: string | null
  is_active: boolean
  extension: string | null
  deposit: string | null
  register: string | null
  first_register: string | null
  created_at: string
  updated_at: string
}

// ─── Brands API calls ─────────────────────────────────────────────────────────

export const getBrandsApi = (
  token: string,
  params: { page?: number; page_size?: number; search?: string; is_active?: boolean } = {},
) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.search) qs.set('search', params.search)
  if (params.is_active !== undefined) qs.set('is_active', String(params.is_active))
  return request<Paginated<BrandListItem>>(`/api/brands/?${qs}`, { headers: bearer(token) })
}

export const getBrandApi = (token: string, brandId: string) =>
  request<BrandDetail>(`/api/brands/${brandId}`, { headers: bearer(token) })

export const createBrandApi = (token: string, formData: FormData) =>
  requestMultipart<BrandDetail>('/api/brands/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

export const uploadBrandsJsonApi = (token: string, formData: FormData) =>
  requestMultipart<{ detail: string }>('/api/brands/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

export interface UploadedFileItem {
  id: number
  original_filename: string | null
  file_type: string
  file_size: number | null
  description: string | null
  status: 'pending' | 'processing' | 'done' | 'failed'
  error_message: string | null
  uploaded_at: string
  brand_count: number
}

export const getUploadsApi = (token: string) =>
  request<UploadedFileItem[]>('/api/brands/uploads', {
    headers: bearer(token),
  })

// ─── Jobs types ───────────────────────────────────────────────────────────────

export interface ReportSearchItem {
  id: string
  number: number
  name: string
  publication_date: string | null
}

export interface JobItem {
  id: string
  report_id: string
  report_number: number
  report_name: string
  company_id: number | null
  status: 'P' | 'R' | 'F' | 'E' | 'C'
  task_id: string | null
  brands: number | null
  matches_number: number | null
  processed: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  matching_config: Record<string, unknown> | null
}

// ─── Jobs API calls ───────────────────────────────────────────────────────────

export const searchPublicationsApi = (token: string, q?: string) => {
  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  return request<ReportSearchItem[]>(`/api/jobs/reports/search?${qs}`, {
    headers: bearer(token),
  })
}

export const getJobsApi = (token: string) =>
  request<JobItem[]>('/api/jobs/', { headers: bearer(token) })

export const createJobApi = (
  token: string,
  reportId: string,
  config: { min_score?: number; k?: number } = {},
) =>
  request<JobItem>('/api/jobs/', {
    method: 'POST',
    headers: { ...bearer(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_id: reportId, ...config }),
  })

export const getJobApi = (token: string, jobId: string) =>
  request<JobItem>(`/api/jobs/${jobId}`, { headers: bearer(token) })

export interface MatchBrand {
  id: string
  name: string | null
  nice_class: string | null
  logo_url: string | null
  client: string | null
}

export interface MatchProcess {
  id: string
  number: string
  name: string | null
  nature: string | null
  nice_classes: string | null
  logo_url: string | null
}

export interface MatchItem {
  id: number
  brand: MatchBrand
  process: MatchProcess
  final_score: number
  extra_scores: {
    similarity?: number
    rerank?: number
    search_score?: number
    name_score?: number
    services_score?: number
    image_score?: number
  } | null
  reviewed: boolean
  confirmed: boolean
  is_match: boolean
  created_at: string
}

export const getJobMatchesApi = (token: string, jobId: string, params: { page?: number; page_size?: number } = {}) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  return request<Paginated<MatchItem>>(`/api/jobs/${jobId}/matches?${qs}`, { headers: bearer(token) })
}

// ─── Conflict Match types ─────────────────────────────────────────────────────

export interface JobBrief {
  id: string
  report_number: number
  report_name: string
  created_at: string
}

export interface ConflictMatch {
  id: number
  job: JobBrief
  brand: MatchBrand
  process: MatchProcess
  final_score: number
  extra_scores: {
    similarity?: number
    rerank?: number
    search_score?: number
    name_score?: number
    services_score?: number
    image_score?: number
  } | null
  reviewed: boolean
  confirmed: boolean
  is_match: boolean
  notes: string
  created_at: string
}

export interface ConflictMatchesParams {
  page?: number
  page_size?: number
  job_id?: string
  search?: string
  reviewed?: boolean
  confirmed?: boolean
  is_match?: boolean
  min_score?: number
  max_score?: number
}

export const getConflictMatchesApi = (token: string, params: ConflictMatchesParams = {}) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.page_size) qs.set('page_size', String(params.page_size))
  if (params.job_id) qs.set('job_id', params.job_id)
  if (params.search) qs.set('search', params.search)
  if (params.reviewed !== undefined) qs.set('reviewed', String(params.reviewed))
  if (params.confirmed !== undefined) qs.set('confirmed', String(params.confirmed))
  if (params.is_match !== undefined) qs.set('is_match', String(params.is_match))
  if (params.min_score !== undefined) qs.set('min_score', String(params.min_score))
  if (params.max_score !== undefined) qs.set('max_score', String(params.max_score))
  return request<Paginated<ConflictMatch>>(`/api/jobs/matches?${qs}`, { headers: bearer(token) })
}

export const getConflictMatchApi = (token: string, matchId: number) =>
  request<ConflictMatch>(`/api/jobs/matches/${matchId}`, { headers: bearer(token) })

export const updateConflictMatchApi = (
  token: string,
  matchId: number,
  payload: { reviewed?: boolean; confirmed?: boolean; is_match?: boolean; notes?: string },
) =>
  request<ConflictMatch>(`/api/jobs/matches/${matchId}`, {
    method: 'PATCH',
    headers: { ...bearer(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
