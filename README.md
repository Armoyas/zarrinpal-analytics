<<<<<<< HEAD
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
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-New%20York-black" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

</div>

---

## 📋 Overview

A production-grade analytics product that turns ZarrinPal's **~480MB transaction dataset** into **actionable, traceable insights** for merchants — not just charts.

Every number shown in the dashboard can be traced back to its source query, so a merchant (or a judge) can verify *exactly* how each insight was derived from the data.

### Key dataset facts (per challenge)

| Fact | Detail |
|------|--------|
| Granularity | Each row is a **payment attempt** (`try_seq`), not a unique session |
| Currency | **Iranian Rial** (all amounts) |
| `adjusted_fee` | Scaled by a constant coefficient — **only relative comparisons are valid** |
| Payment lifecycle | `Verified → Paid → InBank → Failed → Reversed / NoAttempt` |
| Nulls | Card/bank columns populate only when payment completes at the bank |

---

## 🎯 Scoring Criteria → Feature Mapping

| Criterion | Score | How we address it |
|-----------|:-----:|-------------------|
| **اقدام‌پذیری و بدیع‌بودن بینش** (actionable insights) | 90 | AI recommendation panel → each insight leads to a specific number + action |
| **صحت و ردیابی‌پذیری** (validity & traceability) | 75 | Provenance panel — every metric exposes its SQL query + source |
| **عمق تحلیلی** (analytical depth) | 60 | Nowruz seasonality, peer comparison, hypothesis-driven segmentation |
| **تجربه کاربری غیرتکنیکال** (non-technical UX) | 45 | Persian RTL UI, Vazirmatn font, KPI cards, plain-language insights |
| **کیفیت فنی و اجراپذیری** (technical quality) | 30 | Docker Compose, clean monorepo, sample-data seed, setup guide |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · shadcn/ui · Tailwind CSS · Recharts |
| Backend | FastAPI · SQLAlchemy · Pydantic |
| Data | DuckDB (fast analytics) → PostgreSQL (persistence) · Pandas |
| Deployment | Docker Compose · optional Metabase (traceability) · Redis (cache) |
| Docs | AGENTS.md · README · docs/setup.md · docs/demo-script.md |

---

## 🏗 Architecture

```
┌─────────────┐   chunked CSV   ┌──────────────┐   SQL views   ┌──────────────┐
│  ZarrinPal  │ ───────────────▶ │    DuckDB    │ ────────────▶ │  PostgreSQL  │
│  dataset    │   (480MB)        │  (analytics) │               │ (persistence)│
│  (Rial CSV) │                  └──────────────┘               └──────────────┘
└─────────────┘                                                         │
                                                                        ▼
                        ┌───────────────────────────────────────────────┐
                        │                  FastAPI (REST)                │
                        │  /merchants  /analytics  /recommendations     │
                        │  /nowruz     /peer-comparison  /provenance    │
                        └───────────────────────────────────────────────┘
                                                                        │
                        ┌───────────────────────────────┬───────────────┘
                        ▼                               ▼
              ┌──────────────────┐            ┌──────────────────┐
              │  Next.js UI (RTL)│            │  Metabase / PDF  │
              │  Persian dashboard│            │  (traceability)  │
              └──────────────────┘            └──────────────────┘
```

---

## 📁 Folder Structure

```
zarrinpal-analytics/
├── services/
│   ├── api/                  # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py       # app entry + router wiring
│   │   │   ├── config.py     # env-driven settings
│   │   │   ├── database.py   # SQLAlchemy + PostgreSQL
│   │   │   ├── models/       # Merchant, Transaction, AnalyticsFact, Recommendation
│   │   │   ├── schemas/      # Pydantic response models
│   │   │   ├── routers/      # health, merchants, analytics
│   │   │   └── services/     # analytics_engine, data_processor, recommendations
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── data-processing/      # standalone pipeline (SpecKit Phase 2)
│       ├── ingest.py         # chunked CSV → DuckDB (memory-bounded, null-aware)
│       ├── process.py        # analytical views (SQL-explicit for traceability)
│       └── requirements.txt
├── frontend/                 # Next.js dashboard (RTL Persian)
│   ├── app/                  # layout (RTL + Vazirmatn), page, globals.css
│   ├── components/
│   │   ├── dashboard/        # KPI, Trends, Ranking, Recommendations, Nowruz,
│   │   │                     #   PeerComparison, DataProvenance
│   │   ├── layout/           # Header, Sidebar, DashboardLayout
│   │   └── ui/               # shadcn primitives
│   ├── lib/                  # api client + format utils (Rial/percent)
│   └── Dockerfile
├── scripts/
│   ├── run_pipeline.py       # end-to-end pipeline runner
│   └── seed_demo.py          # sample-data generator (demo/testing)
├── docs/                     # setup.md, demo-script.md
├── specs/                    # SDD artifacts (constitution, planning, tasks, spec)
├── docker-compose.yml
├── AGENTS.md                 # AI agent reference
├── spec.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Docker + Docker Compose (v2+)
- 4GB+ RAM (large dataset)

### Quick start (Docker)

```bash
git clone https://github.com/Armoyas/zarrinpal-analytics.git
cd zarrinpal-analytics

