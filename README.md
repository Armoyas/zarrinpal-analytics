# ZarrinPal Analytics Dashboard

Merchant analytics dashboard for ZarrinPal payment gateway transaction data.

## Quick Start
```bash
docker-compose up --build
# API: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

## Tech Stack
- Data: Pandas, DuckDB (480MB CSV processing)
- Backend: FastAPI (Python)
- Frontend: Next.js 14 + shadcn/ui + Tailwind CSS
- Database: PostgreSQL
- Analytics: Recharts for visualizations
