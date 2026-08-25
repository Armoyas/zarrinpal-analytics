# API Reference

Base URL: `http://localhost:8000/api/v1`

All amounts are in Iranian Rials (IRR). All date filters accept ISO 8601 format (`YYYY-MM-DD`).

## Sales Definition

Two amount definitions are used across the API:

| Definition | Description | Counting Unit | Used By |
|-----------|-------------|---------------|---------|
| `total_amount` (Stage 1) | `SUM(amount)` over all rows | rows | Overview, merchants, time-series |
| `successful_amount` (Stage 2) | `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')` | rows | Sales share, activity trends, ranking |

---

## Health & Schema

### `GET /api/v1/health`
Checks API and database connectivity.

**Response** (`200 OK`):
```json
{
  "status": "ok",
  "detail": "DuckDB connected, CSV loaded successfully"
}
```

### `GET /api/v1/schema`
Returns the dataset schema with column names, types, and null counts.

**Response** (`200 OK`):
```json
[
  {"column": "session_key", "type": "VARCHAR", "null_count": 0},
  {"column": "amount", "type": "INTEGER", "null_count": 0},
  ...
]
```

### `GET /api/v1/schema/status-distribution`
Returns distribution of `session_status` values.

**Response** (`200 OK`):
```json
[
  {"session_status": "Verified", "count": 4484, "percentage": 44.84},
  {"session_status": "Paid", "count": 1030, "percentage": 10.30},
  ...
]
```

---

## Stage 1: Overview (Core Merchant Overview)

### `GET /api/v1/overview`
Get overview KPIs based on confirmed CSV columns.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string | null | ISO date: `2024-01-01` |
| `end_date` | string | null | ISO date: `2024-12-31` |
| `merchant_key` | string | null | Filter by `merchant_key` |

**Response** (`200 OK`):
```json
{
  "total_attempts": 10000,
  "unique_sessions": 8451,
  "total_verified": 4706,
  "total_settled": 0,
  "total_failed": 1497,
  "amount": {
    "total_rials": 1234567890,
    "avg_per_attempt_rials": 123456,
    "currency": "IRR"
  },
  "success_rate": 23.45,
  "failure_rate": 14.97,
  "adjusted_fee_total": 876543,
  "how_calculated": { ... }
}
```

**Important**: Rows are payment attempts (`try_seq`), not unique sessions. The `total_settled` field is typically 0 because `settled_at` is NULL for 98.95% of rows.

### `GET /api/v1/merchants`
Get merchant rankings.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Max merchants to return |
| `min_attempts` | integer | 1 | Minimum attempt count |
| `start_date` | string | null | ISO date filter |
| `end_date` | string | null | ISO date filter |

**Response** (`200 OK`):
```json
[
  {
    "merchant_key": "M250",
    "category_title": "Shop",
    "terminal_key": "T1",
    "total_attempts": 400,
    "total_amount": 123456789,
    "success_rate": 36.5,
    "avg_amount": 308641,
    "rank_by_amount": 1,
    "amount_share_pct": 14.25
  }
]
```

### `GET /api/v1/merchants/{merchant_key}`
Get comprehensive merchant detail with drill-down metrics.

**Response**: Overview stats, status breakdown, daily trend, peer comparison.

### `GET /api/v1/merchants/{merchant_key}/peer-comparison`
Compare a merchant against its category peers.

### `GET /api/v1/time-series`
Get time series data.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `metric` | string | attempts | attempts, amount, revenue, paid, failed |
| `interval` | string | day | day, week, month |
| `start_date` | string | null | ISO date filter |
| `end_date` | string | null | ISO date filter |
| `merchant_key` | string | null | Filter by merchant |

### `GET /api/v1/time-series/daily-trends`
Get daily volume, count, and success-rate trend (last 90 days by default).

---

## Stage 2: Sales Share and Time-Based Analytics

### `GET /api/v1/sales/share`
Merchant and category sales share with traceability.

