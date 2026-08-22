# PROJECT HANDOFF — Stage 1: Core Merchant Overview

## Stage Summary

Stage 1 delivers the first useful analytical view for a selected ZarinPal merchant:
a Core Merchant Overview dashboard with filtering, KPI cards, daily activity
charts, and full traceability metadata.

## What Was Done

### Backend (FastAPI + DuckDB)
- Health, schema, merchants, overview, trends, and merchant-detail endpoints
- Pydantic models for all API responses
- DuckDB manager with query helpers for all metrics
- Traceability metadata attached to every metric response
- Division-by-zero protection (returns 0.0, not an error)
- Invalid date range returns 422
- Empty results return 200 with zero values

### Frontend (Next.js 14 + Tailwind CSS)
- Persian RTL layout with Vazirmatn font
- Merchant selector dropdown with search
- Date range filter with presets
- KPI cards for all 8 Stage 1 metrics
- Daily trend bar chart (recharts)
- Amount trend line chart (recharts)
- Calculation details drawer showing metric formulas
- Data limitation warning banner (adjusted_fee confidentiality)
- Loading, empty, and error states for all components

### Testing
- 21 backend tests (all passing)
- Coverage: 100% for `database.py`, 100% for `main.py`
- Edge cases: empty results, invalid dates, division by zero, null values

### Documentation
- Full data dictionary (all 22 columns documented)
- Data quality report (null percentages, date range, amount checks)
- Metric definitions for all 8 Stage 1 metrics with formulas
- API reference for all 6 endpoints
- Updated AGENTS.md, README.md, PROJECT_STRUCTURE.md

## Metrics (Stage 1)

All metrics count from filtered rows. "Sales" definition for Stage 1 = all rows.
Stage 2 will introduce verified-amount and settled-amount definitions.

| ID | Metric | Unit |
|----|--------|------|
| M1 | Payment attempt count | rows |
| M2 | Unique session count | sessions |
| M3 | Verified count | rows |
| M4 | Settled count | rows |
| M5 | Failed count | rows |
| M6 | Success rate | percentage |
| M7 | Total amount | IRR |
| M8 | Average amount | IRR |

## Data Findings (Stage 1 Validation)

- **10,000 rows**, 22 columns, IRR currency
- **0.00% nulls** on core columns (session_key, amount, adjusted_fee, session_status, created_at)
- **94.02% nulls** on switch_response_code, psp_code, issuer_bank_code, payer_card_key
- **98.95% nulls** on settled_at
- session_status: Verified (44.8%), InBank (19.6%), Failed (15.0%), Paid (10.3%), Reversed (5.1%), NoAttempt (5.2%)
- 0 duplicate session_keys in sample dataset
- 50 merchants, 3 terminals
- payer_card_key: 94% null — repeat-behavior analysis NOT reliable

## Decisions

1. **Sales definition**: All rows. Verified/settled amount definitions reserved for Stage 2.
2. **Backend as source of truth**: All calculations in DuckDB, never in browser memory.
3. **Traceability**: Every metric response includes metric_id, formula, source_columns, counting_unit.
4. **Full dataset safety**: `sample_data.csv` is gitignored; only 10-row sample committed.

## Unresolved from Stage 0

1. `expire_in` format — needs confirmation (duration vs timestamp)
2. 94% null pattern on diagnostic columns
3. `payer_card_key` 94% sparsity
4. `try_created_at` vs `created_at` semantic distinction

## Git

- Branch: `stage-1-core-merchant-overview`
- Commit: `feat: add core merchant overview analytics`

## Next: Stage 2

Stage 2 will implement:
- Merchant and category sales share
- Daily/monthly/yearly activity counts and amount trends
- Previous-period comparison
- Top merchants ranking
- Highest activity day/month
