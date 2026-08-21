# Specification: Phase 1 — API Foundation

> **Status:** Implemented
> **Phase:** Phase 1
> **Created:** 2026-08-21
> **Depends on:** `specs/phase-0-schema-foundation/spec.md`

---

## 1. Overview

This specification defines the FastAPI backend API for the ZarrinPal Analytics project.
It provides traceable, explainable metrics backed by DuckDB (direct CSV querying).

Only columns and business rules confirmed in the Phase 0 data dictionary are used.

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    services/api/                         │
│                                                          │
│  app/main.py           ← FastAPI entry point + router   │
│  app/config.py         ← Settings (DATA_FILE, DEBUG)      │
│  app/db/duckdb_database.py ← DuckDBManager (all SQL)      │
│  app/api/v1/endpoints/__init__.py ← API routes            │
│  app/services/data_processor.py  ← Row-level processing   │
│  app/schemas/__init__.py ← Pydantic response models      │
│  tests/                ← pytest test suite (10 tests)     │
│  Dockerfile                                               │
│  requirements.txt                                         │
└─────────────────────────────────────────────────────────┘
                    │
                    │ reads
                    ▼
          data/sample_data.csv  (or full_dataset.csv)
```

Key principles:
- **DuckDB** for all analytics queries — no PostgreSQL, no ORM
- **Direct SQL** for traceability — every metric has an explicit `SELECT`
- **Pydantic v2** response models for API contracts
- Every metric response includes `calculation` metadata

## 3. Environment Configuration

`.env` (copy from `.env.example`):
```env
DATA_FILE=data/sample_data.csv
DUCKDB_PATH=/app/data/analytics.duckdb
DEBUG=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 4. API Endpoints

### 4.1 `GET /api/v1/health`

Returns service health and basic database info.

**Response:**
```json
{
  "status": "healthy",
  "database": true,
  "row_count": 10000,
  "columns": 22,
  "csv_path": "data/sample_data.csv"
}
```

### 4.2 `GET /api/v1/schema`

Returns the data dictionary — all 22 confirmed columns with types and metadata.

**Response:**
```json
{
  "columns": [...],
  "total_rows": 10000,
  "last_updated": "2026-08-21T...",
  "notes": {
    "currency": "Rial (IRR)",
    "rows_are_attempts": true,
    "adjusted_fee_note": "Confidentiality-scaled; relative comparisons only"
  }
}
```

### 4.3 `GET /api/v1/overview`

Returns overview metrics for filtered dataset.

**Query params:**
- `merchant_key` (optional, string)
- `start_date` (optional, date)
- `end_date` (optional, date)

**Response:**
```json
{
  "metrics": {
    "total_attempts": 10000,
    "successful_attempts": 4552,
    "failed_attempts": 1424,
    "success_rate": 45.52,
    "total_amount": 2500000000,
    "avg_amount": 550000,
    "active_days": 365,
    "fee_share_percent": 1.2
  },
  "calculation_metadata": {
    "adjusted_fee_note": "Confidentiality-scaled value; only relative comparisons are valid",
    "rows_are_attempts": true,
    "currency": "Rial (IRR)",
    "source": "data/sample_data.csv"
  }
}
```

### 4.4 `GET /api/v1/merchants`

Returns merchant ranking.

**Query params:**
- `start_date` (optional), `end_date` (optional), `limit` (default 20)

**Response:**
```json
[
  {
    "merchant_key": "M1033",
    "category_title": "...",
    "total_amount": 250000000,
    "successful_attempts": 45,
    "success_rate": 90.0,
    "avg_amount": 5500000,
    "rank": 1
  }
]
```

### 4.5 `GET /api/v1/metrics/definitions`

Returns all metric definitions with formulas (for "How calculated?" UI).

**Response:**
```json
{
  "metrics": {
    "total_attempts": {
      "name": "Total Payment Attempts",
      "formula": "COUNT(*) FROM payments",
      "columns_required": [],
      "limitations": "Rows are payment attempts, not unique transactions",
      ...
    }
  }
}
```

### 4.6 `GET /api/v1/time-series`

Returns daily time-series data.

**Query params:**
- `metric` (required: `attempts | amount | success_rate`)
- `start_date`, `end_date` (optional)
- `merchant_key` (optional)

**Response:**
```json
{
  "data": [
    {"date": "2024-01-01", "value": 45}
  ],
  "metric": "attempts",
  "currency": "Rial"
}
```

### 4.7 `GET /api/v1/time-series/daily-trends`

Returns daily trend breakdown (attempts, amount, success rate per day).

**Query params:** `merchant_key` (optional), `days` (optional, default 30)

## 5. Business Rules

1. **Success** = `session_status IN ('Verified', 'Paid', 'Reversed')`
2. **Failed** = `session_status IN ('Failed', 'NoAttempt')`
3. **`adjusted_fee`** ≠ real fee — confidentiality-scaled. Relative comparisons only.
4. **Rows** = payment attempts, not unique sessions.

See `docs/AGENTS.md` Business Rules section for full definitions.

## 6. Test Plan

All tests in `services/api/tests/test_duckdb.py`:

| Test | Description |
|------|-------------|
| `test_db_health` | DuckDB connection, row count, column count |
| `test_db_schema` | All 22 columns present with correct types |
| `test_overview_metrics` | Correct values for all overview metrics |
| `test_merchants_ranking` | Merchants sorted by total amount, uses real columns |
| `test_merchants_columns_exist` | Response has expected columns |
| `test_time_series` | Daily aggregation with filters |
| `test_time_series_invalid_metric` | Invalid metric rejected |
| `test_no_customer_or_product_columns` | Confirms absence of unsupported columns |
| `test_adjusted_fee_not_presented_as_real` | adjusted_fee note is present |
| `test_metrics_definitions` | All 8 metrics defined with formulas |
| `test_daily_trends` | Daily trends with optional merchant filter |
| `test_peer_comparison` | Peer comparison query |

## 7. Running Locally

```bash
cd services/api
pip install -r requirements.txt
python ../../scripts/seed_demo.py --rows 10000 --out data/sample_data.csv
PYTHONPATH=.:./app/db pytest tests/ -v
uvicorn app.main:app --reload --port 8000
```

## 8. Excluded from This Phase

- Customer retention analysis (no `customer_id` column)
- Product sales analysis (no `product_id` column)
- PostgreSQL integration
- Metabase integration
- AI recommendation engine
