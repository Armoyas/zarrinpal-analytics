# Stage 1 Specification — Core Merchant Overview

**Stage:** 1 — Core Merchant Overview  
**Status:** Complete  
**Last Updated:** 2026-08-22

## Objective

Create the first useful analytical dashboard for a selected ZarinPal merchant.
This stage delivers a Persian RTL web application with backend API endpoints
and a responsive Next.js frontend that displays core payment metrics with full
traceability.

## Context

Stage 0 established the project foundation: dataset inspection (10,000 rows,
22 columns, IRR), data validation scripts, Docker Compose, and minimal health
endpoint. Stage 1 builds the first analytical dashboard layer on top of this
foundation.

## Requirements

### Backend (FastAPI + DuckDB)

Implement the following REST endpoints:

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/api/v1/health` | Service health check including data availability |
| 2 | GET | `/api/v1/schema` | Dataset schema with null counts and column roles |
| 3 | GET | `/api/v1/merchants` | Merchant list with optional `category_id` filter |
| 4 | GET | `/api/v1/overview` | Overview metrics with `merchant_key`, `start_date`, `end_date` filters |
| 5 | GET | `/api/v1/trends` | Daily aggregation for trend charts with same filters |

All endpoints use DuckDB to query the CSV directly — no PostgreSQL,
SQLAlchemy, or ORM.

### Frontend (Next.js 14 + Tailwind CSS v3 + shadcn/ui-style components)

Create a Persian RTL responsive dashboard page containing:

- **Merchant selector** — dropdown to select a merchant or "all"
- **Date-range filter** — start/end date inputs
- **KPI cards** — payment attempts, unique sessions, verified count, success
  rate, total amount, average amount
- **Daily activity chart** — bar chart of daily attempt counts
- **Amount trend chart** — line chart of daily total amounts
- **Data limitation warning** — visible warning about `adjusted_fee` and sparse
  columns
- **Loading state** — skeleton or spinner
- **Empty state** — message when no data matches filters
- **Error state** — error message display
- **Calculation-details drawer** — traceability metadata dialog for each KPI

### Metrics

Only metrics supported by the inspected schema (22 columns). Do NOT implement
unsupported analytics.

| Metric | Formula | Counting Unit | Source Columns |
|--------|---------|---------------|----------------|
| Payment-attempt row count | `COUNT(*)` | row | all rows |
| Unique session count | `COUNT(DISTINCT session_key)` | session | `session_key` |
| Verified count | `COUNT WHERE session_status = 'Verified'` | verified_session | `session_status` |
| Settled count | `COUNT WHERE settled_at IS NOT NULL` | settled_session | `settled_at` |
| Failed count | `COUNT WHERE session_status = 'Failed'` | row | `session_status` |
| Success rate | `COUNT(Verified) / COUNT(*) * 100` | verified_session | `session_status` |
| Total amount | `SUM(amount)` | row | `amount` |
| Average amount | `AVG(amount)` | row | `amount` |
| Daily activity count | `COUNT(*)` grouped by `created_at::DATE` | row | `created_at`, `session_status` |
| Daily amount trend | `SUM(amount)` grouped by `created_at::DATE` | row | `created_at`, `amount` |

### Traceability

Every API metric response must include:

- `metric_id`
- `definition`
- `formula`
- `source_columns`
- `counting_unit`
- `filters`
- `limitations`

The frontend must display a "How was this calculated?" interaction (drawer)
using this metadata.

## Out of Scope (Stage 1)

- Advanced analytics (merchant performance comparisons, sales share,
  high-value payment detection, AI insights)
- Customer analytics, product analytics, or inventory
- Authentication or user management
- PostgreSQL, SQLAlchemy, or Metabase
- Real-time data processing
- Mobile app (web-only responsive)

## Deliverables

| # | File | Purpose |
|---|------|---------|
| 1 | `services/api/app/database.py` | DuckDB query layer |
| 2 | `services/api/app/models.py` | Pydantic response models with traceability |
| 3 | `services/api/app/main.py` | FastAPI app with all 5 endpoints |
| 4 | `frontend/app/page.tsx` | Dashboard page (Persian RTL) |
| 5 | `frontend/app/components/*.tsx` | Dashboard UI components |
| 6 | `frontend/app/styles/globals.css` | Tailwind CSS with dark theme |
| 7 | `frontend/lib/api.ts` | API client |
| 8 | `frontend/types.ts` | TypeScript type definitions |
| 9 | `frontend/Dockerfile` | Frontend container |
| 10 | `frontend/tailwind.config.js` | Tailwind config |
| 11 | `frontend/tsconfig.json` | TypeScript config |
| 12 | `frontend/package.json` | Dependencies and scripts |
| 13 | `services/api/tests/conftest.py` | Pytest fixtures |
| 14 | `services/api/tests/test_stage1_s0.py` | Backend tests |
| 15 | `docs/metric-definitions.md` | All metric formulas and limitations |
| 16 | `docs/api-reference.md` | API endpoint documentation |
| 17 | `docs/data-dictionary.md` | Updated column documentation |
| 18 | `specs/001-core-overview/spec.md` | This spec |
| 19 | `specs/001-core-overview/plan.md` | Implementation plan |
| 20 | `specs/001-core-overview/tasks.md` | Task checklist |

## Acceptance Criteria

- [x] Health endpoint returns `{"status": "healthy", "data_available": true}`
- [x] Schema endpoint returns all 22 columns with null counts
- [x] Merchants endpoint returns list with traceability metadata
- [x] Merchants endpoint supports `category_id` filter
- [x] Overview endpoint returns all 8 metrics with traceability
- [x] Overview endpoint supports `merchant_key`, `start_date`, `end_date` filters
- [x] Overview endpoint returns 400 on invalid date range (start > end)
- [x] Overview success_rate handles division by zero (returns 0.0)
- [x] Trends endpoint returns daily aggregation with traceability
- [x] All metrics include `metric_id`, `definition`, `formula`, `source_columns`,
      `counting_unit`, `filters`, `limitations`
- [x] Frontend dashboard renders in Persian RTL with Vazirmatn font
- [x] Merchant selector dropdown works
- [x] Date-range filter works
- [x] KPI cards display correct values
- [x] Charts render (daily activity bar, amount trend line)
- [x] Data limitation warning is visible
- [x] Loading, empty, error states implemented
- [x] Calculation-details drawer shows traceability metadata
- [x] Pytest tests pass (merchant filtering, date filtering, amount
      aggregation, row counts, session counts, status logic, empty results,
      invalid dates, division by zero, traceability)
- [x] Frontend lint passes
- [x] Frontend typecheck passes
- [x] Frontend build succeeds
- [x] Docker Compose config validates (`docker compose config`)

## Validation Results

- Backend pytest tests: 27 tests pass
- Docker Compose config: validates successfully
- Backend health endpoint: returns `{"status": "healthy", "stage": "1-core-overview", "data_available": true}`
