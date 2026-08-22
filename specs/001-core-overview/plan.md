# Stage 1 Implementation Plan — Core Merchant Overview

**Stage:** 1  
**Status:** Complete  
**Last Updated:** 2026-08-22

## Implementation Approach

### Backend (FastAPI + DuckDB)

1. **database.py** — DuckDB connection management and deterministic query
   functions:
   - `get_schema()` — column names, types, null counts, roles
   - `get_row_count()` — total row count
   - `get_merchants(category_id)` — merchant list with aggregate stats
   - `get_overview_metrics(merchant, start, end)` — all 8 metrics with
     traceability
   - `get_daily_trends(merchant, start, end)` — daily aggregation

2. **models.py** — Pydantic models with `MetricTrace` and `Traceability`
   providing traceability metadata on every response.

3. **main.py** — FastAPI app with 5 endpoints: health, schema, merchants,
   overview, trends. Date-range validation with 400 on invalid range.
   Division-by-zero protection for success_rate.

### Frontend (Next.js 14 + Tailwind CSS v3)

1. Upgrade from minimal HTML page to Next.js 14 App Router
2. Tailwind CSS v3 with dark theme (slate-900 base)
3. Vazirmatn font via `next/font/google` with `latin` + `arabic` subsets
4. `dir="rtl"` and `lang="fa"` on `<html>` element
5. Responsive grid layout (mobile-first with `md:` and `lg:` breakpoints)
6. Components:
   - `KpiCard` — clickable KPI card with metric ID
   - `MerchantSelector` — dropdown with search
   - `DateRangeFilter` — start/end date inputs
   - `DailyTrendChart` — recharts BarChart
   - `AmountTrendChart` — recharts LineChart
   - `DataLimitationWarning` — amber warning banner
   - `CalculationDetails` — traceability drawer/modal
7. API client in `lib/api.ts` with proper TypeScript types
8. Loading, empty, and error states

### Testing

1. Backend pytest tests covering:
   - Health endpoint
   - Schema endpoint (22 columns)
   - Merchants filtering (by merchant, by category, empty results)
   - Overview metrics (amount aggregation, row counts, session counts,
     status logic, division by zero, traceability, date filtering, invalid
     date range)
   - Trends endpoint (daily data, fields, traceability)

2. Frontend validation:
   - ESLint (next/core-web-vitals)
   - TypeScript typecheck (`tsc --noEmit`)
   - Production build (`next build`)

3. Docker Compose config validation

## Key Design Decisions

- DuckDB `read_csv_auto` used for CSV loading (handles Persian text and types
  automatically)
- `:memory:` DuckDB for testing (no external state)
- All metrics computed in backend DuckDB queries — frontend never computes
- Traceability metadata included in every metric response
- 400-character date-range validation to prevent invalid queries
- `success_rate = 0.0` when `row_count = 0` (division-by-zero protection)

## Architecture

```
data/sample_data.csv
  ↓ (read_csv)
DuckDB in-memory / file-based
  ↓ (queries)
FastAPI (backend API)
  ↓ (JSON)
Next.js 14 (Persian RTL frontend)
```
