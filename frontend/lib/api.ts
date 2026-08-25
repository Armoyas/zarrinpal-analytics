// API client for ZarrinPal Analytics Dashboard
// All endpoints are relative to the backend API base URL

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

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

export interface MerchantOverview {
  merchant_key: string
  category_title: string
  total_attempts: number
  unique_sessions: number
  paid_attempts: number
  completed_attempts: number
  failed_attempts: number
  total_amount: number
  avg_amount: number
  total_adjusted_fee: number
  success_rate_pct: number
}

export interface MerchantData {
  merchant_key: string
  total_transactions: number
  total_revenue_rial: number
  success_rate: number
  avg_amount: number
  last_transaction: string
  risk_score: number
  category_title?: string
}

export interface TimeSeriesPoint {
  time_period: string
  value: number
}

export interface TimeSeriesData {
  date: string
  count: number
  amount: number
  success_rate: number
}

export interface PredictionData {
  date: string
  predicted_transactions: number
  upper_bound: number
  lower_bound: number
  confidence: number
}

export interface RiskAlert {
  merchant_key: string
  risk_score: number
  alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>
  last_transaction: string
  risk_score_trend: 'increasing' | 'decreasing' | 'stable'
}

export interface Anomaly {
  id: string
  timestamp: string
  merchant_key: string
  metric: string
  value: number
  expected: number
  deviation_pct: number
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface SpendingPattern {
  pattern: string
  description: string
  confidence: number
  affected_count: number
}

export interface SmartRecommendation {
  merchant_key: string
  category_title: string
  success_rate: number
  recommendations: string[]
  performance_tier: 'high' | 'medium' | 'low'
}

export interface NowruzData {
  period_revenue: number
  period_transactions: number
  growth_rate: number
  top_merchants: any[]
  daily_patterns: Array<{
    day: string
    transactions: number
    revenue: number
    gift_card_share: number
  }>
  gift_card_analysis: {
    total_gift_card_revenue: number
    gift_card_share: number
    top_gift_card_merchants: string[]
  }
  prediction: {
    predicted_transactions: number
    expected_revenue_increase_pct: number
    days_until_nowruz: number
    confidence: number
  }
  recommendation: string
}

export interface NowruzForecast {
  forecast: {
    predicted_transactions: number
    expected_revenue_increase_pct: number
    days_until_nowruz: number
    confidence: number
  }
  daily_patterns: Array<{
    day: string
    transactions: number
    revenue: number
    gift_card_share: number
  }>
  gift_card_analysis: {
    total_gift_card_revenue: number
    gift_card_share: number
    top_gift_card_merchants: string[]
  }
  recommendation: string
  confidence: number
  predicted_transactions: number
}

export interface MerchantDetail {
  merchant_key: string
  category_title: string
  terminal_key: string
  total_attempts: number
  unique_sessions: number
  completed_attempts: number
  paid_attempts: number
  verified_attempts: number
  failed_attempts: number
  reversed_attempts: number
  total_amount: number
  avg_amount: number
  median_amount: number
  max_amount: number
  min_amount: number
  total_adjusted_fee: number
  adjusted_fee_share: number
  success_rate: number
  status_breakdown: Array<{ session_status: string; cnt: number; amt: number }>
  daily_trend: Array<{ day: string; count: number; amount: number; success_rate: number }>
  merchant_rank: number
  total_merchants_in_category: number
  peer_comparison: {
    peer_avg_amount: number | null
    peer_total_amount: number | null
    peer_success_rate: number | null
    overall_avg_amount: number
    overall_success_rate: number
    overall_total_amount: number
  }
  how_calculated: Record<string, string>
}

export interface CategoryInfo {
  category_id: string
  category_title: string
  total_attempts: number
  merchant_count: number
  total_amount: number
  paid_count: number
  success_rate_pct: number
  total_adjusted_fee: number
  share_pct?: number
}

export interface HighValueAnalysis {
  threshold_rial: number
  threshold_toman: number
  total_attempts: number
  high_value_attempts: number
  total_amount: number
  high_value_amount: number
  pct_of_attempts: number
  pct_of_amount: number
  by_merchant: Array<{ merchant_key: string; cnt: number; amt: number }>
  by_category: Array<{ category_title: string; cnt: number; amt: number }>
  status_breakdown: Array<{ session_status: string; cnt: number; amt: number }>
  how_calculated: Record<string, string>
}

export interface AIChatResponse {
  query: string
  response: string
  insights: any[]
  data_sources: string[]
  disclaimer: string
}

// API Methods
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })
    if (!response.ok) {
      console.warn(`API error: ${response.status} ${response.statusText}`)
      return null
    }
    return response.json()
  } catch (error) {
    console.warn('Network error during API call:', error)
    return null
  }
}

// Transform backend merchant data to frontend-friendly format
function transformMerchants(backendData: MerchantOverview[]): MerchantData[] {
  return backendData.map(m => ({
    merchant_key: m.merchant_key,
    total_transactions: m.total_attempts,
    total_revenue_rial: m.total_amount,
    success_rate: m.success_rate_pct,
    avg_amount: m.avg_amount,
    last_transaction: '',
    risk_score: Math.min(100, Math.round(m.success_rate_pct < 70 ? 100 - m.success_rate_pct : 0)),
    category_title: m.category_title,
  }))
}

