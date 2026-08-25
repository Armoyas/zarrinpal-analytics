# Specifications Index

This directory contains Phase-driven specifications for the ZarrinPal Analytics project.
Each phase is a self-contained directory with a `spec.md` file.

## Phases

| Phase | Directory | Description | Status |
|-------|----------|-------------|--------|
| Phase 0 | `phase-0-schema-foundation/` | Dataset schema inspection and foundation | ✅ Complete |
| Phase 1 | `phase-1-api-foundation/` | FastAPI backend with DuckDB analytics API | ✅ Complete |
| Phase 2 | `phase-2-dashboard-ui/` | Next.js Persian RTL dashboard UI | ✅ Complete |

## SDD Format

Each spec follows the Spec-Driven Development (SDD) convention:
1. Overview & Goals
2. Data Model / Architecture
3. API Endpoints / Component Definitions
4. Business Rules & Constraints
5. Test Plan
6. Excluded Features

## Adding a New Phase

1. Create `specs/phase-N-<name>/spec.md`
2. Add an entry to the table above
3. Reference the spec from `docs/PROJECT_HANDOFF.md`
