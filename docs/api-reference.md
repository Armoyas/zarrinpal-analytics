# API Reference

**Stage:** 1 — Core Merchant Overview  
**Last Updated:** 2026-08-22  
**Base URL:** `http://localhost:8000/api/v1`

---

## Endpoints

### GET `/health`

Service health check.

**Response:**

```json
{
  "status": "healthy",
  "stage": "1-core-overview",
  "data_available": true
}
```

---

### GET `/schema`

Dataset schema with null counts and column roles.

**Response:**

```json
{
  "columns": [
    {
      "name": "session_key",
      "type": "VARCHAR",
      "null_count": 0,
      "null_pct": 0.00,
      "role": "session_id"
    }
  ],
  "row_count": 10000,
  "columns_count": 22
}
```

---

### GET `/merchants`

Merchant list with aggregate stats, optionally filtered by category.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category_id` | integer | No | Filter merchants by business category |

**Response:**

```json
{
  "merchants": [
    {
      "merchant_key": "M1000",
      "category_id": 1,
      "category_title": "آموزش و آموزشگاه",
      "terminal_keys": ["T5000", "T5001", "T5002"],
      "row_count": 200,
      "total_amount": 5000000000,
      "verified_count": 150
    }
  ],
  "traceability": {
    "metric_id": "merchant_list",
    "definition": "List of merchants with aggregate stats",
    "formula": "SELECT merchant_key, category_id, category_title, LIST(DISTINCT terminal_key), COUNT(*), SUM(amount), COUNT(Verified) GROUP BY merchant_key",
    "source_columns": ["merchant_key", "category_id", "category_title", "terminal_key", "amount", "session_status"],
    "counting_unit": "merchant",
    "filters": {},
    "limitations": "All merchants use all 3 terminals (many-to-many relationship)"
  }
}
```

---

### GET `/overview`

Overview metrics for a given merchant and date range.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `merchant_key` | string | No | Merchant to filter by; omit for all merchants |
| `start_date` | string (YYYY-MM-DD) | No | Start date filter |
| `end_date` | string (YYYY-MM-DD) | No | End date filter |

**Error Responses:**

- `400 Bad Request` — When `start_date > end_date`

**Response:**

```json
{
  "merchant_key": "M1000",
  "date_range": {
    "start": "1300-01-01",
    "end": "1450-12-30"
  },
  "metrics": [
    {
      "metric_id": "payment_attempts",
      "label": "تعداد تلاش‌های پرداخت",
      "value": 200,
      "definition": "تعداد کل ردیف‌های (سعی‌ها) در دیتاست",
      "formula": "COUNT(*)",
      "source_columns": ["session_key", "try_seq"],
      "counting_unit": "row",
      "filters": {"merchant_key": "M1000"},
      "limitations": null
    }
  ]
}
```

**Available Metrics:**

| metric_id | Label | Counting Unit |
|-----------|-------|---------------|
| `payment_attempts` | تعداد تلاش‌های پرداخت | row |
| `unique_sessions` | سشن‌های منحصر به فرد | session |
| `verified_count` | پرداخت‌های تأیید شده | verified_session |
| `settled_count` | پرداخت‌های تسویه شده | settled_session |
| `failed_count` | شکست‌های پرداخت | row |
| `success_rate` | نرخ موفقیت | verified_session |
| `total_amount` | مجموع مبلغ | row |
| `avg_amount` | متوسط مبلغ | row |

---

### GET `/trends`

Daily aggregation data for trend charts.

**Query Parameters:** Same as `/overview`.

**Response:**

```json
{
  "merchant_key": "M1000",
  "date_range": {
    "start": "1300-01-01",
    "end": "1450-12-30"
  },
  "daily": [
    {
      "date": "2024-01-01",
      "attempts": 8,
      "amount": 120000000,
      "sessions": 8,
      "verified": 6,
      "failed": 2
    }
  ],
  "traceability": {
    "metric_id": "daily_activity_trend",
    "definition": "Daily aggregation of payment attempts, sessions, verified count, failed count, and total amount",
    "formula": "GROUP BY CAST(created_at AS DATE) → COUNT(*), COUNT(DISTINCT session_key), SUM(amount), COUNT(Verified), COUNT(Failed)",
    "source_columns": ["created_at", "session_key", "amount", "session_status"],
    "counting_unit": "row",
    "filters": {"merchant_key": "M1000"},
    "limitations": null
  }
}
```

---

## Data Flow

```
CSV → DuckDB (backend) → FastAPI JSON → Next.js Frontend (RTL, Persian)
```

**All metric calculations happen in the backend.** The frontend fetches
pre-computed metrics and displays them with traceability metadata.
