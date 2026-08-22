# AGENTS.md

> Reference instructions for AI agents contributing to the ZarinPal Analytics Dashboard project.

## Project Overview

The ZarinPal Analytics Dashboard is a modern, Persian (RTL) web application that
provides analytical insights into ZarinPal payment transactions. It is built with
a FastAPI + DuckDB backend and a Next.js 14 + Tailwind CSS frontend.

## Architecture

```
frontend/              Next.js 14 (App Router, TypeScript, Tailwind CSS)
  src/
    app/                App Router pages
      dashboard/          Merchant overview dashboard
      merchants/          Merchant detail pages
      layout.tsx          Root layout (RTL, Vazirmatn font)
    components/           React UI components (shadcn/ui style)
      ui/                 Reusable UI primitives
      MerchantSelector    Merchant dropdown
      DateRangeFilter     Date range picker
      KpiCard             Metric display card
      DailyTrendChart     Bar chart (recharts)
      AmountTrendChart    Line chart (recharts)
      CalculationDetails  Metric traceability drawer
      DataLimitationWarning  Warning banner

services/api/            FastAPI backend (Python 3.11)
  app/
    api/v1/endpoints/     API route handlers
    db/                   DuckDB data layer
    models/               Pydantic response models
    main.py               Application entry point
  tests/                  Pytest test suite
    conftest.py           Test fixtures
    test_duckdb.py        Database layer tests
    test_api.py           API endpoint tests

data/                    Dataset files (gitignored, except 10-row sample)
docker-compose.yml       Development compose file
```

## Working Conventions

### Data Access
- Use `DuckDBManager` (`app.db.duckdb_database`) for all dataset queries.
- Never load the full dataset into browser memory. The backend returns paginated
  and aggregated results.
- The dataset is loaded from a CSV file via DuckDB's `read_csv` function.

### Metric Calculation
- Every metric must document: metric_id, definition, formula, source_columns,
  counting_unit, filters, and limitations.
- "Sales" in Stage 1 = all rows. Verified-amount and settled-amount are
  reserved for Stage 2 and must not silently replace the Stage 1 definition.
- Never present `adjusted_fee` as the actual ZarinPal fee. It is
  confidentiality-scaled.

### Counting Units
Every metric must explicitly identify whether it counts:
- **Raw rows** (e.g., payment attempts)
- **Unique sessions** (distinct `session_key`)
- **Verified sessions** (`session_status = 'verified'`)
- **Settled sessions** (`settled_at IS NOT NULL`)

Never use "transaction count" without a clear counting unit.

### Frontend
- Use Persian (fa-IR) locale for all numeric/date formatting via `Intl.NumberFormat`
  and `Intl.DateTimeFormat`.
- Ensure RTL layout: `dir="rtl"` on the `<html>` element.
- Use Vazirmatn font (loaded via next/font with `subset="arabic"`).
- Responsive: mobile-first with Tailwind breakpoints.
- Always handle loading, empty, and error states.
- Never introduce additional UI frameworks beyond Tailwind CSS + shadcn/ui.

### Backend
- All endpoints return JSON with traceability metadata where applicable.
- Empty results return 200 with zero values (not 404).
- Invalid date ranges return 422.
- Division-by-zero returns 0.0 with a trace note.
- Keep endpoints deterministic — the backend is the source of truth for calculations.

### Testing
- Backend: `pytest services/api/tests/` from the repo root.
- Coverage target: minimum 90% for metrics-related code.
- Test edge cases: empty results, invalid dates, division by zero, null values.

### Git
- The full dataset (`data/sample_data.csv`) is excluded from git via `.gitignore`.
- Only a 10-row sample (`data/sample_10_rows.csv`) is committed for reference.
- Commit messages use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`.

## SDD Workflow
1. Write/update the spec before implementation: `specs/<NNN-name>/spec.md`
2. Update the plan: `specs/<nnN-name>/plan.md`
3. Update task list: `specs/<nnN-name>/tasks.md`
4. Implement.
5. Test.
6. Update documentation: `docs/`.
7. Commit with conventional commit message.
8. Update `docs/PROJECT_HANDOFF.md`.

## Stage 0 Review Questions (Do Not Proceed Without Answering)
1. Does every metric formula have a documented counting unit? ✓
2. Is the adjusted_fee confidentiality limitation documented? ✓
3. Is the full dataset excluded from git? ✓
4. Is Persian RTL and Vazirmatn typography configured? ✓
5. Are backend calculations deterministic and the source of truth? ✓
