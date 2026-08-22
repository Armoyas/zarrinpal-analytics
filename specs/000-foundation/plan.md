# Implementation Plan — Stage 0 Foundation

## Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Day 1 | 2h | Repo init, SDD structure, constitution |
| Day 1 | 1h | Dataset inspection + data quality scripts |
| Day 1 | 1h | Backend health endpoint + Dockerfile |
| Day 1 | 1h | Frontend startup page (Persian RTL) |
| Day 1 | 0.5h | Docker Compose foundation |
| Day 1 | 0.5h | Documentation (AGENTS.md, README, PROJECT_STRUCTURE) |
| Day 1 | 0.5h | Git commit + validation |

## Steps

1. **Initialize repository**
   - `git init`
   - Create `.gitignore` with data-commit rules
   - Create `.env.example`

2. **Create SDD structure**
   - `specs/constitution.md`
   - `specs/000-foundation/spec.md` (this file)
   - `specs/000-foundation/plan.md` (this file)
   - `specs/000-foundation/tasks.md`

3. **Inspect dataset**
   - Run `python scripts/inspect_schema.py --csv data/sample_data.csv`
   - Generate data dictionary and schema summary
   - Record all null counts, unique values, date ranges

4. **Create data validation script**
   - Run `python scripts/validate_dataset.py --csv data/sample_data.csv`
   - Confirm all checks pass

5. **Backend foundation**
   - Create `services/api/app/main.py` with `/health` endpoint
   - Create `services/api/requirements.txt`
   - Create `services/api/Dockerfile`
   - Create `tests/backend/` placeholder

6. **Frontend foundation**
   - Create `frontend/src/App.tsx` (Persian RTL startup page)
   - Create `frontend/src/index.css`

7. **Docker Compose**
   - Create `docker-compose.yml` with api + frontend services
   - Validate with `docker compose config`

8. **Documentation**
   - Create `AGENTS.md`
   - Create `README.md`
   - Create `PROJECT_STRUCTURE.md`
   - Create `data/README.md`
   - Create `docs/PROJECT_HANDOFF.md`

9. **Git commit**
   - Commit all files
   - Message: "chore: initialize SDD foundation and dataset inspection"

## Risks

| Risk | Mitigation |
|------|-----------|
| Dataset too large to inspect in pandas | Use chunked reading; sample subset |
| Missing columns in sample data | Verify against 22-column schema |
| Persian encoding in CSV | Use UTF-8 encoding explicitly |
| Docker build issues | Test with `docker compose config` first |
