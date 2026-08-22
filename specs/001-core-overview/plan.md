# Implementation Plan — Stage 1 Core Merchant Overview

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Step 1 | 2h | Update constitution + create Stage 1 specs |
| Step 2 | 3h | Backend: models, database layer, endpoints |
| Step 3 | 4h | Frontend: Next.js setup, Tailwind, shadcn/ui |
| Step 4 | 3h | Frontend: dashboard components + charts |
| Step 5 | 2h | Backend tests + frontend tests |
| Step 6 | 2h | Run all validations |
| Step 7 | 1h | Update all documentation |
| Step 8 | 0.5h | Git commit |

## Steps

### 1. Project Planning
- Update `specs/constitution.md` — add Stage 1 scope line
- Create `specs/001-core-overview/spec.md` (this stage's spec)
- Create `specs/001-core-overview/plan.md` (this file)
- Create `specs/001-core-overview/tasks.md` (task checklist)

### 2. Backend Implementation
- Create `services/api/app/models.py` — Pydantic response models with MetricTraceability
- Create `services/api/app/database.py` — DuckDB connection manager with typed query helpers
- Rewrite `services/api/app/main.py` — all 5 endpoints using DuckDB
- Update `services/api/requirements.txt` — add pydantic
- Update `services/api/Dockerfile` if needed

### 3. Frontend Setup
- Migrate `frontend/` from static HTML to Next.js 14 + TypeScript
- Install Tailwind CSS v3, shadcn/ui components
- Configure Vazirmatn font (Persian, RTL)
- Set up tsconfig.json, next.config.js, package.json

### 4. Frontend Dashboard
- Merchant selector dropdown (loads from /api/v1/merchants)
- Date-range filter (start + end date pickers)
- KPI cards (5 cards: attempts, sessions, verified, failed, success rate)
- Daily activity chart (attempts + sessions per day)
- Amount trend chart (daily total amount)
- Calculation-details drawer (metric traceability metadata)
- Data limitation warning banner
- Loading / empty / error states

### 5. Tests
- `tests/backend/test_api.py` — pytest with 10+ test cases:
  - Merchant filtering logic
  - Date filtering logic
  - Amount aggregation (SUM, AVG)
  - Row count (COUNT)
  - Unique session count (COUNT DISTINCT)
  - Status logic (Verified, Failed counts)
  - Empty results (merchant with no data in date range)
  - Invalid date range (start > end)
  - Division by zero (success rate when 0 attempts)
  - Traceability metadata presence
- Frontend tests via Jest + React Testing Library (if feasible in scope)

### 6. Validation
- `pytest tests/ -v`
- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `docker compose config`

### 7. Documentation
- `docs/metric-definitions.md` — all implemented metrics with formulas and limitations
- `docs/api-reference.md` — API endpoint documentation
- Update `docs/PROJECT_HANDOFF.md` — Stage 1 handoff summary
- Update `docs/data-dictionary.md` — add any Stage 0→1 notes
- Update `AGENTS.md` — add Stage 1 commands
- Update `README.md` — update stage status and quick-start
- Update `PROJECT_STRUCTURE.md` — add new files

### 8. Git Commit
- Commit message: `feat: add core merchant overview analytics`
- Verify all files are tracked
- Push to origin main