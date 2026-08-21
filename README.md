<div align="center">

# داشبورد تحلیلی زرین‌پال · ZarrinPal Analytics Dashboard

**Interactive merchant analytics dashboard for ZarrinPal's payment transaction dataset**
*(چالش تحلیل داده زرین‌پال — Elcamp 1405)*

<br />

<p>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/DuckDB-1.0-FFF000" alt="DuckDB" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-New%20York-black" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

</div>

---

## 📋 Overview

A Persian (Farsi) RTL, mobile-first analytics dashboard for ZarrinPal merchants. The dashboard provides explainable metrics and actionable insights based on the ZarrinPal payment transaction dataset.

**Current Phase: Phase 0 — Dataset Schema Inspection & Foundation**

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)

### Backend Setup

```bash
cd services/api
pip install -r requirements.txt

# Generate sample data (10k rows)
python ../scripts/seed_demo.py --rows 10000 --out data/sample_data.csv

# Run the API
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
cd services/api
pytest -v
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js + TypeScript + Tailwind + shadcn/ui) │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────┐
│  Backend (FastAPI + DuckDB)                             │
│  No PostgreSQL or ORM — reads CSV directly via DuckDB   │
└─────────────────────────┬───────────────────────────────┘
                          │ SQL (explicit, traceable)
┌─────────────────────────▼───────────────────────────────┐
│  Raw CSV Data (500MB, never committed to Git)           │
└─────────────────────────────────────────────────────────┘
```

---

## Data Constraints

- **Dataset size**: ~480MB full CSV (never committed to Git)
- **Row level**: Payment attempt (`try_seq`), not unique session
- **Currency**: Iranian Rials
- **`adjusted_fee`**: Obfuscated with a constant coefficient — only relative comparisons valid
- **Nullable columns**: `switch_response_code`, `psp_code`, `issuer_bank_code`, `payer_card_key`, `init_time_ms`, `verify_time_ms`, `try_created_at`, `verified_at`, `settled_at`
- **No reliable `customer_id` or `product_id` columns** — customer retention, product sales, inventory analysis, and fast/slow-moving product features are NOT implemented
- **Success definition**: `session_status IN ('Verified', 'Paid', 'Reversed')`

## Project Structure

```
zarrinpal-analytics/
├── services/
│   ├── api/                  # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py       # app entry + router wiring
│   │   │   ├── config.py     # env-driven settings
│   │   │   ├── db/           # duckdb_database.py — DuckDB access
│   │   │   ├── api/v1/endpoints/      # API routes
│   │   │   └── services/     # data_processor, analytics_engine
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── tests/            # pytest test suite
│   └── data-processing/      # standalone pipeline
├── frontend/                 # Next.js dashboard (RTL Persian)
│   ├── app/                  # layout (RTL + Vazirmatn), page, globals.css
│   ├── components/
│   │   ├── dashboard/        # KPI, Trends, Ranking, PeerComparison
│   │   ├── layout/           # Header, Sidebar, DashboardLayout
│   │   └── ui/               # shadcn primitives
│   ├── lib/                  # api client + format utils
│   └── package.json
├── scripts/
│   ├── seed_demo.py          # sample-data generator
│   └── inspect_schema.py     # schema inspection
├── docs/
│   ├── PROJECT_HANDOFF.md    # Project handoff
│   ├── data-dictionary.md    # Confirmed data dictionary
│   ├── schema-summary.json   # Machine-readable schema
│   ├── setup.md              # Full setup guide
│   └── demo-script.md        # Demo video script
├── specs/
│   └── phase-0-schema-foundation/
│       └── spec.md               # Foundation specification (SDD)
│   └── phase-1-api-foundation/
│       └── spec.md               # API specification (SDD)
│   └── phase-2-dashboard-ui/
│       └── spec.md               # Dashboard UI specification (SDD)
├── AGENTS.md                 # AI coding agent reference
├── CLAUDE.md                 # Quick reference for Claude
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🔍 Traceability

Every analytical metric is expressed as an **explicit SQL query** using DuckDB. The API exposes calculation metadata (`how_calculated` field) in the `/overview` endpoint response, and the frontend renders tooltips showing the formula for each KPI — so no insight is a black box.

---

---

## 🤖 AI-Powered Analytics

The dashboard now includes AI-powered analytical endpoints for spending pattern analysis, risk alerts, predictive forecasting, and anomaly detection, plus Nowruz (Persian New Year) holiday analytics.

### AI Analytics Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/v1/insights/spending-pattern` | AI-driven transaction spending pattern analysis |
| `GET` | `/api/v1/insights/risk-alerts` | High-risk merchant alerts ranked by risk score |
| `GET` | `/api/v1/insights/predictive-forecast` | 7-day predictive forecast of transaction volume |
| `GET` | `/api/v1/insights/anomaly-detection` | Anomaly detection in merchant behavior |
| `GET` | `/api/v1/merchants` | Merchant performance metrics |

### Nowruz (Persian New Year) Analytics

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/v1/nowruz/analytics` | AI-powered Nowruz period analytics and predictions |
| `GET` | `/api/v1/nowruz/forecast` | Nowruz revenue forecast |
| `GET` | `/api/v1/nowruz/comparative` | Comparative analysis vs previous period |
| `GET` | `/api/v1/nowruz/recommendations` | AI-powered merchant recommendations during Nowruz |

### AI Analytics DuckDB Methods

The `DuckDBManager` includes 6 AI-powered analytical methods:

- `get_spending_patterns()` — Aggregates transaction amounts by status, identifies payment trends and volume distributions
- `get_risk_alerts(limit=50)` — Computes risk scores per merchant based on failure rates and volume volatility
- `get_predictive_forecast(days=7)` — Generates time-series forecasts of transaction volume using historical trends
- `get_anomaly_detection(limit=50)` — Detects statistical anomalies in merchant transaction patterns
- `get_merchant_performance(merchant_key)` — Returns merchant-level performance metrics (key, volume, revenue, success rate)
- `get_nowruz_analytics()` — Analyzes transaction patterns during the Nowruz period for gift card and prepaid card transactions

### Frontend AI Dashboard Components

| Component | File | Description |
|-----------|------|-------------|
| `AIPanel.tsx` | `frontend/src/app/components/dashboard/` | Container for AI-powered insights section |
| `AIInsightsCard.tsx` | `frontend/src/app/components/dashboard/` | Spending pattern analysis display |
| `PredictionChart.tsx` | `frontend/src/app/components/dashboard/` | Forecast visualization with Recharts |
| `RiskAlertCard.tsx` | `frontend/src/app/components/dashboard/` | High-risk merchant alert display |
| `AnomalyDetector.tsx` | `frontend/src/app/components/dashboard/` | Anomaly detection results display |
| `DashboardPage.tsx` | `frontend/src/app/components/dashboard/` | Main dashboard with AI section integration |

---

## 📚 Documentation

## 📄 License

MIT — free for personal and commercial use.

---

*Built for the ZarrinPal data-analytics challenge (Elcamp 1405).*