// Transform backend time series data to frontend-friendly format
function transformTimeSeries(backendData: TimeSeriesPoint[], amountData?: TimeSeriesPoint[]): TimeSeriesData[] {
  if (!amountData) amountData = backendData
  const countMap = new Map(backendData.map(d => [d.time_period, d.value]))
  const amountMap = new Map(amountData.map(d => [d.time_period, d.value]))
  const allKeys = new Set<string>([...Array.from(countMap.keys()), ...Array.from(amountMap.keys())])
  return Array.from(allKeys).sort().map(key => ({
    date: key,
    count: countMap.get(key) || 0,
    amount: amountMap.get(key) || 0,
    success_rate: 0,
  }))
}

export const api = {
  getOverview: (start_date?: string, end_date?: string, merchant_key?: string) => {
    const params = new URLSearchParams()
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    if (merchant_key) params.set('merchant_key', merchant_key)
    const qs = params.toString()
    return fetchAPI<OverviewMetrics>(`/api/v1/overview${qs ? `?${qs}` : ''}`)
  },

  getMerchants: (limit = 10, start_date?: string, end_date?: string) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    return fetchAPI<MerchantOverview[]>(`/api/v1/merchants?${params.toString()}`)
  },

  getMerchantDetail: (merchantKey: string, start_date?: string, end_date?: string) => {
    const params = new URLSearchParams()
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    const qs = params.toString()
    return fetchAPI<MerchantDetail>(`/api/v1/merchants/${merchantKey}${qs ? `?${qs}` : ''}`)
  },

  getPeerComparison: (merchantKey: string) =>
    fetchAPI<any>(`/api/v1/merchants/${merchantKey}/peer-comparison`),

  getTimeSeries: (metric: string = 'attempts', interval: string = 'day', start_date?: string, end_date?: string, merchant_key?: string) => {
    const params = new URLSearchParams({ metric, interval })
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    if (merchant_key) params.set('merchant_key', merchant_key)
    return fetchAPI<TimeSeriesPoint[]>(`/api/v1/time-series?${params.toString()}`)
  },

  getDailyTrends: (merchantKey?: string, days = 30) => {
    const params = new URLSearchParams({ days: String(days) })
    if (merchantKey) params.set('merchant_key', merchantKey)
    return fetchAPI<any[]>(`/api/v1/time-series/daily-trends?${params.toString()}`)
  },

  getCategories: () =>
    fetchAPI<CategoryInfo[]>(`/api/v1/categories`),

  getCategoryDistribution: () =>
    fetchAPI<CategoryInfo[]>(`/api/v1/categories/distribution`),

  getCategoryDetail: (categoryId: string) =>
    fetchAPI<any>(`/api/v1/categories/${categoryId}`),

  getHighValueAnalysis: (threshold: number = 10000000) =>
    fetchAPI<HighValueAnalysis>(`/api/v1/high-value/analysis?threshold=${threshold}`),

  getStatusDistribution: () =>
    fetchAPI<any[]>('/api/v1/schema/status-distribution'),

  getStatusDistributionByDate: (start_date?: string, end_date?: string) => {
    const params = new URLSearchParams()
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    const qs = params.toString()
    return fetchAPI<any[]>(`/api/v1/status-distribution/by-date${qs ? `?${qs}` : ''}`)
  },

  getAIPredictions: () => fetchAPI<PredictionData[]>('/api/v1/insights/predictive-forecast'),
  getRiskAlerts: (limit = 20) => fetchAPI<RiskAlert[]>(`/api/v1/insights/risk-alerts?limit=${limit}`),
  getAnomalies: (limit = 50) => fetchAPI<Anomaly[]>(`/api/v1/insights/anomaly-detection?limit=${limit}`),
  getSpendingPatterns: () =>
    fetchAPI<{ patterns: SpendingPattern[]; summary: string; statistics: Record<string, unknown> }>(
      '/api/v1/insights/spending-pattern'
    ),
  getSmartRecommendations: (limit = 10) =>
    fetchAPI<SmartRecommendation[]>(`/api/v1/insights/smart-recommendations?limit=${limit}`),
  getNowruzAnalytics: () => fetchAPI<NowruzData>('/api/v1/nowruz/analytics'),
  getNowruzForecast: () => fetchAPI<NowruzForecast>('/api/v1/nowruz/forecast'),
  aiChat: (query: string, merchantKey?: string) => {
    const params = new URLSearchParams({ query: query || 'help' })
    if (merchantKey) params.set('merchant_key', merchantKey)
    return fetchAPI<AIChatResponse>(`/api/v1/ai/chat?${params.toString()}`)
  },
  getHealth: () => fetchAPI<any>('/api/v1/health'),
  getCalculationDetails: () =>
    fetchAPI<any>('/api/v1/sales/calculation-details'),
  getSalesShare: (merchant_key?: string, category_id?: string, start_date?: string, end_date?: string) => {
    const params = new URLSearchParams()
    if (merchant_key) params.set('merchant_key', merchant_key)
    if (category_id) params.set('category_id', category_id)
    if (start_date) params.set('start_date', start_date)
    if (end_date) params.set('end_date', end_date)
    const qs = params.toString()
    return fetchAPI<any>(`/api/v1/sales/share${qs ? `?${qs}` : ''}`)
  },
}