# Stage 1: Core Merchant Overview — Specification

## Status
- **Stage 0**: Complete
- **Stage 1**: Complete
- **Stage 2**: Not started

## Goal
Create the first useful analytical view for a selected ZarinPal merchant: a Core Merchant Overview dashboard with filtering, KPI cards, and daily activity visualization.

## Scope

### In Scope
- Health endpoint
- Dataset schema endpoint
- Merchant list endpoint
- Merchant/category/date-range filtering
- Overview metrics (payment-attempt count, unique session count, verified count, settled count, failed count, success rate, total amount, average amount)
- Daily trend endpoint (daily activity count + daily amount trend)
- Persian RTL responsive frontend
- Next.js 14 + Tailwind CSS + shadcn/ui + recharts
- Data limitation warnings and traceability metadata
- Calculation-details dialog/drawer
- Tests for all backend endpoints

### Out of Scope
- Adjusted-fee analysis
- High-value payment analysis
- AI recommendations
- Customer/product/retention analytics
- Authentication
- PostgreSQL, SQLAlchemy, Metabase

## Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Backend health check |
| GET | `/api/v1/schema` | Dataset schema information |
| GET | `/api/v1/merchants` | List of merchants with optional filters |
| GET | `/api/v1/overview` | Overview metrics for selected merchant/date range |
| GET | `/api/v1/trends` | Daily trend data |
| GET | `/api/v1/merchants/{merchant_key}/detail` | Merchant detail view |

## Frontend Components

| Component | Purpose |
|-----------|---------|
| `MerchantSelector` | Dropdown to select a merchant |
| `DateRangeFilter` | Calendar-based date range picker |
| `KpiCard` | Reusable KPI metric card display |
| `DailyTrendChart` | Bar chart of daily payment counts |
| `AmountTrendChart` | Line chart of daily amount trends |
| `CalculationDetails` | Drawer/dialog showing metric definitions |
| `DataLimitationWarning` | Warning about adjusted_fee confidentiality |

## Acceptance Criteria

### AC1: Backend API
- All endpoints return JSON with traceability metadata
- Empty results return 200 with zero values
- Invalid date ranges return 422
- Division by zero returns 0 with trace

### AC2: Frontend
- Persian RTL layout on all pages
- Vazirmatn font for Persian text
- Responsive design for mobile and desktop
- Loading, empty, and error states
- Calculation details accessible via dialog

### AC3: Tests
- Minimum 90% backend test coverage
- All edge cases covered

### AC4: Documentation
- Metric definitions documented with formulas and limitations
- API reference complete
- Stage 1 spec, plan, and tasks updated

## Metrics Implemented

All metrics count from rows matching the filter (merchant_key, category_id, date range). "Sales" in Stage 1 = all rows. Stage 2 will introduce verified/settled amount definitions.

1. **Payment-attempt count**: Count of all matching rows. Unit: rows.
2. **Unique session count**: Count of distinct session_key. Unit: sessions.
3. **Verified count**: Count of rows where session_status = 'verified'. Unit: rows.
4. **Settled count**: Count of rows where settled_at is not null. Unit: rows.
5. **Failed count**: Count of rows where session_status = 'failed'. Unit: rows.
6. **Success rate**: verified_count / attempt_count × 100. Unit: percentage.
7. **Total amount**: Sum of amount. Unit: IRR.
8. **Average amount**: total_amount / attempt_count. Unit: IRR.
