# Project Constitution

## Purpose

This document defines the principles and constraints that govern the ZarinPal
Analytics Dashboard project. All contributors (human and AI) must follow these
principles.

## Principles

### 1. Never Invent Dataset Columns
Do not create, rename, or synthesize columns that do not exist in the dataset.
Every metric, filter, and visualization must be based on real dataset columns.
If a column is missing, document the gap — do not fabricate a replacement.

### 2. Document Every Metric Formula
Every metric must have a documented formula including:
- `metric_id` (stable, unique identifier)
- `definition` (human-readable description)
- `formula` (LaTeX or pseudo-SQL)
- `source_columns` (list of dataset columns used)
- `counting_unit` (rows, sessions, verified sessions, settled sessions)
- `filters` (applied filters)
- `limitations` (known constraints)

### 3. Distinguish Rows, Attempts, Sessions, Verified, and Settled
These are different counting units:
- **Rows**: Raw dataset records (one per payment attempt)
- **Attempts**: Same as rows — each row is one payment attempt
- **Sessions**: Unique `session_key` values (may have multiple attempts)
- **Verified sessions**: `session_status = 'verified'`
- **Settled sessions**: `settled_at IS NOT NULL`

Never use "transaction count" without explicit labeling of the counting unit.
If a different counting unit is needed, expose it with a clear label.

### 4. Never Present adjusted_fee as the Real ZarinPal Fee
The `adjusted_fee` column is a confidentiality-adjusted indicator, NOT the actual
ZarinPal transaction fee. Any visualization or metric using `adjusted_fee` must:
- Carry an explicit disclaimer
- Not state or imply it is the real fee
- Be clearly labeled as "adjusted fee indicator (confidentiality-scaled)"

### 5. Exclude Unsupported Analytics
Do not implement features that the dataset does not support:
- Customer analysis (no `customer_id` column)
- Product analysis (no `product_id` column)
- Inventory management (no inventory columns)
- Retention analysis (no reliable customer tracking)
- Cohort analysis (no reliable user identification)

Document the gap and skip the feature.

### 6. Never Commit the Full Dataset
- The full dataset (`sample_data.csv`) is excluded from git via `.gitignore`.
- Only a 10-row sample (`sample_10_rows.csv`) is committed for reference.
- Any full dataset file matching `*.csv` in `data/` is gitignored, except
  explicitly named sample files.

### 7. Use Deterministic Backend Calculations as Source of Truth
- All metric calculations are performed in the backend (DuckDB).
- The frontend never performs analytical calculations.
- The frontend only displays what the backend returns.
- This ensures consistent, auditable results across all views.

### 8. Support Persian RTL and Mobile Layouts
- The dashboard must render in Persian (fa-IR) with right-to-left layout.
- Use Vazirmatn font for Persian typography.
- The dashboard must be responsive on mobile devices.
- All numeric and date values must be formatted using Persian locale.

### 9. Update Specifications and Documentation After Every Stage
After completing each stage:
1. Update the stage spec, plan, and tasks.
2. Update metric definitions.
3. Update the API reference.
4. Update AGENTS.md, README.md, PROJECT_STRUCTURE.md.
5. Update PROJECT_HANDOFF.md with stage results.

## Governance

- **Stage 0** (Foundation & Inspection): Complete
- **Stage 1** (Core Merchant Overview): Complete
- **Stage 2** (Sales Share & Time-Based): In Progress
- **Stage 3** (Adjusted Fee & High-Value): Planned
- **Stage 4** (AI Recommendations): Planned

## SDD Workflow

1. Write spec → 2. Write plan → 3. Write tasks → 4. Implement → 5. Test →
6. Update docs → 7. Commit → 8. Update handoff.

## Commit Message Convention

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — project setup, tooling, dependencies
- `docs:` — documentation update
- `test:` — test addition or update
- `refactor:` — code restructuring (no behavior change)

## Branches

- `main` — production-ready stages, merged after review
- `stage-N-*` — work in progress for stage N
