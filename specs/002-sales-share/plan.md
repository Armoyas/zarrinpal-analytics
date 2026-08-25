# Stage 2: Sales Share and Time-Based Analytics — Plan

## Overview

Stage 2 extends the ZarrinPal analytics dashboard with sales-share analysis and time-based activity analytics. The key decision is the sales definition: Stage 2 uses `successful_amount` (sum of amount where `session_status IN ('Verified','Paid','Reversed')`), while Stage 1's `total_amount` (all rows) is preserved unchanged.

## Task List

- [x] T1: Define sales definition and document in spec
- [x] T2: Add `get_sales_share()` method to `DuckDBManager`
- [x] T3: Add `_activity_trend()`, `get_activity_daily()`, `get_activity_monthly()`, `get_activity_yearly()` methods
- [x] T4: Add `get_merchant_ranking()`, `get_highest_activity_day()`, `get_highest_activity_month()` methods
- [x] T5: Update `get_calculation_details()` with Stage 2 metrics
- [x] T6: Create `app/api/v1/endpoints/sales.py` with all Stage 2 endpoints
- [x] T7: Update `app/api/v1/endpoints/__init__.py` to include sales_router
- [x] T8: Create Stage 2 frontend dashboard page
- [x] T9: Add frontend API client methods for Stage 2
- [x] T10: Add Stage 2 tests (22 tests)
- [x] T11: Update documentation (spec, metric definitions, API reference)
- [x] T12: Run validation (pytest, frontend lint, typecheck, build, docker compose config)

## Implementation Order

1. **Backend first** — DuckDBManager methods → API endpoints → tests
2. **Frontend second** — Dashboard pages → API client → components
3. **Documentation** — Spec updated during implementation, final docs updated at end

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `settled_at` 98.95% NULL — can't use for settled analytics | Use `session_status` instead — 0% null |
| `payer_card_key` 94% null — can't do repeat behavior | Excluded from Stage 2 scope |
| `adjusted_fee` not real fee | Only Stage 3 will analyze it; clearly labeled as confidentiality-adjusted |
| Division by zero on empty sets | Handled with `COALESCE` in SQL + Python guards |
| Performance on 2.2M rows | DuckDB is fast; no browser-side aggregation |

## Performance Targets

- All queries must complete in < 2 seconds on 10,000-row sample
- Frontend page load < 3 seconds with caching
- No raw data loaded into browser — all aggregation server-side
