/**
 * API client for the Analytical Dashboard frontend.
 * All data fetching goes through this client so the backend
 * remains the single source of truth for calculations.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface MerchantInfo {
  merchant_key: string;
  category_id: number;
  category_title: string;
  terminal_keys: string[];
  row_count: number;
  total_amount: number;
  verified_count: number;
}

export interface MetricTrace {
  metric_id: string;
  label: string;
  value: unknown;
  definition: string;
  formula: string;
  source_columns: string[];
  counting_unit: string;
  filters: Record<string, unknown>;
  limitations?: string | null;
}

export interface OverviewResponse {
  merchant_key: string;
  date_range: { start: string; end: string };
  metrics: MetricTrace[];
}

export interface DailyPoint {
  date: string;
  attempts: number;
  amount: number;
  sessions: number;
  verified: number;
  failed: number;
}

export interface TrendsResponse {
  merchant_key: string;
  date_range: { start: string; end: string };
  daily: DailyPoint[];
  traceability: MetricTrace;
}

export interface HealthResponse {
  status: string;
  stage: string;
  data_available: boolean;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchMerchants(
  categoryId?: number
): Promise<{ merchants: MerchantInfo[]; traceability: MetricTrace }> {
  const params = new URLSearchParams();
  if (categoryId !== undefined) params.set("category_id", String(categoryId));
  const url = params.toString()
    ? `${API_BASE_URL}/merchants?${params}`
    : `${API_BASE_URL}/merchants`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch merchants");
  return res.json();
}

export async function fetchOverview(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<OverviewResponse> {
  const params = new URLSearchParams();
  if (merchantKey) params.set("merchant_key", merchantKey);
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const res = await fetch(`${API_BASE_URL}/overview?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch overview");
  }
  return res.json();
}

export async function fetchTrends(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<TrendsResponse> {
  const params = new URLSearchParams();
  if (merchantKey) params.set("merchant_key", merchantKey);
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const res = await fetch(`${API_BASE_URL}/trends?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch trends");
  }
  return res.json();
}