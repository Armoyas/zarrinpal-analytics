# Data Quality Report

## Dataset Overview

| Property | Value |
|----------|-------|
| File | `data/sample_data.csv` |
| Total rows | 10,000 |
| Total columns | 22 |
| Currency | IRR (Iranian Rial) |
| Encoding | UTF-8 |
| Date range | 2024-01-01 to 2024-12-30 |
| Merchants | 50 |
| Terminals | 3 |
| Categories | 18 |

## Missing-Value Analysis

| Column | Null Count | Null % | Status |
|--------|-----------|--------|--------|
| `session_key` | 0 | 0.00% | ✓ Clean |
| `try_seq` | 0 | 0.00% | ✓ Clean |
| `terminal_key` | 0 | 0.00% | ✓ Clean |
| `merchant_key` | 0 | 0.00% | ✓ Clean |
| `category_id` | 0 | 0.00% | ✓ Clean |
| `category_title` | 0 | 0.00% | ✓ Clean |
| `amount` | 0 | 0.00% | ✓ Clean |
| `adjusted_fee` | 0 | 0.00% | ✓ Clean |
| `session_status` | 0 | 0.00% | ✓ Clean |
| `try_status` | 0 | 0.00% | ✓ Clean |
| `switch_response_code` | 9,402 | 94.02% | ⚠ High null |
| `psp_code` | 9,402 | 94.02% | ⚠ High null |
| `issuer_bank_code` | 9,402 | 94.02% | ⚠ High null |
| `payer_card_key` | 9,400 | 94.00% | ⚠ High null |
| `verify_type` | 0 | 0.00% | ✓ Clean |
| `init_time_ms` | 0 | 0.00% | ✓ Clean |
| `verify_time_ms` | 9,443 | 94.43% | ⚠ High null |
| `created_at` | 0 | 0.00% | ✓ Clean |
| `try_created_at` | 9,401 | 94.01% | ⚠ High null |
| `verified_at` | 9,443 | 94.43% | ⚠ High null |
| `settled_at` | 9,895 | 98.95% | ⚠ Very high null |
| `expire_in` | 0 | 0.00% | ✓ Clean |

## Status Value Distributions

### `session_status`

| Value | Count | Percentage |
|-------|-------|------------|
| `verified` | 4,484 | 44.84% |
| `InBank` | 1,958 | 19.58% |
| `Failed` | 1,497 | 14.97% |
| `Paid` | 1,030 | 10.30% |
| `Reversed` | 510 | 5.10% |
| `NoAttempt` | 521 | 5.21% |

### `try_status`

| Value | Count | Percentage |
|-------|-------|------------|
| `verified` | 4,484 | 44.84% |
| `InBank` | 1,958 | 19.58% |
| `Failed` | 1,497 | 14.97% |
| `Paid` | 1,030 | 10.30% |
| `Reversed` | 510 | 5.10% |
| `NoAttempt` | 521 | 5.21% |

### `verify_type`

| Value | Count | Percentage |
|-------|-------|------------|
| `success` | 4,484 | 44.84% |
| `failed` | 5,516 | 55.16% |

**Observation**: `verify_type = "success"` aligns exactly with `session_status = "verified"`.

### `category_title` (top 5)

| Value | Count |
|-------|-------|
| "خرداد 1370" | 20,833 |
| "خرداد 1372" | 6,250 |
| "خرداد 1371" | 4,167 |
| "خرداد 1373" | 2,941 |
| "خرداد 1369" | 2,083 |

**Observation**: Categories appear to be named by Persian calendar months, not business categories. This may affect category share analytics — merchants may not represent meaningful business categories.

## Numeric Column Statistics

### `amount` (IRR)

| Statistic | Value |
|-----------|-------|
| Min | 61,502 |
| Max | 49,997,680 |
| Mean | 9,753,822.51 |
| Median | 5,000,000 |
| Null count | 0 |
| Zero count | 0 |
| Negative count | 0 |

### `adjusted_fee` (confidentiality-scaled indicator)

| Statistic | Value |
|-----------|-------|
| Min | 2,400 |
| Max | 2,094,075 |
| Mean | 73,528.47 |
| Median | 30,000 |
| Null count | 0 |
| Zero count | 0 |
| Negative count | 0 |

**Note**: `adjusted_fee` is NOT the real ZarinPal fee. It is a confidentiality-
adjusted indicator. See AGENTS.md Principle 4.

## Date Range

| Column | Min | Max |
|--------|-----|-----|
| `init_time_ms` | 2024-01-01 00:00:00 | 2024-12-30 23:59:59 |
| `created_at` | 2024-01-01 00:00:05 | 2024-12-30 23:59:53 |
| `verified_at` | 2024-01-01 00:00:05 | 2024-12-30 23:59:53 |
| `settled_at` | 2024-01-02 00:00:01 | 2024-12-30 23:50:00 |

## Duplicate Analysis

| Check | Result |
|-------|--------|
| Duplicate `session_key` | 0 duplicates |
| Duplicate `session_key` + `try_seq` | 0 duplicates |
| Duplicate full rows | 0 duplicates |

**Observation**: In the sample dataset, each row has a unique `session_key`. There are no
multi-attempt sessions in this sample. However, the schema supports multiple
`try_seq` values per `session_key`.

## Merchant/Terminal Relationships

| Merchant count | 50 |
| Terminal count | 3 |
| Merchants per terminal | All 50 merchants use all 3 terminals |

**Observation**: There is no 1:1 relationship between merchants and terminals.
Each merchant can use any terminal.

## Payers Card Key Analysis

| Check | Result |
|-------|--------|
| Total rows with payer_card_key | 600 |
| Unique payer_card_key values | 600 |
| Max transactions per card | 1 |
| Unique sessions per card | 1 |

**Conclusion**: `payer_card_key` cannot reliably support repeat-behavior analysis.
94% of rows have null card keys, and each card appears at most once.

## Settled At Availability

| Check | Result |
|-------|--------|
| Rows with settled_at | 105 |
| Rows without settled_at | 9,895 |
| Settlement availability | 1.05% |

**Conclusion**: Settlement data is extremely sparse. Settled-based analytics will
have limited coverage. Stage 1 uses all rows for amount metrics; Stage 2+ will
explore settled-amount definitions.

## Verified At Availability

| Check | Result |
|-------|--------|
| Rows with verified_at | 557 |
| Rows without verified_at | 9,443 |
| Verification availability | 5.57% |

**Observation**: `verified_at` is sparse, but `session_status = "verified"` has
44.84% coverage. Use `session_status` for verified counts, not `verified_at`.

## Warnings & Caveats

1. **adjusted_fee confidentiality**: The `adjusted_fee` column is scaled for
   confidentiality and is NOT the actual ZarinPal fee. Any analysis using it
   must include a disclaimer.

2. **settled_at sparsity**: Only 1.05% of rows have settlement data. Settled-based
   metrics should note this limitation prominently.

3. **payer_card_key**: 94% null with max 1 transaction per card. Repeat-behavior
   analysis is not reliable.

4. **Category naming**: Categories appear to be Persian calendar month names,
   not business categories. Category-level analytics may not reflect meaningful
   business segmentation.

5. **No customer_id/product_id**: Customer analysis, product analysis, and
   retention analysis are not supported by this dataset.
