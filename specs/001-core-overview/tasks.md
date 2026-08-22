# Stage 1 Task Checklist — Core Merchant Overview

**Stage:** 1  
**Status:** Complete  
**Last Updated:** 2026-08-22

## Tasks

### Backend

- [x] Create `services/api/app/database.py` — DuckDB connection and query layer
- [x] Create `services/api/app/models.py` — Pydantic models with traceability
- [x] Create `services/api/app/__init__.py` — package init
- [x] Update `services/api/app/main.py` — FastAPI app with 5 endpoints
  - [x] GET `/api/v1/health`
  - [x] GET `/api/v1/schema`
  - [x] GET `/api/v1/merchants`
  - [x] GET `/api/v1/overview`
  - [x] GET `/api/v1/trends`
- [x] Update `services/api/requirements.txt` — add fastapi, uvicorn, duckdb, pydantic
- [x] Update `services/api/Dockerfile` — backend container

### Frontend

- [x] Upgrade frontend to Next.js 14 with App Router
- [x] Set up Tailwind CSS v3 with dark theme
- [x] Configure Vazirmatn font (Persian + Latin subsets)
- [x] Set `dir="rtl"` and `lang="fa"` on HTML element
- [x] Create `frontend/app/page.tsx` — main dashboard page
- [x] Create `frontend/app/layout.tsx` — RTL layout with Vazirmatn
- [x] Create `frontend/app/styles/globals.css` — Tailwind base styles
- [x] Create `frontend/lib/api.ts` — API client with TypeScript types
- [x] Create `frontend/lib/types.ts` — shared types (or `app/types.ts`)
- [x] Create component: `KpiCard` — clickable KPI display
- [x] Create component: `MerchantSelector` — merchant dropdown
- [x] Create component: `DateRangeFilter` — date range inputs
- [x] Create component: `DailyTrendChart` — bar chart (recharts)
- [x] Create component: `AmountTrendChart` — line chart (recharts)
- [x] Create component: `DataLimitationWarning` — warning banner
- [x] Create component: `CalculationDetails` — traceability drawer
- [x] Create `frontend/tsconfig.json` — TypeScript config (ES2020 for MapIterator)
- [x] Create `frontend/tailwind.config.js` — Tailwind config
- [x] Create `frontend/package.json` — dependencies and scripts
- [x] Create `frontend/Dockerfile` — multi-stage build
- [x] Create `frontend/.eslintrc.json` — ESLint config
- [x] Create `frontend/eslint.config.mjs` — ESLint flat config

### Tests

- [x] Create `services/api/tests/conftest.py` — pytest fixtures
- [x] Create `services/api/tests/test_stage1_s0.py` — 27 backend tests
  - [x] Health endpoint test
  - [x] Schema endpoint test (22 columns, row count)
  - [x] Merchants endpoint test (list, traceability, category filter, empty)
  - [x] Overview endpoint tests:
    - [x] Merchant filtering
    - [x] Date filtering
    - [x] Amount aggregation (total, average)
    - [x] Row count
    - [x] Unique session count
    - [x] Status logic (verified, settled, failed)
    - [x] Success rate
    - [x] Traceability metadata
    - [x] Empty results (non-existent merchant)
    - [x] Division by zero (success_rate = 0.0)
    - [x] Invalid date range (400 response)
  - [x] Trends endpoint tests:
    - [x] Daily data returned
    - [x] Daily fields validated
    - [x] Amount aggregation
    - [x] Invalid date range (400)
    - [x] Traceability

### Validation

- [x] Run pytest — all tests pass
- [x] Run frontend lint — passes
- [x] Run frontend typecheck — passes
- [x] Run frontend build — succeeds
- [x] Run `docker compose config` — validates

### Documentation

- [x] Update `specs/constitution.md` — mark Stage 1 in scope
- [x] Create `specs/001-core-overview/spec.md`
- [x] Create `specs/001-core-overview/plan.md`
- [x] Create `specs/001-core-overview/tasks.md`
- [x] Create `docs/metric-definitions.md` — all metric formulas
- [x] Create `docs/api-reference.md` — API endpoint documentation
- [x] Update `docs/data-dictionary.md` — ensure Stage 1 columns documented
- [x] Update `docs/PROJECT_HANDOFF.md` — Stage 1 handoff
- [x] Update `AGENTS.md` — Stage 1 development guidelines
- [x] Update `README.md` — Stage 1 features
- [x] Update `PROJECT_STRUCTURE.md` — Stage 1 file tree

### Commit

- [x] Commit: "feat: add core merchant overview analytics"
