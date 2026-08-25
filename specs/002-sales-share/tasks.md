# Stage 2: Sales Share and Time-Based Analytics — Tasks

## Backend Tasks

### T2: `get_sales_share()` method
- [x] Accept `merchant_key`, `category_id`, `start_date`, `end_date` filters
- [x] Compute `successful_amount` = `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')`
- [x] Compute `total_amount` = `SUM(amount)` over all rows (Stage 1 definition)
- [x] Calculate merchant sales share percentages (by both amount and successful_amount)
- [x] Calculate category sales share
- [x] Return `summary`, `how_calculated`, `filters` for traceability
- [x] Test: sales share returns expected keys
- [x] Test: filtered by merchant returns only that merchant
- [x] Test: traceability has formula definitions

### T3: Activity trend methods
- [x] Implement `_activity_trend(interval)` internal helper with LAG window function
- [x] `get_activity_daily()` — group by day, add previous-period comparison
- [x] `get_activity_monthly()` — group by `YYYY-MM`, add previous-period comparison
- [x] `get_activity_yearly()` — group by year, add previous-period comparison
- [x] Each returns `daily_activity`/`monthly_activity`/`yearly_activity` array + period_summary
- [x] Test: daily activity has expected columns
- [x] Test: monthly activity has month key
- [x] Test: yearly activity has year key

### T4: Merchant ranking methods
- [x] `get_merchant_ranking(sort_by, limit)` — sort by `amount` or `count`
- [x] `get_highest_activity_day(merchant_key, ...)` — day with highest count
- [x] `get_highest_activity_month(merchant_key, ...)` — month with highest count
- [x] `get_highest_activity_year(merchant_key, ...)` — year with highest count
- [x] Ranking sorted descending, includes share percentages and ranks
- [x] Test: ranking by amount is sorted descending
- [x] Test: ranking by count is sorted descending
- [x] Test: traceability metadata present

### T5: Update `get_calculation_details()`
- [x] Add Stage 2 metric definitions (successful_amount, sales_share_pct)
- [x] Add Stage 1 vs Stage 2 sales definition comparison
- [x] Add rationale for Stage 2 sales definition
- [x] Test: calculation details includes Stage 2 metrics

## API Endpoint Tasks

### T6: Create `sales.py` endpoint file
- [x] `GET /api/v1/sales/share` — merchant/category sales share
- [x] `GET /api/v1/activity/daily` — daily trends with comparison
- [x] `GET /api/v1/activity/monthly` — monthly trends with comparison
- [x] `GET /api/v1/activity/yearly` — yearly trends with comparison
- [x] `GET /api/v1/merchants/ranking` — top merchants
- [x] `GET /api/v1/activity/highest-day` — highest activity day
- [x] `GET /api/v1/activity/highest-month` — highest activity month
- [x] `GET /api/v1/calculation-details` — traceability metadata

### T7: Update `__init__.py`
- [x] Import `sales_router` from `.sales`
- [x] Include router with `tags=["sales"]`

## Frontend Tasks

### T8: Dashboard page
- [x] Tabbed navigation: Overview, Sales Share, Activity, Ranking, Calculations
- [x] Sales Share tab shows merchant and category share tables
- [x] Activity tab shows daily/monthly/yearly charts
- [x] Ranking tab shows merchant ranking table
- [x] Calculations tab shows metric definitions

### T9: API client methods
- [x] `getSalesShare()` — fetch sales share data
- [x] `getActivityDaily()` — fetch daily activity
- [x] `getActivityMonthly()` — fetch monthly activity
- [x] `getActivityYearly()` — fetch yearly activity
- [x] `getMerchantsRanking()` — fetch merchant ranking
- [x] `getCalculationDetails()` — fetch traceability metadata

## Test Tasks

### T10: Stage 2 tests
- [x] Sales share tests (4 tests)
- [x] Activity daily tests (4 tests)
- [x] Activity monthly/yearly tests (4 tests)
- [x] Merchant ranking tests (3 tests)
- [x] Highest activity tests (2 tests)
- [x] Calculation details tests (3 tests)
- [x] Edge case tests (3 tests)

## Documentation Tasks

### T11: Update documentation
- [x] `specs/002-sales-share/spec.md` — acceptance criteria, formulas, sales definition
- [x] `docs/metric-definitions.md` — Stage 2 metrics
- [x] `docs/api-reference.md` — Stage 2 endpoints
- [x] `docs/PROJECT_HANDOFF.md` — Stage 2 summary

### T12: Validation
- [x] Run pytest (43 tests: 21 Stage 1 + 22 Stage 2)
- [x] Frontend lint
- [x] Frontend typecheck
- [x] Frontend build
- [x] Docker Compose config
