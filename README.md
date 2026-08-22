# Analytical Dashboard for ZarinPal Merchants

A modern Persian (RTL) analytical dashboard for ZarinPal merchants, built with
FastAPI + DuckDB backend and Next.js 14 + Tailwind CSS frontend.

**Stage 1 — Core Merchant Overview** ✅

## Architecture

```
┌─────────────────────┐
│  data/sample_data.csv │  ← Sample CSV (10 rows committed)
└──────────┬──────────┘
           │ read_csv()
           ▼
┌─────────────────────┐
│  Backend: FastAPI    │  ← DuckDB queries (source of truth)
│  + DuckDB            │  ← All metrics computed here
│  Port: 8000          │
└──────────┬──────────┘
           │ HTTP/JSON
           ▼
┌─────────────────────┐
│  Frontend: Next.js   │  ← Persian RTL dashboard
│  14 + Tailwind CSS   │  ← KPI cards, charts, filters
│  Port: 3000          │
└─────────────────────┘
```

## Features (Stage 1)

**Backend API (FastAPI + DuckDB):**

- `GET /api/v1/health` — Service health check
- `GET /api/v1/schema` — Dataset schema (22 columns, null counts, roles)
- `GET /api/v1/merchants` — Merchant list with category filter
- `GET /api/v1/overview` — 8 core metrics with full traceability
- `GET /api/v1/trends` — Daily aggregation for trend charts

**Metrics:**

- Payment-attempt row count (`COUNT(*)`)
- Unique session count (`COUNT(DISTINCT session_key)`)
- Verified count (`COUNT WHERE session_status = 'Verified'`)
- Settled count (`COUNT WHERE settled_at IS NOT NULL`)
- Failed count (`COUNT WHERE session_status = 'Failed'`)
- Success rate (`COUNT(Verified) / COUNT(*) * 100`)
- Total amount (`SUM(amount)`)
- Average amount (`AVG(amount)`)

**Frontend Dashboard:**

- Persian RTL (Vazirmatn font, `dir="rtl"`, `lang="fa"`)
- Merchant selector dropdown
- Date-range filter
- KPI cards with Persian labels
- Daily activity bar chart (recharts)
- Amount trend line chart (recharts)
- Data limitation warning
- Loading / empty / error states
- Calculation-details drawer (traceability)

## Quick Start with Docker

```bash
# Set environment variables
cp .env.example .env

# Start all services
docker compose up

# Backend API: http://localhost:8000
# Frontend:     http://localhost:3000
# API docs:     http://localhost:8000/docs
```

## Development

### Backend

```bash
cd services/api
pip install -r requirements.txt
DATA_FILE=../../data/sample_data.csv python -m pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm install
npm run dev         # development
npm run lint        # lint
npm run typecheck   # type checking
npm run build       # production build
```

## Data Rules

- All amounts are in Iranian rial (IRR).
- `adjusted_fee` is a confidentiality-adjusted indicator, NOT the real ZarinPal
  fee — not used as a metric.
- `payer_card_key` is 94% null — repeat-behavior analysis not reliable.
- `settled_at` is 99% null — settlement data very sparse.
- The full dataset is never committed to Git (only 10-row sample).

## Project Structure

```
analytical-dashboard/
├── specs/                # SDD specifications
│   ├── constitution.md   # Project constitution (9 principles)
│   ├── 000-foundation/   # Stage 0 spec
│   └── 001-core-overview/ # Stage 1 spec
├── docs/                 # Documentation
├── services/api/         # Backend (FastAPI + DuckDB)
├── frontend/             # Frontend (Next.js 14)
├── scripts/              # Data inspection scripts
├── data/                 # Data directory (sample only)
└── docker-compose.yml    # Docker Compose
```

## Testing

```bash
# Backend tests
cd services/api
DATA_FILE=../../data/sample_data.csv DUCKDB_PATH=:memory: python -m pytest tests/ -v

# Frontend validation
cd frontend
npm run lint
npm run typecheck
npm run build

# Docker Compose
docker compose config
```

## License

This project is for the Elcamp 1405 competition.
