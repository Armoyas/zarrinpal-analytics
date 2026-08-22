# ZarinPal Analytical Dashboard — Technical Specification

**Stage:** 0 — Foundation
**Status:** In Progress
**Last Updated:** 2026-08-22

## Objective

Establish the project foundation for a modern Persian RTL analytical dashboard for ZarinPal merchants. This stage covers:

1. Repository scaffolding with SDD structure
2. Dataset inspection and schema documentation
3. Data validation scripts
4. Docker Compose foundation
5. Minimal backend health endpoint
6. Minimal frontend startup page
7. Project constitution and SDD specs

## Out of Scope (Stage 0)

- Dashboard analytics and visualizations
- Advanced AI insights
- Merchant performance metrics computation
- PostgreSQL, SQLAlchemy, Metabase, or authentication
- Full dataset commit (only sample data allowed)

## Deliverables

| # | File | Purpose |
|---|------|---------|
| 1 | `specs/constitution.md` | Project constitution with 9 core principles |
| 2 | `specs/000-foundation/spec.md` | This spec |
| 3 | `specs/000-foundation/plan.md` | Implementation plan |
| 4 | `specs/000-foundation/tasks.md` | Task checklist |
| 5 | `docs/data-dictionary.md` | Column-level documentation |
| 6 | `docs/data-quality-report.md` | Data quality findings |
| 7 | `docs/PROJECT_HANDOFF.md` | Stage handoff summary |
| 8 | `scripts/inspect_schema.py` | Reproducible schema inspection |
| 9 | `scripts/validate_dataset.py` | Data validation script |
| 10 | `services/api/app/main.py` | Backend with /health endpoint |
| 11 | `services/api/requirements.txt` | Backend dependencies |
| 12 | `services/api/Dockerfile` | Backend container |
| 13 | `frontend/src/App.tsx` | Minimal RTL startup page |
| 14 | `docker-compose.yml` | Docker Compose foundation |
| 15 | `.env.example` | Environment template |
| 16 | `.gitignore` | Safe Git rules for data |
| 17 | `AGENTS.md` | AI coding agent reference |
| 18 | `README.md` | Project README |
| 19 | `PROJECT_STRUCTURE.md` | Project tree documentation |
| 20 | `data/README.md` | Data directory documentation |

## Acceptance Criteria

- [x] Repository initialized with Git
- [x] SDD directory structure created (`specs/`, `docs/`, `scripts/`, `services/`, `frontend/`, `tests/`)
- [x] Dataset inspected (10,000 rows, 22 columns)
- [x] Data dictionary created
- [x] Data quality report created
- [x] Schema inspection script is reproducible and run
- [x] Data validation script created and run
- [x] `.gitignore` prevents full dataset commit
- [x] `.env.example` with all required variables
- [x] Docker Compose config passes validation (`docker compose config`)
- [x] Backend `/health` endpoint returns `{"status": "healthy"}`
- [x] Frontend startup page renders Persian RTL
- [x] Constitution with 9 core principles
- [x] Stage 0 spec, plan, and tasks documented
- [x] `PROJECT_HANDOFF.md` created
- [x] `AGENTS.md` created for AI coding agents
- [x] Git commit: "chore: initialize SDD foundation and dataset inspection"
