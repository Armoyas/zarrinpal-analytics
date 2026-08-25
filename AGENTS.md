# AGENTS.md

> Reference instructions for AI agents contributing to the ZarinPal Analytics Dashboard project.

## Project Overview

The ZarrinPal Analytics Dashboard is a modern, Persian (RTL) web application that
provides analytical insights into ZarinPal payment transactions. It is built with
a FastAPI + DuckDB backend and a Next.js 14 + Tailwind CSS frontend.

## Architecture

```
frontend/              Next.js 14 (App Router, TypeScript, Tailwind CSS)
  app/
    layout.tsx          Root layout (RTL, Vazirmatn font, ThemeProvider, QueryProvider)
    page.tsx            Root page → redirects to /dashboard (skeleton loading)
    dashboard/
      page.tsx          Main dashboard (9 sections)
    merchant/[key]/
      page.tsx          Merchant detail page
    ai-dashboard/
      page.tsx          AI analytics dashboard
    nowruz-dashboard/
      page.tsx          Nowruz holiday analytics
  components/
    layout/             DashboardLayout, Header, Sidebar, ThemeToggle
    providers/          ThemeProvider, QueryProvider
    dashboard/          PerformanceMetrics, TransactionTrends, MerchantRanking,
                        PeerComparison, RecommendationPanel, AIInsightsCard,
                        AnomalyDetector, SpendingPatternsChart, RiskAlertCard,
                        NowruzAnalysis, AIChat, DataProvenance
    MerchantSelector    Merchant dropdown with search
    DateRangeFilter     Calendar date range picker
    CalculationDetails  Metric traceability dialog
    DataLimitationWarning  Warning banner
    ui/                 shadcn/ui components
  lib/
    api.ts              API client functions
    query-client.ts     React Query client
    utils.ts            Persian number, currency, date formatters

services/api/            FastAPI backend (Python 3.11)
  app/
    api/v1/
      endpoints/
        __init__.py       Core endpoints + router registration
        metrics.py        Health, schema, status distribution
        insights.py       AI analytics (spending patterns, risk, anomalies)
        nowruz.py         Nowruz holiday analytics
        sales.py          Stage 2: sales share, activity, ranking
    db/
      duckdb_database.py  DuckDBManager — all analytics methods
    schemas/
      __init__.py         Pydantic response models
    config.py             Settings (API prefix, paths)
  tests/
    conftest.py           Test fixtures (auto-generates 10k rows)
    test_duckdb.py        Database layer tests
    test_stage2.py        Stage 2 endpoint tests
  scripts/
  requirements.txt

data/                    Dataset files (gitignored, except 10-row sample)
docker-compose.yml       Multi-service Docker setup
```

## Working Conventions

### Data Access
- Use `DuckDBManager` (`app.db.duckdb_database`) for all dataset queries.
- Never load the full dataset into browser memory. The backend returns aggregated results.
- The dataset is loaded from a CSV file via DuckDB's `read_csv` function.

### Metric Calculation
- Every metric must document: metric_id, definition, formula, source_columns,
  counting_unit, filters, and limitations.
- Sales in Stage 1 = all rows. Verified/successful amount reserved for Stage 2.
- Never present `adjusted_fee` as the actual ZarinPal fee. It is confidentiality-scaled.

### Counting Units
Every metric must explicitly identify whether it counts:
- **Raw rows** (e.g., payment attempts)
- **Unique sessions** (distinct `session_key`)
- **Verified sessions** (`session_status = 'Verified'`)
- **Settled sessions** (`settled_at IS NOT NULL`)
Never use "transaction count" without a clear counting unit.

### Frontend
- Use Persian (fa-IR) locale for all numeric/date formatting via `Intl.NumberFormat`
  and `Intl.DateTimeFormat`.
- Ensure RTL layout: `dir="rtl"` on the `<html>` element (set in `app/layout.tsx`).
- Use Vazirmatn font (loaded via Google Fonts with `font-display: swap`).
- Responsive: mobile-first with Tailwind breakpoints. `lg:hidden` for mobile sidebar.
- Always handle loading, empty, and error states.
- Never introduce additional UI frameworks beyond Tailwind CSS + shadcn/ui.
- Use `DashboardLayout` (not bare div) for all dashboard pages — it includes
  Header, Sidebar, mobile drawer, and DataLimitationWarning.

### Backend
- All endpoints return JSON with traceability metadata where applicable.
- Empty results return 200 with zero values (not 404).
- Invalid date ranges return 422.
- Division-by-zero returns 0.0 with a trace note.
- Keep endpoints deterministic — the backend is the source of truth for calculations.
- API router prefix is `/api/v1` (set via `settings.api_prefix`). Sub-routers
  must NOT add their own prefix — the main `include_router` call handles it.

### Testing
- Backend: `cd services/api && PYTHONPATH=.:./app:db python -m pytest tests/ -v`
- Coverage target: minimum 90% for metrics-related code.
- Test edge cases: empty results, invalid dates, division by zero, null values.
- Frontend: `cd frontend && npm run lint && npx tsc --noEmit && npm run build`

### Git
- The full dataset (`data/sample_data.csv`) is excluded from git via `.gitignore`.
- Only a 10-row sample may be committed for reference.
- Commit messages use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`.
- Stage 6 commit: "feat: polish RTL mobile dashboard and prepare hackathon demo"
- Stage 5 commit: "feat: polish RTL mobile dashboard and prepare hackathon demo"

## SDD Workflow
1. Write/update the spec before implementation: `specs/<NNN-name>/spec.md`
2. Update the plan: `specs/<NNN-name>/plan.md`
3. Update task list: `specs/<NNN-name>/tasks.md`
4. Implement.
5. Test.
6. Update documentation: `docs/`.
7. Commit with conventional commit message.
8. Update `docs/PROJECT_HANDOFF.md`.

## Stage Progress

| Stage | Description | Status |
|-------|-------------|--------|
| 0 | Project foundation and dataset inspection | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Sales Share and Time-Based Analytics | ✅ Complete |
| 3 | Adjusted-Fee Analysis | ✅ Complete |
| 4 | High-Value Payment Analysis | ✅ Complete |
| 5 | AI Recommendations | ✅ Complete |
| 5/6 | Insights & UX Polish (RTL, mobile, demo prep) | ✅ Complete |

## Stage 0 Review Questions
1. Does every metric formula have a documented counting unit? ✓
2. Is the adjusted_fee confidentiality limitation documented? ✓
3. Is the full dataset excluded from git? ✓
4. Is Persian RTL and Vazirmatn typography configured? ✓
5. Are backend calculations deterministic and the source of truth? ✓
