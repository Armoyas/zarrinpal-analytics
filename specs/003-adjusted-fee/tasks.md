# Stage 3 Task Checklist

## Backend
- [x] Add `get_adjusted_fee_metrics()` to DuckDBManager
- [x] Add `get_adjusted_fee_trend()` to DuckDBManager
- [x] Add `get_adjusted_fee_by_merchant()` to DuckDBManager
- [x] Add `get_adjusted_fee_by_category()` to DuckDBManager
- [x] Add Stage 3 API endpoints to main.py
- [x] Update models.py with Stage 3 response types

## Frontend
- [x] Create `frontend/app/dashboard/adjusted-fee/page.tsx`
- [x] Update `lib/api.ts` with Stage 3 methods

## Tests
- [x] Add Stage 3 tests
- [x] Verify adjusted_fee warning is in API response
- [x] Verify trace metadata for fee metrics

## Documentation
- [x] Update metric definitions with Stage 3 metrics
- [x] Update API reference with Stage 3 endpoints
- [x] Update PROJECT_HANDOFF with Stage 3 summary
- [x] Update constitution

## Validation
- [x] pytest
- [x] frontend lint
- [x] frontend typecheck
- [x] frontend build
- [x] docker compose config
