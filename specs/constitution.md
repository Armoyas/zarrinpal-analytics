# Project Constitution

## Core Principles

1. **Never invent dataset columns.** Every analytical metric must use columns confirmed by the data dictionary and schema inspection. Do not add, rename, or infer columns that do not exist in the source CSV.

2. **Document every metric formula.** Every metric exposed by the API or shown in the frontend must have an explicit definition in `docs/metric-definitions.md`, including: `metric_id`, `definition`, `formula`, `source_columns`, `counting_unit`, `filters`, and `limitations`.

3. **Distinguish rows, attempts, sessions, verified payments, and settled payments.**
   - **Row** = one row in the CSV
   - **Attempt** = one row (each row is a payment attempt, identified by `try_seq`)
   - **Session** = distinct `session_key` value (one session may have multiple attempts)
   - **Verified payment** = `session_status = 'Verified'` (NOT `verified_at`)
   - **Settled payment** = `settled_at IS NOT NULL` (available for only 1.05% of rows)
   Never use "transaction count" unless the counting unit is clearly defined.

4. **Never present `adjusted_fee` as the real ZarinPal fee.** The `adjusted_fee` column is a confidentiality-adjusted indicator, not the actual fee. Always label it clearly. Stage 3 will analyze this as a scaled indicator only.

5. **Exclude unsupported analytics.** No customer analytics (no `customer_id`), no product analytics (no `product_id`), no inventory analytics. No retention analysis (`payer_card_key` is 94% null). No email/SMS analytics.

6. **Never commit the full dataset.** The raw CSV (`sample_data.csv`) is excluded via `.gitignore`. Only small sample subsets (≤10 rows) may be committed for reference.

7. **Use deterministic backend calculations as the source of truth.** All metrics are computed by DuckDB queries in the backend. The frontend fetches pre-computed results — never performs raw data aggregation in the browser.

8. **Support Persian RTL and mobile layouts.** All frontend pages must use `dir="rtl"`, the Vazirmatn font, and responsive Tailwind CSS that works on mobile.

9. **Update specifications and documentation after every stage.** Each stage must update `specs/<stage>/`, `docs/`, `AGENTS.md`, `README.md`, `PROJECT_STRUCTURE.md`, and `docs/PROJECT_HANDOFF.md` before completion.

## Development Workflow

- Use **Schema-Driven Development (SDD)**: specs first, then implementation, then validation.
- Each stage has: `specs/<NNN>-<name>/spec.md`, `plan.md`, `tasks.md`.
- Stages proceed sequentially: 0 → 1 → 2 → 3 → 4 → 5.
- Each stage requires: backend tests, frontend lint, frontend typecheck, frontend build, docker compose config validation.

## Sales Definitions

| Definition | Formula | Counting Unit | Stage |
|-----------|---------|---------------|-------|
| `total_amount` | `SUM(amount)` over all rows | rows | Stage 1 |
| `successful_amount` | `SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')` | rows | Stage 2 |
| `settled_amount` | `SUM(amount) WHERE settled_at IS NOT NULL` | rows | Not used (98.95% null) |

## Stage Progress

| Stage | Description | Status |
|-------|-------------|--------|
| 0 | Project foundation and dataset inspection | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Sales Share and Time-Based Analytics | ✅ Complete |
| 3 | Adjusted-Fee Analysis | ✅ Complete |
| 4 | High-Value Payment Analysis | ✅ Complete |
| 5 | AI Recommendations | ✅ Complete |
| 5/6 | Insights & UX Polish (RTL, mobile, demo prep) | ✅ Complete |
