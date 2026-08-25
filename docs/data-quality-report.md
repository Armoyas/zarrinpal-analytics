# Data Quality Report

## Summary

| Metric | Value |
|--------|-------|
| **Total rows** | 10,000 |
| **Total columns** | 22 |
| **Currency** | IRR (Iranian rial) |
| **Unique session_keys** | 10,000 (all unique) |
| **Duplicate sessions** | 0 |
| **Unique merchants** | 50 |
| **Unique terminals** | 3 |
| **Unique payer_card_keys** | 598 (with non-null) |
| **Date range** | 2024-01-01 to 2024-12-30 |

## Missing Values

| Column | Null Count | Null % |
|--------|-----------|--------|
| `session_key` | 0 | 0.00% |
| `try_seq` | 0 | 0.00% |
| `terminal_key` | 0 | 0.00% |
| `merchant_key` | 0 | 0.00% |
| `category_id` | 0 | 0.00% |
| `category_title` | 0 | 0.00% |
| `amount` | 0 | 0.00% |
| `adjusted_fee` | 0 | 0.00% |
| `session_status` | 0 | 0.00% |
| `try_status` | 0 | 0.00% |
| `switch_response_code` | 9,402 | 94.02% |
| `psp_code` | 9,402 | 94.02% |
| `issuer_bank_code` | 9,402 | 94.02% |
| `payer_card_key` | 9,402 | 94.02% |
| `verify_type` | 0 | 0.00% |
| `init_time_ms` | 0 | 0.00% |
| `verify_time_ms` | 9,443 | 94.43% |
| `created_at` | 0 | 0.00% |
| `try_created_at` | 9,402 | 94.02% |
| `verified_at` | 9,443 | 94.43% |
| `settled_at` | 9,895 | 98.95% |
| `expire_in` | 0 | 0.00% |

## session_status — Unique Values

| Value | Count |
|-------|-------|
| Verified | 4,484 |
| InBank | 1,958 |
| Failed | 1,497 |
| Paid | 1,030 |
| NoAttempt | 521 |
| Reversed | 510 |

## try_status — Unique Values

| Value | Count |
|-------|-------|
| Verified | 4,521 |
| InBank | 1,964 |
| Failed | 1,527 |
| Paid | 977 |
| NoAttempt | 521 |
| Reversed | 490 |

## Date Ranges

| Column | Min | Max | Non-null |
|--------|-----|-----|----------|
| `created_at` | 2024-01-01 00:31:59 | 2024-12-30 23:47:42 | 10,000 |
| `try_created_at` | 2024-01-01 22:10:59 | 2024-12-30 20:15:15 | 598 |
| `verified_at` | 2024-01-01 22:30:59 | 2024-12-30 20:39:15 | 557 |
| `settled_at` | 2024-01-07 18:05:38 | 2024-08-30 11:56:54 | 105 |

## Amount Statistics

| Stat | Value |
|------|-------|
| Count | 10,000 |
| Mean | 24,893,210 IRR |
| Std | 14,385,170 IRR |
| Min | 61,502 IRR |
| 25% | 12,460,900 IRR |
| Median (50%) | 24,900,170 IRR |
| 75% | 37,397,000 IRR |
| Max | 49,997,680 IRR |
| Nulls | 0 |
| Zeros | 0 |
| Negatives | 0 |

## Adjusted Fee Statistics

| Stat | Value |
|------|-------|
| Count | 10,000 |
| Mean | 958,854 IRR |
| Std | 557,567 IRR |
| Min | 2,400 IRR |
| 25% | 479,016 IRR |
| Median (50%) | 953,350 IRR |
| 75% | 1,439,353 IRR |
| Max | 2,094,075 IRR |
| Nulls | 0 |
| Zeros | 0 |
| Negatives | 0 |

**Note:** `adjusted_fee` is a confidentiality-adjusted indicator, NOT the real ZarinPal fee.

## Duplicate session_key Values

| Metric | Value |
|--------|-------|
| Duplicate session_keys | 0 |
| Sessions with multiple rows | 0 |
| Sessions with single try_seq | 10,000 |

In this sample, every `session_key` is unique. This means each row is a unique attempt with no retry attempts within sessions.

## session_key vs try_seq Relationship

| Metric | Value |
|--------|-------|
| Sessions with single try_seq | 10,000 |
| Sessions with multiple try_seq | 0 |
| Maximum try_seq range | 9 |
| try_seq unique values | 23 (min: 0, max: 9) |

## Merchant & Terminal Relationships

| Metric | Value |
|--------|-------|
| Unique merchants | 50 |
| Unique terminals | 3 |
| Merchants with more than 1 terminal | 50 |

All 50 merchants are associated with all 3 terminals, indicating a many-to-many relationship between merchants and terminals.

## payer_card_key Repeat-Behavior Analysis

| Metric | Value |
|--------|-------|
| Unique payer_card_keys (non-null) | 598 |
| Cards with >1 transaction | 0 |
| Max transactions per card | 1 |

**Finding:** `payer_card_key` is extremely sparse (94.02% null) and every non-null card appears only once. **Repeat-behavior analysis using `payer_card_key` is NOT reliable.**

## Timestamp Availability

| Column | Non-null Count | % Available |
|--------|---------------|-------------|
| `created_at` | 10,000 | 100% |
| `try_created_at` | 598 | 5.98% |
| `verified_at` | 557 | 5.57% |
| `settled_at` | 105 | 1.05% |

## Unresolved Data Ambiguities

1. **`expire_in` data type:** Appears as string datetime but should be confirmed as duration or timestamp.
2. **`switch_response_code`, `psp_code`, `issuer_bank_code` missing pattern:** 94.02% null across three columns simultaneously — may indicate these are only populated for successful/verified transactions.
3. **`payer_card_key` sparsity:** 94% missing — unclear whether this is a data collection issue or intentional filtering.
4. **`try_created_at` vs `created_at` discrepancy:** Only 598 of 10,000 rows have `try_created_at` — semantic distinction between the two timestamps needs clarification.
5. **`try_seq` max:** Range 0-9, but sample data shows values up to 22 in reference dataset — sample is a subset.