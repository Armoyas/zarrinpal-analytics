# AGENTS.md

> Agent instructions for working on the **Analytical Dashboard for ZarinPal Merchants** project.

## Project Overview

This is a Persian RTL analytical dashboard for ZarinPal merchants. It analyzes
payment activity, sales amounts, merchant performance, success/failure rates,
and provides traceable insights with full calculation metadata.

## Architecture

```
data/sample_data.csv          ← sample data (committed, 10 rows)
  ↓ (read_csv)
services/api/                  ← Backend: FastAPI + DuckDB
  app/
    main.py                   ← 5 REST endpoints
    database.py               ← DuckDB queries (source of truth)
    models.py                 ← Pydantic models + traceability
  tests/
    test_stage1_s0.py         ← 27 pytest tests

frontend/                     ← Frontend: Next.js 14 + Tailwind CSS v3
  app/
    page.tsx                  ← Dashboard page (Persian RTL)
    layout.tsx                ← RTL layout with Vazirmatn font
    components/               ← shadcn/ui-style components
  lib/
    api.ts                    ← API client
```

## Development Workflow

### SDD Methodology

1. Read `specs/constitution.md` before any work.
2. Read the stage spec (`specs/001-core-overview/spec.md`).
3. Follow tasks in `specs/001-core-overview/tasks.md`.
4. Update specs and docs after each stage.

### Key Rules

- **Never commit the full dataset** — `.gitignore` excludes `data/sample_data.csv`.
  Only `data/sample_10_rows.csv` (10 rows) is tracked.
- **Never compute metrics in the frontend** — all calculations happen in the
  backend (DuckDB queries). Frontend consumes only API responses.
- **Never invent dataset columns** — only use columns confirmed by
  `docs/data-dictionary.md`.
- **Never present `adjusted_fee` as the real ZarinPal fee** — it is a
  confidentiality-adjusted indicator.
- **Document every metric formula** in `docs/metric-definitions.md`.

### Environment Variables

```bash
DATA_FILE=data/sample_data.csv     # Path to CSV (full or sample)
DUCKDB_PATH=data/analytics.duckdb  # DuckDB database file path
DEBUG=false                        # Enable debug mode
```

See `.env.example` for all variables.

### Running Tests

**Backend tests:**
```bash
cd services/api
DATA_FILE=../../data/sample_data.csv python -m pytest tests/ -v
```

**Frontend validation:**
```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

**Docker Compose:**
```bash
docker compose config  # validate config
docker compose up      # start all services
```

### Frontend Conventions

- Next.js 14 App Router (`app/` directory)
- Tailwind CSS v3 with dark theme (slate-900 base)
- Vazirmatn font with Persian (arabic) + Latin subsets
- `dir="rtl"` and `lang="fa"` on the HTML element
- All text in Persian (RTL)
- Responsive: mobile-first with `md:` and `lg:` breakpoints
- Components in `frontend/app/components/`
- API client in `frontend/lib/api.ts`
- TypeScript paths: `@/*` maps to project root

### Backend Conventions

- FastAPI with Pydantic models
- DuckDB for all data queries
- All metrics return `MetricTrace` with `metric_id`, `definition`, `formula`,
  `source_columns`, `counting_unit`, `filters`, `limitations`
- Date validation: 400 on `start_date > end_date`
- Division-by-zero: `success_rate = 0.0` when no rows
- No PostgreSQL, SQLAlchemy, or authentication

### Stage Scope

- Stage 0: Foundation (scaffolding, dataset inspection, Docker) — DONE
- Stage 1: Core Merchant Overview (health, schema, merchants, overview, trends) —
  Current stage
- Stage 2+: Advanced analytics (NOT IMPLEMENTED)
