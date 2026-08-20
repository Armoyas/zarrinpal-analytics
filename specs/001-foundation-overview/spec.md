# Specification: Foundation & Merchant Overview

> **Status:** Approved
> **Created:** 2026-08-20
> **Phase:** Phase 0 Completion → Phase 1 Foundation
> **Approver:** Human review of docs/data-dictionary.md

---

## 1. Overview

This specification defines the **Foundation** feature set and **Merchant Overview** dashboard for the ZarrinPal Analytics project. It is the first product specification (Spec #001) produced after Phase 0 schema inspection.

Only columns and business rules **confirmed in** `docs/data-dictionary.md` are used.

## 2. Goals

- Provide a working analytics backend with traceable, explainable metrics
- Enable Persian RTL merchant overview dashboard with KPI cards and time-series trend
- Establish a foundation where every metric has calculable metadata ("how calculated?")
- Protect the full dataset from Git
- No PostgreSQL, no ORM, no Metabase in this phase

## 3. Constraints

- **Dataset:** `data/sample_data.csv` (10,000 rows sample) or full CSV (~500 MB)
- **Full CSV must never be committed to Git**
- **Currency:** Rial (IRR)
- **Rows represent payment attempts**, not unique transactions
- `adjusted_fee` is confidentiality-scaled — **relative comparisons only**
- No `customer_id`, `product_id`, or `inventory` columns exist in the data
- Customer, product, and inventory analysis are **explicitly out of scope**
- Persian RTL rendering required (Vazirmatn font)

## 4. Data Model (Confirmed Columns)

| Column | Type | Source of truth | Metric usage |
|--------|------|-----------------|--------------|
| `session_key` | string | Unique session ID | Provenance |
| `try_seq` | integer | Attempt number within session | Filtering |
| `terminal_key` | string | Payment gateway alias | Provenance |
| `merchant_key` | string | Merchant identifier | **Merchant dimension** |
| `category_id` | integer | Business category code | Peer grouping |
| `category_title` | string | Business category name | Display |
| `amount` | integer | Amount in Rials | **Amount metric** |
| `adjusted_fee` | integer | Confidentiality-scaled fee | **Relative fee metric** |
| `session_status` | string | Session-level status | **Success metric** |
| `try_status` | string | Attempt-level status | Provenance |
| `switch_response_code` | string | Bank switch response (nullable, 93.88% null) | Provenance |
| `psp_code` | string | PSP identifier (nullable) | Provenance |
| `issuer_bank_code` | string | Issuer bank (nullable, 93.88% null) | Provenance |
| `payer_card_key` | string | Payer card alias (nullable, 93.88% null) | Provenance |
| `verify_type` | string | Automated/Manual verify | Provenance |
| `init_time_ms` | float | Init API response time (nullable) | Provenance |
| `verify_time_ms` | float | Verify API response time (nullable) | Provenance |
| `created_at` | datetime | Session creation time | **Date column** |
| `try_created_at` | datetime | Attempt creation time (nullable) | Provenance |
| `verified_at` | datetime | Verification time (nullable) | Provenance |
| `settled_at` | datetime | Settlement time (nullable) | Provenance |
| `expire_in` | integer | Session expiration seconds | Provenance |

### Status Values

`session_status` values: `Verified`, `Paid`, `InBank`, `Failed`, `Reversed`, `NoAttempt`

See `docs/AGENTS.md` Business Rules for full definitions.

## 5. Metric Definitions

### 5.1 Total Payment Attempts

- **Name:** Total payment attempts
- **Business meaning:** Number of payment attempt rows in the dataset
- **Required columns:** (none, all rows)
- **Formula:** `COUNT(*) FROM payments`
- **Filters:** Date range, merchant key
- **Edge cases:** Empty dataset → 0
- **Limitations:** Rows are attempts, not unique sessions
- **Example SQL:**
  ```sql
  SELECT COUNT(*) as total_attempts FROM payments
  WHERE CAST(created_at AS DATE) >= '2024-01-01'
  ```
- **Acceptance criteria:** Returns integer ≥ 0; updates when filters change

### 5.2 Successful Attempts

- **Name:** Successful attempts
- **Business meaning:** Payment attempts that completed the payment lifecycle
- **Required columns:** `session_status`
- **Formula:** `COUNT(*) WHERE session_status IN ('Verified', 'Paid', 'Reversed')`
- **Success definition rationale:** `Verified` = merchant verified (complete). `Paid` = money taken but not yet verified. `Reversed` = money taken and returned. All three involve actual payment.
- **Filters:** Date range, merchant key
- **Edge cases:** No successful attempts → 0
- **Limitations:** `Paid` attempts are not yet verified by the merchant; they represent potential revenue
- **Example SQL:**
  ```sql
  SELECT COUNT(*) as successful_attempts FROM payments
  WHERE session_status IN ('Verified', 'Paid', 'Reversed')
  ```
- **Acceptance criteria:** Returns integer ≥ 0; matches the sum of individual status counts

### 5.3 Failed Attempts

- **Name:** Failed attempts
- **Business meaning:** Payment attempts that failed
- **Required columns:** `session_status`
- **Formula:** `COUNT(*) WHERE session_status IN ('Failed', 'NoAttempt')`
- **Filters:** Date range, merchant key
- **Edge cases:** No failed attempts → 0
- **Limitations:** `NoAttempt` means the session never reached the bank stage — not a true failure
- **Example SQL:**
  ```sql
  SELECT COUNT(*) as failed_attempts FROM payments
  WHERE session_status IN ('Failed', 'NoAttempt')
  ```
- **Acceptance criteria:** Returns integer ≥ 0

### 5.4 Success Rate

- **Name:** Success rate
- **Business meaning:** Percentage of payment attempts that were successful
- **Required columns:** `session_status`
- **Formula:** `successful_attempts / total_attempts * 100`
- **Filters:** Date range, merchant key
- **Edge cases:** `total_attempts = 0` → return `null` (display "N/A")
- **Limitations:** Success includes `Paid` which is not yet merchant-verified
- **Example SQL:**
  ```sql
  SELECT
    CASE WHEN COUNT(*) = 0 THEN NULL
    ELSE ROUND(COUNT(CASE WHEN session_status IN ('Verified', 'Paid', 'Reversed') THEN 1 END) * 100.0 / COUNT(*), 2)
  END as success_rate
  FROM payments
  ```
- **Acceptance criteria:** Returns float between 0 and 100, or null when undefined

### 5.5 Total Payment Amount

- **Name:** Total payment amount
- **Business meaning:** Sum of all payment attempt amounts
- **Required columns:** `amount`
- **Formula:** `SUM(amount) FROM payments`
- **Filters:** Date range, merchant key, status (optional)
- **Edge cases:** Empty dataset → 0
- **Limitations:** Includes amounts from failed attempts (they were authorized but not settled)
- **Example SQL:**
  ```sql
  SELECT COALESCE(SUM(amount), 0) as total_amount FROM payments
  WHERE session_status IN ('Verified', 'Paid', 'Reversed')
  ```
- **Acceptance criteria:** Returns integer ≥ 0

### 5.6 Average Payment Amount

- **Name:** Average payment amount
- **Business meaning:** Average amount per successful payment
- **Required columns:** `amount`, `session_status`
- **Formula:** `SUM(amount WHERE success) / COUNT(*) WHERE success`
- **Filters:** Date range, merchant key
- **Edge cases:** 0 successful attempts → return `null`
- **Limitations:** Includes `Paid` attempts which are not yet verified
- **Example SQL:**
  ```sql
  SELECT
    CASE WHEN COUNT(*) = 0 THEN NULL
    ELSE ROUND(SUM(amount) * 1.0 / COUNT(*), 0)
  END as avg_amount
  FROM payments
  WHERE session_status IN ('Verified', 'Paid', 'Reversed')
  ```
- **Acceptance criteria:** Returns float ≥ 0, or null when no successful attempts

### 5.7 Active Days

- **Name:** Active days
- **Business meaning:** Number of unique dates with payment activity
- **Required columns:** `created_at`
- **Formula:** `COUNT(DISTINCT CAST(created_at AS DATE))`
- **Filters:** Date range, merchant key
- **Edge cases:** Empty dataset → 0
- **Limitations:** Counts days with any attempt, even if all failed
- **Example SQL:**
  ```sql
  SELECT COUNT(DISTINCT CAST(CAST(created_at AS DATE) AS DATE)) as active_days FROM payments
  ```
- **Acceptance criteria:** Returns integer ≥ 0

### 5.8 Fee Share (Relative)

- **Name:** Fee share of revenue
- **Business meaning:** adjusted_fee as a percentage of total amount (relative comparison only)
- **Required columns:** `amount`, `adjusted_fee`
- **Formula:** `SUM(adjusted_fee) / SUM(amount) * 100`
- **Filters:** Date range, merchant key
- **Edge cases:** `SUM(amount) = 0` → return `null`
- **Limitations:** `adjusted_fee` is **NOT the real ZarinPal fee** — it is confidentiality-scaled by a constant factor. Only relative comparisons (trends, peer ranking) are valid. The absolute percentage must not be presented as the real fee rate.
- **Example SQL:**
  ```sql
  SELECT
    CASE WHEN SUM(amount) = 0 THEN NULL
    ELSE ROUND(SUM(adjusted_fee) * 100.0 / SUM(amount), 2)
  END as fee_share_percent
  FROM payments
  ```
- **Acceptance criteria:** Returns float or null; UI shows a warning tooltip explaining `adjusted_fee` is scaled

### 5.9 Merchant Ranking by Amount

- **Name:** Merchant ranking
- **Business meaning:** Ranks merchants by total payment amount
- **Required columns:** `merchant_key`, `amount`, `session_status`
- **Formula:** `RANK() OVER (ORDER BY SUM(amount DESC) WHERE success)`
- **Filters:** Date range
- **Edge cases:** All amounts zero → all ranks tie at 1
- **Limitations:** Based on `adjusted_fee` is not used here (uses real `amount`)
- **Example SQL:**
  ```sql
  SELECT merchant_key, SUM(amount) as total_amount,
    DENSE_RANK() OVER (ORDER BY SUM(amount) DESC) as rank
  FROM payments
  WHERE session_status IN ('Verified', 'Paid', 'Reversed')
  GROUP BY merchant_key
  ORDER BY total_amount DESC
  LIMIT 20
  ```
- **Acceptance criteria:** Returns up to 20 merchants ranked by total successful amount

## 6. API Endpoints

### 6.1 GET /api/v1/health

- **Purpose:** Service health check
- **Response:**
  ```json
  {
    "status": "healthy",
    "database": true,
    "row_count": 10000,
    "columns": 22
  }
  ```
- **Acceptance criteria:** Returns 200 when DuckDB is accessible and CSV is loaded

### 6.2 GET /api/v1/schema

- **Purpose:** Return the data dictionary / schema
- **Response:** Full column metadata from `docs/data-dictionary.md` and `docs/schema-summary.json`
- **Acceptance criteria:** Returns 200 with all 22 columns and their types

### 6.3 GET /api/v1/overview

- **Purpose:** Return overview metrics for the selected filters
- **Query params:**
  - `merchant_key` (optional, string)
  - `start_date` (optional, date)
  - `end_date` (optional, date)
- **Response:**
  ```json
  {
    "metrics": {
      "total_attempts": { "value": 10000, "unit": "count" },
      "successful_attempts": { "value": 4552, "unit": "count" },
      "failed_attempts": { "value": 1424, "unit": "count" },
      "success_rate": { "value": 45.52, "unit": "percent" },
      "total_amount": { "value": 2500000000, "unit": "rial" },
      "avg_amount": { "value": 550000, "unit": "rial" },
      "active_days": { "value": 365, "unit": "days" },
      "fee_share_percent": { "value": 1.2, "unit": "percent", "note": "relative only" }
    },
    "filters": { "merchant_key": null, "start_date": "2024-01-01", "end_date": "2024-12-31" },
    "calculation_metadata": {
      "adjusted_fee_note": "Confidentiality-scaled value; only relative comparisons are valid",
      "rows_are_attempts": true,
      "currency": "Rial (IRR)",
      "source": "data/sample_data.csv"
    }
  }
  ```
- **Acceptance criteria:**
  - All metrics update when filters change
  - `fee_share_percent` includes `note: "relative only"`
  - `calculation_metadata` is present and descriptive
  - Edge cases (empty dataset, no successful attempts) handled gracefully

### 6.4 GET /api/v1/merchants

- **Purpose:** Return merchant ranking and per-merchant metrics
- **Query params:**
  - `start_date` (optional, date)
  - `end_date` (optional, date)
  - `limit` (optional, default 20)
- **Response:**
  ```json
  [
    {
      "merchant_key": "M1033",
      "total_amount": 250000000,
      "successful_attempts": 45,
      "success_rate": 90.0,
      "avg_amount": 5500000,
      "rank": 1
    }
  ]
  ```
- **Acceptance criteria:** Returns ranked merchants; sorted by total amount descending

### 6.5 GET /api/v1/time-series

- **Purpose:** Return daily time-series data for charting
- **Query params:**
  - `metric` (required: `attempts` | `amount` | `success_rate`)
  - `merchant_key` (optional)
  - `start_date` (optional)
  - `end_date` (optional)
- **Response:**
  ```json
  {
    "data": [
      { "date": "2024-01-01", "value": 45 },
      { "date": "2024-01-02", "value": 38 }
    ],
    "metric": "attempts",
    "currency": "Rial"
  }
  ```
- **Acceptance criteria:** Returns daily values; groups by `CAST(created_at AS DATE)`

## 7. Frontend Components

### 7.1 DashboardLayout

- RTL with Vazirmatn font
- Sidebar with navigation links
- Header with date range picker

### 7.2 OverviewKPICard

- Displays a single metric with label and value
- Shows "How calculated?" tooltip with formula explanation
- Handles loading, error, and empty states

### 7.3 OverviewDashboard

- Grid of KPI cards: Total Attempts, Successful Attempts, Failed Attempts, Success Rate, Total Amount, Average Amount
- Time-series chart (Recharts) for daily trend
- Merchant selector dropdown

### 7.4 MerchantRankingTable

- Table of top merchants by total amount
- Columns: Rank, Merchant Key, Total Amount, Attempts, Success Rate

## 8. Test Plan

### 8.1 Database Access Tests

- `test_db_health` — DuckDB connection and row count
- `test_schema` — All 22 columns present with correct types

### 8.2 Metric Calculation Tests

- `test_overview_metrics` — Correct values for total attempts, success rate, etc.
- `test_merchant_ranking` — Merchants sorted by total amount
- `test_time_series` — Daily aggregation works
- `test_filters` — Date and merchant filters work correctly

### 8.3 Constraint Validation Tests

- `test_no_customer_columns` — Confirms `customer_id` does not exist
- `test_no_product_columns` — Confirms `product_id` does not exist
- `test_adjusted_fee_note` — Confirms fee metadata includes the scaling warning

## 9. Excluded (Explicitly)

The following are **NOT** part of this specification:

- Customer retention analysis (no customer_id column)
- Product sales analysis (no product_id column)
- Inventory analysis (no inventory columns)
- Fast-moving/slow-moving products (no product data)
- PostgreSQL integration (Phase 0 uses DuckDB only)
- Metabase integration (optional, not required)
- AI recommendation engine (requires more data than available)
- Multi-agent autonomous orchestration (not appropriate for this scope)

## 10. Success Criteria

1. All metrics based on real, confirmed columns
2. All formulas are correct and traceable
3. Payment attempts clearly distinguished from verified transactions
4. `adjusted_fee` described correctly as confidentiality-scaled
5. Full CSV protected from Git (`.gitignore`)
6. 8+ tests passing
7. API returns calculation metadata for every metric
8. UI renders correctly in Persian RTL
9. UI is responsive on mobile
