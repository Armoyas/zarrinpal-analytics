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

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | AI coding agent reference (structure, conventions, data model) |
| [CLAUDE.md](CLAUDE.md) | Quick reference for Claude Code |
| [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md) | Project handoff, methodology, phase status |
| [docs/setup.md](docs/setup.md) | Full setup guide |
| [docs/demo-script.md](docs/demo-script.md) | Demo video script |
| [docs/data-dictionary.md](docs/data-dictionary.md) | Confirmed CSV column data dictionary |
| [docs/schema-summary.json](docs/schema-summary.json) | Machine-readable schema |
| [specs/phase-0-schema-foundation/spec.md](specs/phase-0-schema-foundation/spec.md) | Phase 0: Foundation & schema specification (SDD) |
| [specs/phase-1-api-foundation/spec.md](specs/phase-1-api-foundation/spec.md) | Phase 1: API specification (SDD) |
| [specs/phase-2-dashboard-ui/spec.md](specs/phase-2-dashboard-ui/spec.md) | Phase 2: Dashboard UI specification (SDD) |

---

## 📄 License

MIT — free for personal and commercial use.

---

*Built for the ZarrinPal data-analytics challenge (Elcamp 1405).*
