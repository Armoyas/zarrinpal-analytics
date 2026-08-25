# Stage 2: Sales Share and Time-Based Analytics — Specification

## Status
- **Stage 0**: Complete
- **Stage 1**: Complete
- **Stage 2**: ✅ Complete

## Goal
Extend the dashboard with merchant sales-share analysis and daily, monthly, and yearly activity analysis. Expose a "successful amount" definition alongside the existing Stage 1 "total attempted amount".

## Sales Definition Decision

### Candidates Evaluated

| Definition | Source Column | Coverage | Decision |
|-----------|---------------|----------|----------|
| Amount from all rows | `amount` | 100% of rows | **Stage 1 definition** — unchanged as `total_amount` |
| Amount from verified records | `session_status = 'Verified'` | 44.84% | Too narrow — misses Paid + Reversed |
| **Amount from completed payments** | `session_status IN ('Verified', 'Paid', 'Reversed')` | 69.98% | **Stage 2 definition** — used as `successful_amount` for sales share |
| Amount from settled records | `settled_at IS NOT NULL` | 1.05% | Too sparse — NULL for 98.95% of rows |

### Selected Definition

**Stage 2 Sales = `SUM(amount) WHERE session_status IN ('Verified', 'Paid', 'Reversed')`**

This represents payments that reached a terminal state (captured, verified, or reversed). It excludes only `Failed` and `NoAttempt` rows. The rationale is documented in `get_calculation_details()`:

- `session_status` has 0.00% nulls — fully populated
- `settled_at` is NULL for 98.95% of rows — too sparse
- `verified_at` is NULL for 94.43% of rows — too sparse
- `session_status = 'Verified'` captures 44.84% — meaningful coverage
- Including `'Paid'` and `'Reversed'` captures 69.98% — complete terminal-state coverage

### Dual Amount Definitions

| Label | Formula | Counting Unit | Stage |
|-------|---------|---------------|-------|
| `total_amount` (Stage 1) | `SUM(amount)` over all rows | rows | Stage 1 |
| `successful_amount` (Stage 2) | `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')` | rows | Stage 2 |

Both are exposed via the API. No Stage 1 definition is silently changed.

### Mathematical Formulas

**Merchant sales share (by amount):**
```
shares = merchant_amount / comparison_population_total_amount * 100
```

**Merchant sales share (by successful amount):**
```
shares = merchant_successful_amount / comparison_population_total_successful_amount * 100
```

**Previous-period comparison:**
```
count_change_pct = (current_count - previous_count) / previous_count * 100
amount_change_pct = (current_amount - previous_amount) / previous_amount * 100
```
Uses `LAG()` window function for previous-period values. Division by zero → 0.0.

## Scope

### In Scope
- `GET /api/v1/sales/share` — Merchant and category sales share with traceability
- `GET /api/v1/activity/daily` — Daily trends with previous-day comparison
- `GET /api/v1/activity/monthly` — Monthly trends with previous-month comparison
- `GET /api/v1/activity/yearly` — Yearly trends with previous-year comparison
- `GET /api/v1/merchants/ranking` — Top merchants by amount or count
- `GET /api/v1/activity/highest-day` — Day with highest attempt count
- `GET /api/v1/activity/highest-month` — Month with highest attempt count
- `GET /api/v1/calculation-details` — Full traceability metadata
- Frontend dashboard with tabbed navigation (Sales Share, Activity, Ranking, Calculations)
- Data limitation warnings for all Stage 2 metrics
- Persian RTL responsive layout
- Tests for all Stage 2 endpoints and edge cases

### Out of Scope
- Adjusted-fee analysis (Stage 3)
- High-value payment analysis (Stage 4)
- AI recommendations (Stage 5)

## Backend Methods

All methods are in `services/api/app/db/duckdb_database.py` as `DuckDBManager` instance methods:

| Method | Description |
|--------|-------------|
| `get_sales_share(start_date, end_date, merchant_key, category_id)` | Merchant and category sales share, using `successful_amount` definition |
| `_activity_trend(interval, ...)` | Internal helper — groups by period, adds LAG comparison |
| `get_activity_daily(merchant_key, category_id, start_date, end_date)` | Daily activity with previous-day comparison |
| `get_activity_monthly(...)` | Monthly activity with previous-month comparison |
| `get_activity_yearly(...)` | Yearly activity with previous-year comparison |
| `get_merchant_ranking(sort_by, limit, start_date, end_date)` | Top merchants by amount or count |
| `get_highest_activity_day(merchant_key, start_date, end_date)` | Day with highest attempt count |
| `get_highest_activity_month(merchant_key, start_date, end_date)` | Month with highest attempt count |
| `get_calculation_details()` | Full metric definitions with traceability |

## Frontend

The frontend dashboard (`frontend/app/dashboard/`) contains tabs:
- **Overview** — KPI cards (Stage 1 metrics)
- **Sales Share** — Merchant and category sales share tables with share percentages
- **Activity** — Daily/monthly/yearly activity charts
- **Ranking** — Top merchants ranking table
- **Calculations** — Metric definitions and traceability metadata

All pages use Persian RTL, Vazirmatn font, and shadcn/ui components.

## Acceptance Criteria

### AC1: Backend API
- ✅ All endpoints return JSON with `how_calculated` traceability metadata
- ✅ Empty results return valid structures with zero values
- ✅ Division by zero returns 0.0 with trace
- ✅ `successful_amount` and `total_amount` are both exposed with clear labels

### AC2: Frontend
- ✅ Persian RTL layout on all Stage 2 pages
- ✅ Vazirmatn font for Persian text
- ✅ Responsive design for mobile and desktop
- ✅ Data limitation warnings visible
- ✅ Calculation details accessible via dialog

### AC3: Tests
- ✅ 22 Stage 2 tests, all passing
- ✅ 43 total tests (21 Stage 1 + 22 Stage 2), all passing

### AC4: Documentation
- ✅ Metric definitions documented with formulas and limitations
- ✅ API reference complete for all Stage 2 endpoints
- ✅ Stage 2 spec, plan, and tasks updated
