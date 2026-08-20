# ZarrinPal Analytics Dashboard Specification

## Goal
Build an analytical dashboard for ZarrinPal merchants with traceable insights, actionable recommendations, and multi-stage reasoning capabilities.

## Scope
- Process 480MB transaction dataset
- Create merchant-specific analytics
- Implement seasonal/trend analysis (e.g., Nowruz impact)
- Provide competitive benchmarking within categories
- Enable report exports (PDF with Persian support)

## Components
1. Data processing pipeline (FastAPI + Pandas)
2. Analytics engine (DuckDB + FastAPI)
3. Frontend dashboard (Next.js + shadcn/ui)
4. Embedding analytics (Metabase)
5. Report generation (WeasyPrint)

## API Endpoints
- POST /api/process-data - Upload and process CSV
- GET /api/merchants/{merchant_id} - Get merchant analytics
- GET /api/benchmark/{merchant_id} - Get category comparison
- POST /api/reports/generate - Generate reports
- GET /api/insights/{merchant_id} - Get AI-generated insights

## Success Criteria
- All insights traceable to raw data
- Mobile-responsive dashboard
- Clear setup instructions
- Working demo video