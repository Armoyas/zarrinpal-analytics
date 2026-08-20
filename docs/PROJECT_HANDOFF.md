# ZarrinPal Analytics Dashboard — Project Handoff

## Goal

Build a Persian RTL, mobile-first analytics dashboard for ZarrinPal merchants.

The dashboard must provide:
- Merchant overview
- Payment volume and amount
- Success and failure analysis
- Time trends
- Merchant ranking
- Peer-group comparison where supported
- Explainable and traceable insights
- Responsive desktop and mobile UX

## Technology

- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: FastAPI + DuckDB
- Analytics: DuckDB (direct CSV querying)
- Charts: Recharts
- Deployment: Docker Compose

## Repositories

- Product repository: `Armoyas/zarrinpal-analytics` (this repo)
- Reference only: `Kiranism/next-shadcn-dashboard-starter`

## Data constraints

- Full CSV is approximately 500 MB.
- Full CSV must never be committed to Git.
- Currency is Rial.
- Rows represent payment attempts, not necessarily unique successful transactions.
- Some columns contain missing values (87-99% null for bank/card fields).
- `adjusted_fee` is a confidentiality-scaled value, not the real ZarinPal fee.
- Relative comparisons are valid, but the adjusted_fee limitation must be clearly shown.

## Critical rule

Never invent columns or business meaning. Inspect the real CSV schema first.

Customer, product, inventory, retention, fast-moving, and slow-moving analysis are allowed only if reliable columns exist.

## Development method

Work in small loops.

For every loop:
1. Inspect the current repository.
2. Read this file and the relevant specification.
3. Make a small change.
4. Run tests.
5. Inspect the Git diff.
6. Update documentation.
7. Commit the change.

Do not make unrelated changes.

## Current phase

Phase 0 — Dataset schema inspection and project foundation.

## Completed work

- Project concept defined.
- Reference repository identified.
- Technology direction selected.
- Full dataset excluded from Git.
- Sample data generated (10,000 rows).
- Schema inspection script created.
- Data dictionary generated.
- DuckDB-based backend created with correct schema.
- API endpoints for health, schema, overview, merchants, and time-series.
- Test suite created and passing.

## Not yet confirmed

- Actual CSV column names: CONFIRMED via schema inspection
- Date column: `created_at` (ISO 8601 datetime)
- Merchant identifier: `merchant_key`
- Payment status values: `Verified`, `Paid`, `InBank`, `Failed`, `Reversed`, `NoAttempt`
- Amount column: `amount` (Rials)
- Customer identifier: NOT available
- Product identifier: NOT available
- Missing-value percentages: 87-99% for bank/card fields

## Definition of success for Phase 0

The project must contain:
- [x] A safe `.gitignore` (protects full CSV, DuckDB files)
- [x] Dataset instructions (seed_demo.py)
- [x] A reproducible schema inspection script (scripts/inspect_schema.py)
- [x] A data dictionary (docs/data-dictionary.md)
- [x] A sample dataset workflow (data/sample_data.csv)
- [x] A basic project README
- [x] No full CSV committed to Git
- [x] DuckDB backend using real CSV columns
- [x] API endpoints for overview, merchants, time-series
- [x] Traceshow calculations ("How calculated?" metadata)
- [x] Tests for metric calculations