cp .env.example .env

# Option A: use the real challenge dataset
#   place it at ./data/zarrinpal_dataset.csv
# Option B: generate sample data for a demo
pip install pandas
python scripts/seed_demo.py --rows 100000 --out data/zarrinpal_dataset.csv

docker compose up -d --build
```

| Service | URL | Notes |
|---------|-----|-------|
| Dashboard (frontend) | http://localhost:3000 | Persian RTL UI |
| API (backend) | http://localhost:8000 | auto docs at `/docs` |
| PostgreSQL | localhost:5432 | processed results |
| Metabase (optional) | http://localhost:3001 | traceability |
| Redis (optional) | localhost:6379 | cache |

### Manual (development)

```bash
# Backend
cd services/api && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev

# Data pipeline
cd services/data-processing && pip install -r requirements.txt
python ingest.py --csv ../../data/zarrinpal_dataset.csv
python process.py
```

See **[docs/setup.md](docs/setup.md)** for the full guide.

---

## ✨ Features

- **KPI cards** — volume, transaction count, success rate, fee ratio, active days
- **Transaction trends** — 90-day volume/count/success-rate charts (Recharts)
- **Merchant ranking** — relative comparison with success-rate badges
- **AI recommendations** — prioritized, actionable insights with calculation shown
- **Nowruz analysis** — seasonal impact (before/during/after the holiday)
- **Peer comparison** — median / p90 / percentile within the same category
- **Data provenance** — "how was this calculated?" for every metric
- **Mobile-first** — responsive sidebar + hamburger navigation
- **RTL Persian** — Vazirmatn font, `dir="rtl"`, Persian number formatting

---

## 🔍 Traceability (صحت و ردیابی‌پذیری)

Every analytical view is expressed as an **explicit SQL query** in `services/data-processing/process.py`. The API exposes a `/provenance` endpoint, and the frontend renders a collapsible panel showing the query + source for each number — so no insight is a black box.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | AI coding agent reference (structure, conventions, data model) |
| [docs/setup.md](docs/setup.md) | Full setup guide (Docker + manual) |
| [docs/demo-script.md](docs/demo-script.md) | 5-minute demo video script (desktop + mobile) |
| [specs/](specs/) | SDD artifacts — constitution, planning, tasks, spec |
| [spec.md](spec.md) | Technical specification |

---

## 📄 License

[MIT](LICENSE) — free for personal and commercial use.

---

*Built for the ZarrinPal data-analytics challenge (Elcamp 1405).*
=======
# ZarrinPal Analytics Dashboard

## Overview

A Persian (Farsi) RTL, mobile-first analytics dashboard for ZarinPal merchants. The dashboard provides explainable metrics and actionable insights based on the ZarinPal payment transaction dataset.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)

### Backend Setup

```bash
cd services/api
pip install -r requirements.txt

# Place your CSV dataset
cp /path/to/your/zarrinpal_dataset.csv data/

# Run the API
uvicorn app.main:app --reload --port 8000
```

### Generate Sample Data

```bash
python scripts/seed_demo.py --rows 50000 --out data/sample_data.csv
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Project Status

Currently in **Phase 0 — Dataset Schema Inspection & Foundation**.

See `docs/PROJECT_HANDOFF.md` for the full project handoff, development methodology, and current phase details.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js + TypeScript + Tailwind + shadcn/ui) │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────┐
│  Backend (FastAPI + DuckDB)                             │
└─────────────────────────┬───────────────────────────────┘
                          │ SQL (explicit, traceable)
┌─────────────────────────▼───────────────────────────────┐
│  Raw CSV Data (500MB, never committed to Git)           │
└─────────────────────────────────────────────────────────┘
```

## Data Constraints

- **Dataset size**: ~480MB CSV (never committed)
- **Row level**: Payment attempt (`try_seq`), not unique session
- **Currency**: Iranian Rials
- **`adjusted_fee`**: Obfuscated with a constant coefficient — only relative comparisons valid
- **Nullable columns**: `switch_response_code`, `psp_code`, `issuer_bank_code`, `payer_card_key`, `init_time_ms`, `verify_time_ms`, `try_created_at`, `verified_at`, `settled_at`
- **No reliable customer_id or product_id columns** — customer retention, product sales, inventory analysis, and fast/slow-moving product features are NOT implemented

## License

MIT
>>>>>>> 7fbac18 (fix: align backend with real ZarinPal CSV schema)
