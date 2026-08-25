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
  value: any;
  definition: string;
  formula: string;
  source_columns: string[];
  counting_unit: string;
  filters: Record<string, any>;
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
