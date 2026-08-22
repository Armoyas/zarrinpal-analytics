# ZarinPal Analytical Dashboard

Modern Persian RTL analytical dashboard for ZarinPal merchants, built with SDD methodology.

## Project Overview

This dashboard analyzes ZarinPal payment data to provide merchants with actionable, traceable insights including:
- Payment activity analysis
- Sales and payment amounts
- Merchant performance metrics
- Success and failure patterns
- Merchant sales share
- Adjusted-fee indicators (confidentiality-scaled)
- High-value payment identification

## Current Stage: 0 — Foundation ✅

See `specs/000-foundation/spec.md` for details.

## Quick Start

### With Docker Compose

```bash
cp .env.example .env
docker compose up -d --build
```

- Backend API: http://localhost:8000
- Health check: http://localhost:8000/health
- Frontend: http://localhost:3000

### Without Docker

```bash
# Backend
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npx serve -s src/
```

## Dataset Inspection

```bash
# Inspect schema
python scripts/inspect_schema.py --csv data/sample_data.csv --output docs/data-dictionary.md

# Validate data
python scripts/validate_dataset.py --csv data/sample_data.csv
```

## Documentation

- `specs/constitution.md` — Project constitution (read first)
- `specs/000-foundation/` — Stage 0 specification
- `docs/data-dictionary.md` — Column documentation
- `docs/data-quality-report.md` — Data quality findings
- `docs/PROJECT_HANDOFF.md` — Stage handoff

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Vanilla CSS (Persian RTL, Vazirmatn font) |
| Backend | FastAPI + DuckDB |
| Data | CSV loaded directly via DuckDB |
| Deploy | Docker Compose |

## Important Notes

- All amounts are in Iranian rial (IRR)
- `adjusted_fee` is confidentiality-scaled, NOT the real ZarinPal fee
- `payer_card_key` is 94% null and cannot support repeat-behavior analysis
- Full dataset must never be committed to Git
- See `AGENTS.md` for AI coding agent guidelines