**Sales** = `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string | null | ISO date: `2024-01-01` |
| `end_date` | string | null | ISO date: `2024-12-31` |
| `merchant_key` | string | null | Filter by merchant |
| `category_id` | string | null | Filter by category |

**Response** (`200 OK`):
```json
{
  "merchant_sales_share": [
    {
      "merchant_key": "M250",
      "attempt_count": 400,
      "unique_sessions": 380,
      "total_amount": 123456789,
      "verified_count": 146,
      "successful_amount": 87012345,
      "amount_share_pct": 14.25,
      "successful_amount_share_pct": 18.50,
      "rank_by_amount": 1,
      "rank_by_count": 1
    }
  ],
  "category_sales_share": [
    {
      "category_id": "1",
      "category_title": "Shop",
      "attempt_count": 2500,
      "total_amount": 456789000,
      "successful_amount": 123456000,
      "amount_share_pct": 52.50,
      "successful_amount_share_pct": 42.50,
      "rank_by_amount": 1
    }
  ],
  "summary": {
    "total_amount": 870123456,
    "successful_amount": 456789012,
    "total_attempts": 10000,
    "total_sessions": 8451,
    "total_verified": 6996
  },
  "how_calculated": {
    "sales_definition": "Stage 2: amount from rows where session_status IN ('Verified','Paid','Reversed')",
    "total_amount": "SUM(amount) - all attempt amounts in Rials",
    "successful_amount": "SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')",
    "amount_share_pct": "merchant_amount / total_amount * 100",
    "successful_amount_share_pct": "merchant_successful_amount / total_successful_amount * 100",
    "counting_unit": "rows (amount in IRR)",
    "limitation": "settled_at is NULL for 98.95% of rows; session_status used instead"
  },
  "filters": { "merchant_key": null, "category_id": null, ... }
}
```

### `GET /api/v1/activity/daily`
Daily activity trend with previous-day comparison.

**Response** (`200 OK`):
```json
{
  "daily_activity": [
    {
      "period": "2024-01-01",
      "attempt_count": 45,
      "total_amount": 23456789,
      "successful_amount": 12345678,
      "verified_count": 13,
      "failed_count": 5,
      "success_rate": 28.89,
      "previous_period_count": null,
      "count_change_pct": null,
      "previous_period_amount": null,
      "amount_change_pct": null
    }
  ],
  "period_summary": { "total_attempts": 45, "total_successful_amount": 12345678 },
  "how_calculated": { ... }
}
```

### `GET /api/v1/activity/monthly`
Monthly activity trend (groups by `YYYY-MM`).

### `GET /api/v1/activity/yearly`
Yearly activity trend (groups by year integer).

### `GET /api/v1/merchants/ranking`
Top merchants by amount or count, with highest activity day/month/year.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort_by` | string | amount | `amount` or `count` |
| `limit` | integer | 10 | Results to return (1-100) |
| `start_date` | string | null | ISO date filter |
| `end_date` | string | null | ISO date filter |

**Response** (`200 OK`):
```json
{
  "ranking": [
    {
      "merchant_key": "M250",
      "category_title": "Shop",
      "attempt_count": 400,
      "total_amount": 123456789,
      "verified_count": 146,
      "successful_amount": 87012345,
      "success_rate": 36.5,
      "amount_rank": 1,
      "count_rank": 1,
      "amount_share_pct": 14.25
    }
  ],
  "highest_activity_day": { "day": "2024-03-15", "attempt_count": 320, "total_amount": 78901234, "successful_amount": 45678901 },
  "highest_activity_month": { "month": "2024-03", "attempt_count": 8900, ... },
  "highest_activity_year": { "year": 2024, "attempt_count": 10000, ... },
  "sort_by": "amount",
  "limit": 10,
  "how_calculated": { ... }
}
```

### `GET /api/v1/activity/highest-day`
Returns the single day with the highest payment attempt count.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `merchant_key` | string | Filter by merchant |
| `start_date` | string | ISO date |
| `end_date` | string | ISO date |

### `GET /api/v1/activity/highest-month`
Returns the single month with the highest payment attempt count.

### `GET /api/v1/calculation-details`
Returns all metric definitions with traceability metadata.

**Response** (`200 OK`):
```json
{
  "metrics": [
    {
      "metric_id": "attempt_count",
      "name": "Payment attempt count",
      "name_fa": "تعداد تلاش‌های پرداخت",
      "definition": "Number of raw rows in the filtered dataset.",
      "formula": "COUNT(*) WHERE filters",
      "source_columns": ["*"],
      "counting_unit": "rows",
      "filters": ["merchant_key", "category_id", "date_range"],
      "limitations": "One row = one payment attempt..."
    }
  ],
  "sales_definition_stage1": "All rows matching filter. Counting unit: rows.",
  "sales_definition_stage2": "Amount from rows where session_status IN ('Verified','Paid','Reversed')...",
  "stage2_sales_rationale": [ ... ]
}
```

### `GET /api/v1/categories`
Get all merchant categories with aggregated metrics.

### `GET /api/v1/categories/distribution`
Get category distribution with share percentages.

### `GET /api/v1/categories/{category_id}`
Get detailed category analysis with time series.

### `GET /api/v1/high-value/analysis`
Analyze high-value payments above a configurable threshold.

---

## Error Responses

### `400 Bad Request`
- Invalid `sort_by` parameter (must be `amount` or `count`)
- Invalid `interval` parameter (must be `day`, `month`, or `year`)

### `404 Not Found`
- Merchant not found at `/api/v1/merchants/{merchant_key}`

---

## Notes

- All endpoints return plain Python dicts/lists (no Pydantic response models on Stage 2 endpoints)
- Empty results return valid structures with zero values (no errors)
- Invalid date ranges (start > end) return empty results gracefully
- Division-by-zero is handled (returns 0.0 or None)
