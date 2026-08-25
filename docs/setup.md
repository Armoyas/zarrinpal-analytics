# Setup Guide

## Overview

This guide covers local development and Docker-based deployment of the ZarinPal Analytics
dashboard.

## Prerequisites

- Docker 24+
- Docker Compose v2+
- (Optional, for local development) Python 3.11+, Node.js 18+

## Quick Start (Docker)

```bash
cd zarrinpal-analytics
docker compose up --build
```

**Services started:**

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API | 8000 | http://localhost:8000 | FastAPI backend + DuckDB |
| Frontend | 3001 | http://localhost:3001 | Next.js dashboard |
| Nginx | 80 | http://localhost:80 | Reverse proxy (production) |

**API docs:** http://localhost:8000/docs
**Dashboard:** http://localhost:3001

## Local Development

### Backend (FastAPI)

```bash
cd services/api
pip install -r requirements.txt
# Generate test data (10,000 rows)
python ../../scripts/seed_demo.py --rows 10000 --out data/sample_data.csv
# Run tests
PYTHONPATH=.:./app:db python -m pytest tests/ -v
# Run dev server
PYTHONPATH=.:./app:db python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**PYTHONPATH note:** Must include `.:./app/db` so that `from app.db...` and `from duckdb_database import ...` both resolve during tests.

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev      # http://localhost:3001
npm run lint     # ESLint
npx tsc --noEmit # TypeScript typecheck
npm run build    # Production build
```

## Data Setup

The dashboard requires `data/sample_data.csv`. This file is **gitignored** for size.

### Auto-generation (CI / tests)

The test fixtures (`tests/conftest.py`) auto-generate 10,000 rows via:

```bash
python scripts/seed_demo.py --rows 10000 --out services/api/data/sample_data.csv
```

### Manual generation

```bash
cd zarrinpal-analytics
python scripts/seed_demo.py --rows 10000 --out data/sample_data.csv
```

The generated CSV includes the full 22-column schema:
`session_key, try_seq, terminal_key, merchant_key, category_id, category_title,
amount, adjusted_fee, session_status, try_status, switch_response_code, psp_code,
issuer_bank_code, payer_card_key, verify_type, init_time_ms, verify_time_ms,
created_at, try_created_at, verified_at, settled_at, expire_in`

## Docker Compose

```yaml
services:
  api:
    build: ./services/api
    ports: ["8000:8000"]
    volumes:
      - ./data:/app/data
      - ./services/api/app:/app/app
    environment:
      DATA_DIR: /app/data
      DUCKDB_PATH: /app/data/analytics.duckdb
      DATA_FILE: /app/data/sample_data.csv
      PYTHONPATH: .:./app:db

  frontend:
    build: ./frontend
    ports: ["3001:3001"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [frontend, api]
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `/app/data` | Directory for data files |
| `DUCKDB_PATH` | `/app/data/analytics.duckdb` | DuckDB database file path |
| `DATA_FILE` | `/app/data/sample_data.csv` | CSV input path |
| `PYTHONPATH` | `.:./app:db` | Python module search path |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend API base URL |

## Production Deployment

### Deploy via SSH

```bash
ssh root@62.60.198.209
cd /root/zp-project
./deploy.sh
```

The deploy script:
1. Copies `deploy.sh`, `docker-compose.yml`, `nginx.conf` to the server
2. Stops existing containers
3. Runs `docker compose up --build -d`
4. Verifies health at `http://localhost:8000/api/v1/health`

### Files deployed to server

From the `main` branch of the git repo:
- `deploy.sh` — SSH deployment script
- `docker-compose.yml` — Multi-service compose
- `nginx.conf` — Reverse proxy config

## Troubleshooting

### PYTHONPATH issues

```bash
# Must include .:./app:db from services/api/ directory
cd services/api
PYTHONPATH=.:./app:db python -m pytest tests/ -v
```

### DuckDB stale database

```bash
# Delete the DuckDB file to force CSV reload
rm -f data/analytics.duckdb
```

### Frontend build fails on lint

```bash
cd frontend
npm run lint -- --fix  # auto-fix lint issues
npm run build          # rebuild
```

## Stage 6: Dashboard Access

After starting Docker Compose, the dashboard is available at:
- Frontend: `http://localhost:3001` (redirects to `/dashboard`)
- API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

The dashboard at `/dashboard` includes:
- Merchant selector dropdown (TopBar)
- Date range filter (TopBar)
- All 9 dashboard sections (overview, AI insights, payment activity, sales share, adjusted-fee, high-value, ranking, insights, nowruz)
- Mobile-responsive sidebar navigation
- Persian RTL layout with Vazirmatn font
- Calculation details, data provenance, and limitation warnings
