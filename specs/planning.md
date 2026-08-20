# ZarrinPal Analytics Dashboard - Planning & Orchestration

## Architecture: Hexagonal Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  React Components + shadcn/ui + Tailwind CSS           │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────┐
│                    Backend (FastAPI)                    │
│  API Routes + Data Services + Recommendation Engine   │
└─────────────────────────┬───────────────────────────────┘
                          │ SQLAlchemy
┌─────────────────────────▼───────────────────────────────┐
│                 Data Layer (PostgreSQL)                 │
│  Indexed queries, stored procedures for analytics    │
└─────────────────────────┬───────────────────────────────┘
                          │ Pandas/DuckDB
┌─────────────────────────▼───────────────────────────────┐
│                  CSV Data Processing                    │
│  Chunked loading, data cleaning, feature extraction  │
└─────────────────────────────────────────────────────────┘
```

## Planning Decisions

### Data Processing Layer
- **DuckDB**: Primary analytical engine for CSV queries
- **Pandas**: Data cleaning and transformation
- **PostgreSQL**: Persistence for processed data and API responses
- **Chunked loading**: Process 480MB CSV in 10K-row chunks

### Backend API
- **FastAPI**: Auto-generates OpenAPI docs at /docs
- **Pydantic models**: Type-safe request/response validation
- **SQLAlchemy**: ORM for PostgreSQL interactions
- **Caching**: Redis for frequently accessed aggregations

### Frontend
- **Next.js 14**: App router with server/client components
- **shadcn/ui**: Pre-built accessible components
- **Tailwind CSS**: Utility-first styling with RTL support
- **Recharts**: Charts with dark mode support
- **Metabase (embedded)**: Detailed traceability dashboards

### Containerization
- **Docker Compose**: 3 services (api, frontend, postgres)
- **Shared volumes**: Data persistence across restarts
- **Environment variables**: Configuration without code changes

## Implementation Tasks

### Phase 1: Foundation (Steps 1-2)
- [x] 1.1 Create Constitution and Specification
- [x] 1.2 Create Planning document
- [ ] 1.3 Create Tasks checklist
- [ ] 2.1 Initialize FastAPI project structure
- [ ] 2.2 Create Pydantic schemas for data models
- [ ] 2.3 Create database configuration
- [ ] 2.4 Create API router stubs

### Phase 2: Data Pipeline (Steps 3-4)
- [ ] 3.1 CSV ingestion service with chunked loading
- [ ] 3.2 DuckDB processing pipeline
- [ ] 3.3 PostgreSQL schema creation
- [ ] 4.1 Implement merchant analytics engine
- [ ] 4.2 Implement Nowruz seasonal analysis
- [ ] 4.3 Implement peer comparison algorithms

### Phase 3: Frontend (Steps 5-6)
- [ ] 5.1 Initialize Next.js project with shadcn/ui
- [ ] 5.2 Create dashboard layout (RTL, Vazirmatn)
- [ ] 5.3 Implement KPI cards and charts
- [ ] 5.4 Implement merchant selector
- [ ] 6.1 Implement Nowruz impact view
- [ ] 6.2 Implement peer comparison view

### Phase 4: AI + Deployment (Steps 7-8)
- [ ] 7.1 Recommendation engine (fee optimization, checkout improvements)
- [ ] 7.2 Anomaly detection for fraud prevention
- [ ] 8.1 Docker Compose setup
- [ ] 8.2 Create demo script
- [ ] 8.3 Write setup guide

## Traceability Matrix
| Feature | Spec Section | API Endpoint | Test |
|---------|-------------|--------------|------|
| Merchant Summary | 4.2 | GET /api/v1/merchants/{id}/summary | test_merchant_summary.py |
| Nowruz Analysis | 4.2 | GET /api/v1/analytics/nowruz-impact | test_nowruz_analysis.py |