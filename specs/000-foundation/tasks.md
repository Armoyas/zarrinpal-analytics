# Stage 0 Foundation — Task Checklist

## Repository Setup

- [x] Initialize Git repository
- [x] Create `.gitignore` with safe rules
- [x] Create `.env.example`
- [x] Set branch to `main`

## SDD Structure

- [x] Create `specs/constitution.md`
- [x] Create `specs/000-foundation/spec.md`
- [x] Create `specs/000-foundation/plan.md`
- [x] Create `specs/000-foundation/tasks.md` (this file)

## Dataset Inspection

- [x] Inspect dataset (10,000 rows, 22 columns)
- [x] Create `scripts/inspect_schema.py`
- [x] Create `scripts/validate_dataset.py`
- [x] Run schema inspection and generate findings
- [x] Run data validation
- [x] Create `docs/data-dictionary.md`
- [x] Create `docs/data-quality-report.md`

## Backend

- [x] Create `services/api/app/main.py` (health endpoint)
- [x] Create `services/api/requirements.txt`
- [x] Create `services/api/Dockerfile`
- [x] Create `tests/backend/test_placeholder.py`

## Frontend

- [x] Create `frontend/src/App.tsx` (Persian RTL startup page)
- [x] Create `frontend/src/index.css`

## Docker

- [x] Create `docker-compose.yml`
- [x] Validate with `docker compose config`

## Documentation

- [x] Create `AGENTS.md`
- [x] Create `README.md`
- [x] Create `PROJECT_STRUCTURE.md`
- [x] Create `data/README.md`
- [x] Create `docs/PROJECT_HANDOFF.md`

## Git

- [x] Stage all files
- [x] Verify `.gitignore` excludes full dataset
- [x] Create sample data subset (max 100 rows)
- [ ] Commit: "chore: initialize SDD foundation and dataset inspection"
