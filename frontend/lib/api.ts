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
  total_transactions: number
  total_revenue_rial: number
  total_merchants: number
  success_rate: number
  avg_transaction_value: number
  daily_transactions: number
  monthly_revenue_rial: number
}

export interface MerchantData {
  merchant_key: string
  total_transactions: number
  total_revenue_rial: number
  success_rate: number
  avg_amount: number
  last_transaction: string
  risk_score: number
}

export interface TimeSeriesData {
  date: string
  total_transactions: number
  success_rate: number
  total_amount: number
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

export interface NowruzData {
  period_revenue: number
  period_transactions: number
  growth_rate: number
  top_merchants: MerchantData[]
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
}

// API Methods
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const api = {
  getOverview: () => fetchAPI<OverviewMetrics>('/api/v1/overview'),
  getMerchants: (limit = 10) => fetchAPI<MerchantData[]>(`/api/v1/merchants?limit=${limit}`),
  getTimeSeries: (days = 30) => fetchAPI<TimeSeriesData[]>(`/api/v1/timeseries?days=${days}`),
  getAIPredictions: () => fetchAPI<PredictionData[]>('/api/v1/insights/predictive-forecast'),
  getRiskAlerts: () => fetchAPI<RiskAlert[]>('/api/v1/insights/risk-alerts'),
  getAnomalies: () => fetchAPI<Anomaly[]>('/api/v1/insights/anomaly-detection'),
  getSpendingPatterns: () => fetchAPI<SpendingPattern[]>('/api/v1/insights/spending-pattern'),
  getSmartRecommendations: () => fetchAPI<any[]>('/api/v1/insights/smart-recommendations'),
  getNowruzAnalytics: () => fetchAPI<NowruzData>('/api/v1/nowruz/analytics'),
  getNowruzForecast: () => fetchAPI<any>('/api/v1/nowruz/forecast'),
  getHealth: () => fetchAPI<any>('/health'),
}