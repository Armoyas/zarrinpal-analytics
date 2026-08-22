# AGENTS.md — AI Coding Agent Reference

## Project Overview

**Analytical Dashboard for ZarinPal Merchants** — A modern Persian RTL analytical dashboard for ZarinPal payment data.

- **Challenge:** Analyze ZarinPal transaction data (Elcamp 1405)
- **Goal:** Actionable, traceable insights for non-technical merchants
- **Dashboard analysis scope:** Payment activity, sales, merchant performance, success/failure rates, merchant sales share, adjusted-fee indicators, high-value payments

## Technology Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS v3 · Vazirmatn font |
| Backend | FastAPI · DuckDB (direct CSV querying) |
| Data | DuckDB (CSV direct read, no intermediate PostgreSQL) |
| Deploy | Docker Compose |

## Data Model

Each row represents a **payment attempt** (`try_seq`), not necessarily a unique session. 
- `session_key` identifies a payment session (may have multiple attempts)
- `try_seq` is the attempt sequence within a session
- Both `session_status` and `try_status` share the same value set: `Verified`, `InBank`, `Failed`, `Paid`, `NoAttempt`, `Reversed`
- `adjusted_fee` is confidentiality-scaled — NOT the real ZarinPal fee
- `payer_card_key` is 94% null and cannot support repeat-behavior analysis

See `docs/data-dictionary.md` and `docs/data-quality-report.md` for full details.

## Build & Development Commands

```bash
# Backend
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000

# Frontend
cd frontend
npm install && npm run dev  # http://localhost:3000

# Full stack (Docker)
docker compose up -d --build

# Health check
curl http://localhost:8000/health

# Schema inspection
python scripts/inspect_schema.py --csv data/sample_data.csv --output docs/data-dictionary.md

# Data validation
python scripts/validate_dataset.py --csv data/sample_data.csv
```

## Environment

Copy `.env.example` to `.env` and adjust as needed.

## SDD Workflow

1. Read `specs/constitution.md` before any work
2. Read the relevant stage spec in `specs/`
3. Follow tasks in `specs/<stage>/tasks.md`
4. Update specs and docs after each stage

## Critical Rules

- **Never commit the full dataset** — use `.gitignore` and data rules
- **Document every metric formula** in `docs/data-dictionary.md`
- **adjusted_fee is NOT the real fee** — always communicate this limitation
- **Deterministic backend calculations** are the source of truth
- **Persian RTL support** is mandatory (Vazirmatn font, `dir="rtl"`)