# Stage 2 Task Checklist

## Backend
- [x] Add `get_sales_share()` to DuckDBManager
- [x] Add `get_merchant_ranking()` to DuckDBManager
- [x] Add `get_highest_activity_day()` to DuckDBManager
- [x] Add `get_highest_activity_month()` to DuckDBManager
- [x] Add `_activity_trend()` helper for daily/monthly/yearly
- [x] Add `get_previous_period_comparison()` to DuckDBManager
- [x] Add Stage 2 API endpoints to main.py
- [x] Update models.py with Stage 2 response types

## Frontend
- [x] Create `frontend/app/dashboard/sales-share/page.tsx`
- [x] Create `frontend/app/dashboard/activity/page.tsx`
- [x] Update `lib/api.ts` with Stage 2 methods
- [x] Update `types/index.ts` with Stage 2 types

## Tests
- [x] Add Stage 2 backend tests (sales share, activity, ranking)
- [x] Add Stage 2 frontend tests
- [x] Fix health endpoint stage version

## Documentation
- [x] Create `docs/metric-definitions.md` with Stage 2 metrics
- [x] Create `docs/api-reference.md` with Stage 2 endpoints
- [x] Update `docs/PROJECT_HANDOFF.md` with Stage 2 summary
- [x] Update `specs/constitution.md` Stage 2 status
- [x] Update `AGENTS.md`
- [x] Update `README.md`
- [x] Update `PROJECT_STRUCTURE.md`

## Validation
- [x] Run pytest
- [x] Run frontend lint
- [x] Run frontend typecheck
- [x] Run frontend build
- [x] Run docker compose config
