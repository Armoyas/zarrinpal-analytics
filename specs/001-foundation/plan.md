# Stage 1: Core Merchant Overview — Plan

## Objective
Implement a merchant-focused analytical dashboard for ZarinPal transactions, providing payment activity insights with Persian RTL support.

## Approach
Using Schema-First Development: inspect existing reference implementation, extract patterns, apply to current repo.

## Tasks

### Phase 1: Backend (FastAPI + DuckDB)
- [x] Create schema models (Pydantic)
- [x] Create database layer (DuckDB)
- [x] Implement health endpoint
- [x] Implement schema endpoint
- [x] Implement merchant list endpoint
- [x] Implement overview endpoint
- [x] Implement trends endpoint
- [x] Implement merchant detail endpoint

### Phase 2: Frontend (Next.js 14 + Tailwind)
- [x] Create Next.js project structure
- [x] Configure Tailwind CSS with Persian RTL support
- [x] Create MerchantSelector component
- [x] Create DateRangeFilter component
- [x] Create KpiCard component
- [x] Create DailyTrendChart component
- [x] Create AmountTrendChart component
- [x] Create CalculationDetails dialog
- [x] Create DataLimitationWarning component
- [x] Create dashboard page

### Phase 3: Testing
- [x] Create backend tests
- [x] Create test sample data
- [x] Verify all tests pass

### Phase 4: Deployment
- [x] Update Docker Compose
- [x] Update API Dockerfile
- [x] Update frontend Dockerfile

### Phase 5: Documentation
- [x] Create metric definitions
- [x] Create API reference
- [x] Update AGENTS.md
- [x] Update README.md
- [x] Update PROJECT_STRUCTURE.md
- [x] Update PROJECT_HANDOFF.md
- [x] Update data dictionary and quality report

## Key Decisions
1. Sales = all rows (Stage 1). Verified/settled definitions reserved for Stage 2.
2. DuckDB embedded database for analysis queries.
3. Next.js 14 App Router with server/client component separation.
4. Recharts for visualization with Persian (RTL) support.
5. shadcn/ui components styled with Tailwind CSS.

## Architecture
- Backend: FastAPI, DuckDB (embedded), pure-Python analytics
- Frontend: Next.js 14 (App Router), React Server Components + Client Components
- Data: CSV file mounted via Docker Compose
- No database server, no auth, no external dependencies
