# Stage 1 Task Checklist — Core Merchant Overview

## Planning & Specification
- [x] Update `specs/constitution.md` — add Stage 1 scope
- [x] Create `specs/001-core-overview/spec.md`
- [x] Create `specs/001-core-overview/plan.md`
- [x] Create `specs/001-core-overview/tasks.md`

## Backend
- [x] Create `services/api/app/models.py` — Pydantic models with traceability
- [x] Create `services/api/app/database.py` — DuckDB connection + query helpers
- [x] Rewrite `services/api/app/main.py` — all 5 endpoints
- [x] Update `services/api/requirements.txt`
- [x] Update `services/api/Dockerfile`

## Frontend
- [x] Set up Next.js 14 project structure (package.json, tsconfig, next.config)
- [x] Install and configure Tailwind CSS v3
- [x] Install shadcn/ui components (Card, Select, Button, Dialog, etc.)
- [x] Configure Vazirmatn font and RTL support
- [x] Create `frontend/src/App.tsx` — main dashboard page
- [x] Create `frontend/src/components/MerchantSelector.tsx`
- [x] Create `frontend/src/components/DateRangeFilter.tsx`
- [x] Create `frontend/src/components/KpiCard.tsx`
- [x] Create `frontend/src/components/DailyTrendChart.tsx`
- [x] Create `frontend/src/components/AmountTrendChart.tsx`
- [x] Create `frontend/src/components/CalculationDetails.tsx`
- [x] Add data limitation warning
- [x] Add loading, empty, error states

## Tests
- [x] Create `tests/backend/test_api.py`
- [x] Backend tests: merchant filtering
- [x] Backend tests: date filtering
- [x] Backend tests: amount aggregation
- [x] Backend tests: row counts
- [x] Backend tests: unique session counts
- [x] Backend tests: status logic
- [x] Backend tests: empty results
- [x] Backend tests: invalid date range
- [x] Backend tests: division by zero
- [x] Backend tests: traceability metadata

## Validation
- [x] Run `pytest tests/ -v` — all tests pass
- [x] Run `cd frontend && npm run lint` — passes
- [x] Run `cd frontend && npm run typecheck` — passes
- [x] Run `cd frontend && npm run build` — passes
- [x] Run `docker compose config` — valid

## Documentation
- [x] Create `docs/metric-definitions.md`
- [x] Create `docs/api-reference.md`
- [x] Update `docs/PROJECT_HANDOFF.md`
- [x] Update `docs/data-dictionary.md`
- [x] Update `AGENTS.md`
- [x] Update `README.md`
- [x] Update `PROJECT_STRUCTURE.md`

## Git
- [x] Stage all files
- [x] Commit: `feat: add core merchant overview analytics`
- [x] Push to origin