/**
 * Strongly-typed interfaces for the Analytical Dashboard frontend.
 * These mirror the Pydantic response models in the backend.
 */

// ─── Shared types ──────────────────────────────────────────────

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

export interface MerchantOption {
  value: string;
  label: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// ─── Stage 1: Core Merchant Overview ───────────────────────────

export interface MerchantInfo {
  merchant_key: string;
  category_id: number;
  category_title: string;
  terminal_keys: string[];
  row_count: number;
  total_amount: number;
  verified_count: number;
}

export interface OverviewMetrics {
  attempt_count: number;
  unique_session_count: number;
  verified_count: number;
  failed_count: number;
  success_rate: number;
  amount: {
    total_rials: number;
    avg_per_attempt_rials: number;
    avg_per_verified_rials: number;
  };
}

export interface DailyTrendPoint {
  date: string;
  daily_count: number;
  daily_amount: number;
}

// ─── Stage 2: Sales Share & Time Analytics ──────────────────────

export interface SalesShareItem {
  breakdown_type: "merchant" | "category";
  label: string;
  merchant_key?: string;
  category_title?: string;
  successful_amount: number;
  total_attempted_amount: number;
  share_percentage: number;
  payment_count: number;
  success_rate: number;
  traceability: MetricTrace;
}

export interface ActivityPoint {
  date: string;
  period: string;
  payment_count: number;
  successful_amount: number;
  total_attempted_amount: number;
  success_rate: number;
}

export interface MerchantRankingItem {
  merchant_key: string;
  category_title: string;
  total_amount: number;
  successful_amount: number;
  payment_count: number;
  verified_count: number;
  share_percentage: number;
  traceability: MetricTrace;
}

export interface PeakPeriod {
  day: string;
  payment_count: number;
  successful_amount: number;
}

export interface ComparisonPoint {
  current_period: string;
  previous_period: string;
  current_count: number;
  previous_count: number;
  count_growth_percentage: number;
  current_amount: number;
  previous_amount: number;
  amount_growth_percentage: number;
}

// ─── Stage 3: Adjusted-Fee Analysis ─────────────────────────────

export interface AdjustedFeeMetrics {
  total_fee_indicator: number;
  avg_fee_indicator: number;
  total_amount: number;
  fee_share_of_amount: number;
  success_rate: number;
  traceability: MetricTrace;
}

export interface AdjustedFeeTrendPoint {
  period: string;
  total_fee: number;
  avg_fee: number;
  fee_share_percentage: number;
}

export interface AdjustedFeeByMerchant {
  merchant_key: string;
  category_title: string;
  total_fee_indicator: number;
  avg_fee_indicator: number;
  fee_share_of_amount: number;
  traceability: MetricTrace;
}

export interface AdjustedFeeByCategory {
  category_title: string;
  total_fee_indicator: number;
  avg_fee_indicator: number;
  fee_share_of_amount: number;
  traceability: MetricTrace;
}
