const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface MerchantSummary {
  merchant_key: string
  category_title: string | null
  total_amount: number
  txn_count: number
  success_count: number
  success_rate: number
  fee_ratio: number
  active_days: number
}

export interface TrendPoint {
  date: string
  amount: number
  count: number
  success_rate: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  metric: string
  calculation: string
}

export interface NowruzImpact {
  before: number
  during: number
  after: number
  lift_pct: number | null
  sample_size: number
}

export interface PeerComparison {
  merchant_amount: number
  peer_median: number
  peer_p90: number
  percentile: number
  category: string
}

export interface Provenance {
  metric: string
  value: string
  query: string
  source: string
  computed_at: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  merchants: (limit = 10) => request<MerchantSummary[]>(`/api/v1/analytics/merchants?limit=${limit}`),
  trends: (merchant?: string, days = 90) =>
    request<TrendPoint[]>(`/api/v1/analytics/trends${merchant ? `?merchant_key=${merchant}` : ''}&days=${days}`),
  recommendations: (merchant: string) => request<Recommendation[]>(`/api/v1/analytics/merchants/${merchant}/recommendations`),
  nowruz: (merchant?: string) => request<NowruzImpact>(`/api/v1/analytics/nowruz${merchant ? `?merchant_key=${merchant}` : ''}`),
  peerComparison: (merchant: string) => request<PeerComparison>(`/api/v1/analytics/merchants/${merchant}/peer-comparison`),
  provenance: (merchant?: string) => request<Provenance[]>(`/api/v1/analytics/provenance${merchant ? `?merchant_key=${merchant}` : ''}`),
}
