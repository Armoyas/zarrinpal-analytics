# Project Constitution — Analytical Dashboard for ZarinPal Merchants

## Project Goal

Build a modern Persian RTL analytical dashboard for ZarinPal merchants that
analyzes payment activity, sales, merchant performance, success/failure rates,
and provides traceable, actionable insights.

## Core Principles

1. **Never invent dataset columns.** Every column used in analytics must be
   present in the actual CSV schema. No synthetic or derived columns beyond
   those explicitly documented.

2. **Document every metric formula.** Every metric, KPI, or computed value must
   have a documented formula in `docs/metric-definitions.md` with a reference to
   the source columns.

3. **Distinguish row, attempt, session, verified payment, and settled payment.**
   These are NOT interchangeable:

   - **Row:** A single record in the CSV.
   - **Attempt (try):** One payment attempt identified by a `session_key` +
     `try_seq` combination.
   - **Session:** A unique `session_key`, which may contain multiple attempts.
   - **Verified payment:** A session/try where
     `session_status = 'Verified'`.
   - **Settled payment:** A session/try where `settled_at` is non-null.

4. **Never present `adjusted_fee` as the real ZarinPal fee.** The
   `adjusted_fee` column is a confidentiality-adjusted indicator. Relative
   comparisons within the dataset are valid; absolute fee values are not.
   This limitation must be communicated in all visualizations and reports.

5. **Exclude unsupported analytics.** Do not build dashboards or metrics for:

   - Customer segmentation, product analytics, inventory, or retention
     (not supported by dataset columns).
   - Repeat-behavior analysis using `payer_card_key` (data too sparse).
   - Fee-based revenue projections using `adjusted_fee`.
   - Real-time fraud detection beyond stated data.

6. **Never commit the full dataset.** The complete CSV must never be committed
   to Git. Only sample subsets (max 100 rows) may be committed for
   documentation. Use `.gitignore` to exclude full data files.

7. **Use deterministic backend calculations as the source of truth.** All
   metrics must be computed in the backend (DuckDB queries) — never in the
   frontend. Frontend consumes only API responses.

8. **Support Persian RTL and mobile layouts.** All frontend pages must default
   to `dir="rtl"` with Vazirmatn font. Mobile responsiveness is mandatory
   (Tailwind responsive classes).

9. **Update specifications and documentation after every stage.** Each completed
   stage must update `specs/`, `docs/`, and `PROJECT_STRUCTURE.md`.

## Data Rules

- All amounts are in Iranian rial (IRR).
- A `session_key` may appear in multiple rows (multiple attempts).
- `try_seq` represents attempt sequence numbers within a session.
- `adjusted_fee` is confidentially-scaled, not the actual ZarinPal fee.
- `payer_card_key` is sparse and cannot reliably support repeat-behavior
  analysis.
- Dates: `created_at`, `try_created_at`, `verified_at`, `settled_at`,
  `expire_in` — only `created_at` is always present.

## Scope

**Stage 0 (Foundation):** Project scaffolding, dataset inspection, data
validation scripts, Docker Compose foundation, minimal health endpoint,
minimal frontend startup page. No dashboard analytics yet.

**Stage 1 (Core Merchant Overview):** Backend FastAPI endpoints (health,
schema, merchants, overview, trends) with DuckDB analytics queries. Next.js 14
frontend with Tailwind CSS v3, lucide-react, recharts components, and Vazirmatn
font. Persian RTL dashboard with merchant selector, date-range filter, KPI
cards, daily activity chart, amount trend chart, and calculation-details
traceability dialog. Backend tests with pytest, frontend lint, typecheck, and
build.

**Stage 1 Out of Scope:** Advanced analytics, merchant performance
comparisons, sales share, high-value payment detection, AI-powered insights,
Nowruz analysis, real-time fraud detection.

**Future stages:** Advanced analytics, merchant performance, sales share,
high-value payments, AI-powered insights.

## SDLC / SDD Workflow

1. Read `specs/constitution.md` before any work.
2. Read the Stage 0 spec in `specs/000-foundation/` for context.
3. Read the relevant stage spec in `specs/` (e.g.
   `specs/001-core-overview/spec.md`).
4. Follow tasks in `specs/<stage>/tasks.md`.
5. Update specs and docs after each stage.
