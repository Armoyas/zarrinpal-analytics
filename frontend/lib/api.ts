/**
 * API client for the Analytical Dashboard frontend.
 * All data fetching goes through this client so the backend
 * remains the single source of truth for calculations.
 */

import type {
  HealthResponse,
  MerchantInfo,
  MetricTrace,
  OverviewResponse,
  DailyPoint,
  TrendsResponse,
  SalesShareItem,
  ActivityPoint,
  MerchantRankingItem,
  PeakPeriod,
  ComparisonPoint,
  AdjustedFeeMetrics,
  AdjustedFeeTrendPoint,
  AdjustedFeeByMerchant,
  AdjustedFeeByCategory,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface FetchOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | undefined>;
}

async function request<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const params = new URLSearchParams();
  if (opts.params) {
    for (const [key, val] of Object.entries(opts.params)) {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    }
  }
  const url = params.toString()
    ? `${API_BASE_URL}${path}?${params.toString()}`
    : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail || `Request to ${path} failed`);
  }
  return res.json();
}

// ─── Stage 1 endpoints ──────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export async function fetchMerchants(
  categoryId?: number
): Promise<{ merchants: MerchantInfo[]; traceability: MetricTrace }> {
  return request<{ merchants: MerchantInfo[]; traceability: MetricTrace }>(
    "/merchants",
    { params: { category_id: categoryId } }
  );
}

export async function fetchOverview(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<OverviewResponse> {
  return request<OverviewResponse>("/overview", {
    params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
  });
}

export async function fetchTrends(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<TrendsResponse> {
  return request<TrendsResponse>("/trends", {
    params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
  });
}

// ─── Stage 2: Sales Share & Time Analytics ────────────────────

export async function fetchSalesShare(
  merchantKey?: string,
  startDate?: string,
  endDate?: string,
  categoryId?: number
): Promise<{ sales_share: SalesShareItem[]; traceability: MetricTrace }> {
  return request<{ sales_share: SalesShareItem[]; traceability: MetricTrace }>(
    "/sales/share",
    {
      params: {
        merchant_key: merchantKey,
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId,
      },
    }
  );
}

export async function fetchActivityDaily(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{ daily_activity: ActivityPoint[]; traceability: MetricTrace }> {
  return request<{ daily_activity: ActivityPoint[]; traceability: MetricTrace }>(
    "/activity/daily",
    {
      params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
    }
  );
}

export async function fetchActivityMonthly(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{ monthly_activity: ActivityPoint[]; traceability: MetricTrace }> {
  return request<{ monthly_activity: ActivityPoint[]; traceability: MetricTrace }>(
    "/activity/monthly",
    {
      params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
    }
  );
}

export async function fetchActivityYearly(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{ yearly_activity: ActivityPoint[]; traceability: MetricTrace }> {
  return request<{ yearly_activity: ActivityPoint[]; traceability: MetricTrace }>(
    "/activity/yearly",
    {
      params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
    }
  );
}

export async function fetchMerchantsRanking(
  startDate?: string,
  endDate?: string,
  limit = 10
): Promise<{
  merchant_ranking: MerchantRankingItem[];
  traceability: MetricTrace;
}> {
  return request<{
    merchant_ranking: MerchantRankingItem[];
    traceability: MetricTrace;
  }>("/merchants/ranking", {
    params: { start_date: startDate, end_date: endDate, limit },
  });
}

export async function fetchHighestActivityDay(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{
  peak_day: PeakPeriod;
  traceability: MetricTrace;
}> {
  return request<{
    peak_day: PeakPeriod;
    traceability: MetricTrace;
  }>("/activity/peak-day", {
    params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
  });
}

export async function fetchHighestActivityMonth(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{
  peak_month: PeakPeriod;
  traceability: MetricTrace;
}> {
  return request<{
    peak_month: PeakPeriod;
    traceability: MetricTrace;
  }>("/activity/peak-month", {
    params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
  });
}

export async function fetchComparison(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{ comparison: ComparisonPoint[]; traceability: MetricTrace }> {
  return request<{ comparison: ComparisonPoint[]; traceability: MetricTrace }>(
    "/comparison",
    {
      params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
    }
  );
}

// ─── Stage 3: Adjusted-Fee Analysis ────────────────────────────
// WARNING: adjusted_fee is a CONFIDENTIALITY-ADJUSTED fee indicator, NOT the real fee.

export async function fetchAdjustedFeeMetrics(
  merchantKey?: string,
  startDate?: string,
  endDate?: string,
  categoryId?: number
): Promise<{ adjusted_fee_metrics: AdjustedFeeMetrics }> {
  return request<{ adjusted_fee_metrics: AdjustedFeeMetrics }>("/adjusted-fee", {
    params: {
      merchant_key: merchantKey,
      start_date: startDate,
      end_date: endDate,
      category_id: categoryId,
    },
  });
}

export async function fetchAdjustedFeeTrend(
  merchantKey?: string,
  startDate?: string,
  endDate?: string
): Promise<{ fee_trend: AdjustedFeeTrendPoint[]; traceability: MetricTrace }> {
  return request<{ fee_trend: AdjustedFeeTrendPoint[]; traceability: MetricTrace }>(
    "/adjusted-fee/trend",
    {
      params: { merchant_key: merchantKey, start_date: startDate, end_date: endDate },
    }
  );
}

export async function fetchAdjustedFeeByMerchant(
  startDate?: string,
  endDate?: string,
  categoryId?: number
): Promise<{
  fee_by_merchant: AdjustedFeeByMerchant[];
  traceability: MetricTrace;
}> {
  return request<{
    fee_by_merchant: AdjustedFeeByMerchant[];
    traceability: MetricTrace;
  }>("/adjusted-fee/merchants", {
    params: { start_date: startDate, end_date: endDate, category_id: categoryId },
  });
}

export async function fetchAdjustedFeeByCategory(
  startDate?: string,
  endDate?: string,
  merchantKey?: string
): Promise<{
  fee_by_category: AdjustedFeeByCategory[];
  traceability: MetricTrace;
}> {
  return request<{
    fee_by_category: AdjustedFeeByCategory[];
    traceability: MetricTrace;
  }>("/adjusted-fee/categories", {
    params: { start_date: startDate, end_date: endDate, merchant_key: merchantKey },
  });
}

// ─── api object for convenience ────────────────────────────────

export const api = {
  // Stage 1
  getHealth: fetchHealth,
  getMerchants: fetchMerchants,
  getOverview: fetchOverview,
  getDailyTrends: fetchTrends,
  // Stage 2
  getSalesShare: fetchSalesShare,
  getActivityDaily: fetchActivityDaily,
  getActivityMonthly: fetchActivityMonthly,
  getActivityYearly: fetchActivityYearly,
  getMerchantsRanking: fetchMerchantsRanking,
  getHighestActivityDay: fetchHighestActivityDay,
  getHighestActivityMonth: fetchHighestActivityMonth,
  getPreviousPeriodComparison: fetchComparison,
  // Stage 3
  getAdjustedFeeMetrics: fetchAdjustedFeeMetrics,
  getAdjustedFeeTrend: fetchAdjustedFeeTrend,
  getAdjustedFeeByMerchant: fetchAdjustedFeeByMerchant,
  getAdjustedFeeByCategory: fetchAdjustedFeeByCategory,
};
