# PROJECT_HANDOFF.md

## Stage 1 — Core Merchant Overview Handoff

### What Was Done

1. **Backend (FastAPI + DuckDB):** Implemented all 5 REST endpoints:
   - `GET /api/v1/health` — service health check with data availability
   - `GET /api/v1/schema` — dataset schema with 22 columns, null counts, roles
   - `GET /api/v1/merchants` — merchant list with optional category filter
   - `GET /api/v1/overview` — 8 core metrics (payment_attempts, unique_sessions,
     verified_count, settled_count, failed_count, success_rate, total_amount,
     avg_amount) with full traceability
   - `GET /api/v1/trends` — daily aggregation for trend charts

2. **Frontend (Next.js 14 + Tailwind CSS v3):** Persian RTL dashboard with:
   - Merchant selector dropdown
   - Date-range filter
   - KPI cards (6 visible: attempts, sessions, verified, success rate, total,
     average)
   - Daily activity bar chart (recharts)
   - Amount trend line chart (recharts)
   - Data limitation warning banner
   - Loading, empty, and error states
   - Calculation-details drawer for traceability metadata
   - Vazirmatn font with Persian (arabic) + Latin subsets

3. **Testing:** 27 backend pytest tests covering merchant filtering, date
   filtering, amount aggregation, row/session counts, status logic, empty
   results, invalid date ranges, division by zero, and traceability metadata.

4. **Documentation:** Created `docs/metric-definitions.md` and
   `docs/api-reference.md`. Updated all Stage 0 docs and specs.

### Data Findings Summary

- **10,000 rows**, 22 columns, all amounts in IRR
- **50 merchants**, 3 terminals (every merchant uses all 3 terminals)
- **0 duplicate session_keys** in sample (each row = unique session)
- **0% nulls** on core columns; **94% nulls** on diagnostic columns
- `session_status`: Verified (4,484), InBank (1,958), Failed (1,497)
- `settled_at`: only 105 rows non-null (1.05%) — settlement data very sparse
- `payer_card_key`: 94% null, max 1 transaction per card — NOT reliable

### Implemented Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/schema` | Dataset schema |
| GET | `/api/v1/merchants` | Merchant list |
| GET | `/api/v1/overview` | 8 metrics + traceability |
| GET | `/api/v1/trends` | Daily aggregation |

### Implemented Metrics (8 total)

| metric_id | Label | Counting Unit |
|-----------|-------|---------------|
| payment_attempts | تعداد تلاش‌های پرداخت | row |
| unique_sessions | سشن‌های منحصر به فرد | session |
| verified_count | پرداخت‌های تأیید شده | verified_session |
| settled_count | پرداخت‌های تسویه شده | settled_session |
| failed_count | شکست‌های پرداخت | row |
| success_rate | نرخ موفقیت | verified_session |
| total_amount | مجموع مبلغ | row |
| avg_amount | متوسط مبلغ | row |

### Test Results

- Backend pytest: 27 tests pass
- Docker Compose config: validates successfully

### Known Limitations

1. `adjusted_fee` is NOT used as a metric — it is a confidentiality-adjusted
   indicator, not the real ZarinPal fee.
2. `settled_at` is ~99% null — settled count analysis is limited.
3. `payer_card_key` cannot support repeat-behavior analysis (94% null, max 1
   transaction per card).
4. Daily trends are based on `created_at` only (the only always-present timestamp).
5. Success rate counts session-level verified status relative to attempt rows —
   not attempt-level success.
6. No authentication (by design — out of scope for Stage 1).

### What Is NOT Done (Not In Stage 1)

- Merchant performance comparisons
- Sales share analysis
- High-value payment detection
- AI-powered insights
- Authentication or user management

### Validation Results

- Backend pytest: 27 tests pass
- Frontend lint: configured (next/core-web-vitals)
- Frontend typecheck: configured (tsc --noEmit)
- Frontend build: configured (next build)
- Docker Compose config: validates successfully
- Backend health: returns `{"status": "healthy", "stage": "1-core-overview", "data_available": true}`
