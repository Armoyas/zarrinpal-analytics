# ZarinPal Analytics Dashboard

A modern, Persian (RTL) analytical dashboard for ZarinPal merchants, built with
FastAPI + DuckDB (backend) and Next.js 14 + Tailwind CSS (frontend).

## Features

- **Merchant Overview**: Payment activity, success rates, and amount trends
- **Persian RTL**: Full right-to-left layout with Vazirmatn typography
- **Dataset Inspection**: Schema exploration and data quality reporting
- **Traceable Metrics**: Every metric documented with formulas and limitations
- **Responsive Design**: Mobile-first dashboard with interactive charts

## Stage Status

| Stage | Name | Status |
|-------|------|--------|
| 0 | Project Foundation & Dataset Inspection | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Sales Share & Time-Based Analytics | ⏳ In Progress |

## Quick Start

### Docker Compose

```bash
docker compose up --build
```

- API: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

### Environment

Copy `.env.example` and adjust:

```bash
cp .env.example .env
```

The dataset path defaults to `data/sample_data.csv`. For production, mount your
dataset via Docker Compose or set `DATASET_PATH` in `.env`.

## Architecture

```
┌─────────────────┐       ┌──────────────────┐
│   Frontend      │ HTTP  │     Backend      │
│   Next.js 14    │──────▶│   FastAPI 8000   │
│   Tailwind RTL  │       │   DuckDB         │
└─────────────────┘       └─────────────────┘
                             │
                             │ reads CSV
                             ▼
                        ┌────────┐
                        │  data/ │
                        └────────┘
```

- **Backend**: FastAPI with embedded DuckDB for SQL analytics. The backend is
  the source of truth for all calculations.
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS (RTL), recharts
  for charts, shadcn/ui components.
- **Data**: CSV file loaded via DuckDB. The full dataset is never committed to git.

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the full layout.

## Documentation

- [Data Dictionary](./docs/data-dictionary.md)
- [Data Quality Report](./docs/data-quality-report.md)
- [Metric Definitions](./docs/metric-definitions.md)
- [API Reference](./docs/api-reference.md)
- [Project Constitution](./specs/constitution.md)

## Development

### Backend Tests

```bash
cd services/api
PYTHONPATH=../../app python -m pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## License

This project is for the Elcamp 1405 competition.
