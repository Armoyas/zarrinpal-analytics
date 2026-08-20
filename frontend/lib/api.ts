const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_PREFIX = API_URL.replace(/\/$/, '')

export interface OverviewMetrics {
  total_attempts: number
  unique_sessions: number
  payment_attempts: {
    total: number
    completed: number
    paid: number
    verified: number
    failed: number
    reversed: number
    no_attempt: number
  }
  success_rate: number
  failure_rate: number
  amount: {
    total_rials: number
    avg_per_attempt_rials: number
    currency: string
  }
  adjusted_fee_total: number
  fee_note: string
  how_calculated: Record<string, string>
}

export interface MerchantSummary {
  merchant_key: string
  category_title: string
  total_attempts: number
  unique_sessions: number
  completed_attempts: number
  paid_attempts: number
  verified_attempts: number
  failed_attempts: number
  reversed_attempts: number
  no_attempt: number
  total_amount: number
  avg_amount: number
  total_adjusted_fee: number
  success_rate_pct: number
}

export interface TrendPoint {
  time_period: string
  value: number
}

export interface DailyTrendPoint {
  day: string
  count: number
  amount: number
  success_rate: number
}

export interface PeerComparison {
  my_amount: number
  my_success: number
  my_attempts: number
  peer_avg_amount: number
  peer_avg_rate: number
  percentile_rank: number
  category: string
  category_id: number
  my_success_rate: number
  merchant_key: string
}

export interface SchemaColumn {
  name: string
  type: string
}

export interface Schema {
  columns: SchemaColumn[]
  total_rows: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export interface HealthResponse {
  status: string
  detail: Record<string, unknown>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_PREFIX}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<HealthResponse>(`/api/v1/health`),
  schema: () => request<Schema>(`/api/v1/schema`),
  statusDistribution: () => request<StatusDistribution[]>(`/api/v1/schema/status-distribution`),
  overview: (merchantKey?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (merchantKey) params.set('merchant_key', merchantKey)
    if (startDate) params.set('start_date', startDate)
    if (endDate) params.set('end_date', endDate)
    const query = params.toString()
    return request<OverviewMetrics>(`/api/v1/overview${query ? `?${query}` : ''}`)
  },
  merchants: (limit = 20) =>
    request<MerchantSummary[]>(`/api/v1/merchants?limit=${limit}`),
  peerComparison: (merchantKey: string) =>
    request<PeerComparison>(`/api/v1/merchants/${merchantKey}/peer-comparison`),
  timeSeries: (metric = 'attempts', interval = 'day', merchantKey?: string) =>
    request<TrendPoint[]>(`/api/v1/time-series?metric=${metric}&interval=${interval}${merchantKey ? `&merchant_key=${merchantKey}` : ''}`),
  dailyTrends: (merchantKey?: string, days = 90) =>
    request<DailyTrendPoint[]>(`/api/v1/time-series/daily-trends${merchantKey ? `?merchant_key=${merchantKey}` : ''}&days=${days}`),
}
