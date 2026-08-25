# ZarrinPal Analytics

A modern Persian RTL analytical dashboard for ZarinPal merchants, built with FastAPI, DuckDB, Next.js, Tailwind CSS, and shadcn/ui.

## Overview

This project analyzes ZarinPal payment data to provide merchants with insights into:
- Payment activity and trends
- Sales and payment amounts
- Merchant performance
- Success and failure rates
- Merchant sales share
- Daily, monthly, and yearly activity patterns
- AI-powered recommendations and anomaly detection
- High-value payment analysis
- Adjusted-fee analysis
- Nowruz (Persian New Year) holiday analytics

## Architecture

```
zarrinpal-analytics/
├── services/
│   ├── api/                     # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/v1/          # API routes
│   │   │   │   └── endpoints/
│   │   │   │       ├── __init__.py        # Core endpoints + router
│   │   │   │       ├── metrics.py         # PerformanceMetrics, status distribution
│   │   │   │       ├── insights.py        # AI analytics endpoints
│   │   │   │       ├── nowruz.py          # Nowruz holiday analytics
│   │   │   │       └── sales.py           # Stage 2: sales share, activity, ranking
│   │   │   ├── db/
│   │   │   │   ├── duckdb_database.py  # DuckDBManager with all analytics
│   │   │   │   └── __init__.py
│   │   │   ├── schemas/
│   │   │   │   └── __init__.py       # Pydantic response models
│   │   │   ├── config.py            # Settings
│   │   │   └── main.py              # FastAPI entry point
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── tests/
│   │   │   ├── conftest.py          # Test fixtures
│   │   │   ├── test_duckdb.py       # Database tests
│   │   │   └── test_stage2.py       # Stage 2 tests
│   │   └── uv.lock
│   └── frontend/                # Next.js 14 frontend
│       ├── app/                 # App Router pages
│       │   ├── layout.tsx       # Persian RTL layout with Vazirmatn
│       │   ├── page.tsx         # Root → redirect to /dashboard
│       │   ├── dashboard/       # Main dashboard (9 sections)
│       │   ├── ai-dashboard/    # AI analytics dashboard
│       │   ├── nowruz-dashboard/ # Nowruz analytics
│       │   └── merchant/[key]/  # Merchant detail page
│       ├── components/
│       │   ├── layout/          # DashboardLayout, Header, Sidebar, ThemeToggle
│       │   ├── providers/       # ThemeProvider, QueryProvider
│       │   ├── dashboard/       # Reusable dashboard widgets
│       │   ├── MerchantSelector, DateRangeFilter, CalculationDetails,
│       │   │   DataLimitationWarning
│       │   └── ui/              # shadcn/ui components
│       ├── lib/
│       │   ├── api.ts           # API client functions
│       │   └── query-client.ts  # React Query client
│       ├── tailwind.config.ts
│       ├── package.json
│       └── next.config.js
├── data/                      # Dataset (gitignored)
├── docs/                      # Documentation
├── specs/                     # SDD specifications
├── scripts/                   # Data generation & test scripts
├── docker-compose.yml
├── .env.example
├── AGENTS.md
├── README.md
└── PROJECT_STRUCTURE.md
```

## Sales Definitions

| Definition | Formula | Counting Unit | Stage |
|-----------|---------|---------------|-------|
| `total_amount` | `SUM(amount)` over all rows | rows | Stage 1 |
| `successful_amount` | `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')` | rows | Stage 2 |
| `settled_amount` | `SUM(amount) WHERE settled_at IS NOT NULL` | rows | Not used (98.95% null) |

## Quick Start (Docker)

```bash
docker compose up --build
```

- API: http://localhost:8000 (docs: http://localhost:8000/docs)
- Frontend: http://localhost:3001

## Development

### Backend
```bash
cd services/api
pip install -r requirements.txt
PYTHONPATH=.:./app:db python -m pytest tests/ -v
PYTHONPATH=.:./app:db python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:3001
npm run lint
npx tsc --noEmit    # typecheck
npm run build       # production build
```

## Test Results

| Check | Result |
|-------|--------|
| pytest | 43 passed (21 Stage 1 + 22 Stage 2) |
| Frontend lint | PASS |
| Frontend typecheck | PASS |
| Frontend build | PASS |
| Docker Compose config | VALID |

## Known Limitations

1. `adjusted_fee` is NOT the real ZarinPal fee — it is a confidentiality-scaled indicator
2. `settled_at` is NULL for 98.95% of rows — too sparse for settled-only analytics
3. `payer_card_key` has 94% nulls — cannot support repeat-behavior analysis
4. No `customer_id` or `product_id` columns — no customer/product analytics
5. Category titles are Persian calendar month names, not business categories

## Stages

| Stage | Description | Status |
|-------|-------------|--------|
| 0 | Project foundation and dataset inspection | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Sales Share and Time-Based Analytics | ✅ Complete |
| 3 | Adjusted-Fee Analysis | ✅ Complete |
| 4 | High-Value Payment Analysis | ✅ Complete |
| 5 | AI Recommendations | ✅ Complete |
| 5/6 | Insights & UX Polish (RTL, mobile, demo prep) | ✅ Complete |

## License

See `docs/PROJECT_HANDOFF.md` for details.
