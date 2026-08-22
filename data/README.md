## Data Limitation Warning

This dashboard is built from ZarinPal payment sample data. Before interpreting
results, please understand these important limitations:

### Adjusted Fee

The `adjusted_fee` column is **NOT** the actual ZarinPal fee. It is a
confidentiality-adjusted indicator. While relative comparisons within the
dataset may be valid, absolute fee values are not. `adjusted_fee` is **not**
displayed as a metric in this dashboard.

### Settled Payments

`settled_at` is approximately **99% null** in the dataset (98.95% missing).
Only about 105 of 10,000 rows have settlement timestamps. Settlement analysis
is severely limited by this data sparsity.

### Payer Card Key

`payer_card_key` is approximately **94% null**. Every non-null card appears in
only one transaction. **Repeat-behavior analysis is not reliable** and is not
implemented.

### Diagnostic Columns

The following columns are ~94% null:

- `switch_response_code`
- `psp_code`
- `issuer_bank_code`
- `payer_card_key`
- `try_created_at`

These may only be populated for verified or successful transactions.

### Date Availability

Only `created_at` is always present (100% non-null). All other date columns
(`try_created_at`, `verified_at`, `settled_at`) have high null rates. Daily
trends are based on `created_at` only.

### Counting Unit Distinction

- **Row:** A single CSV record (payment attempt).
- **Session:** A unique `session_key` (may contain multiple attempt rows).
- **Verified session:** A row where `session_status = 'Verified'`.
- **Settled session:** A row where `settled_at` is non-null.

Success rate is calculated as verified sessions relative to total attempt rows,
not as attempt-level success.

### Data Freshness

This dashboard uses static CSV data. There is no real-time processing or
live data feed. Refresh the dataset file to update the analysis.
