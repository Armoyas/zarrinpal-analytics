# Data Dictionary

## Dataset: ZarinPal Transaction Data
**Source file**: `data/sample_data.csv` (gitignored)  
**Sample file**: `data/sample_10_rows.csv` (committed for reference)  
**Currency**: IRR (Iranian Rial)  
**Encoding**: UTF-8  

## Columns

| # | Column Name | Type | Nullable | Description |
|---|------------|------|----------|-------------|
| 1 | `session_key` | VARCHAR | Yes | Unique payment session identifier. May appear in multiple rows if the session has multiple attempts (different `try_seq`). |
| 2 | `try_seq` | BIGINT | No | Attempt sequence number within a session. `try_seq=0` is typically the first attempt. Multiple rows with the same `session_key` but different `try_seq` represent retry attempts. |
| 3 | `terminal_key` | VARCHAR | No | Terminal/public key identifier. There are 3 terminal keys in the dataset. |
| 4 | `merchant_key` | VARCHAR | No | Unique merchant identifier. There are 50 merchants in the dataset. |
| 5 | `category_id` | BIGINT | No | Merchant category ID. Used for merchant grouping. |
| 6 | `category_title` | VARCHAR | No | Human-readable category title (e.g., "خرداد 1370"). |
| 7 | `amount` | BIGINT | No | Payment amount in Iranian Rial (IRR). Range: 61,502 – 49,997,680 IRR. |
| 8 | `adjusted_fee` | BIGINT | No | Confidentiality-adjusted fee indicator (NOT the real ZarinPal fee). Range: 2,400 – 2,094,075. See **Limitations** below. |
| 9 | `session_status` | VARCHAR | No | Payment session status. Values: `verified`, `InBank`, `Failed`, `Paid`, `Reversed`, `NoAttempt`. |
| 10 | `try_status` | VARCHAR | No | Transaction attempt status. Values appear to align with `session_status` but at the attempt level. |
| 11 | `switch_response_code` | BIGINT | Yes | Payment switch response code. NULL for 94.02% of rows — likely only populated for specific payment flows. |
| 12 | `psp_code` | BIGINT | Yes | Payment service provider code. NULL for 94.02% of rows. |
| 13 | `issuer_bank_code` | BIGINT | Yes | Issuer bank identification code. NULL for 94.02% of rows. |
| 14 | `payer_card_key` | VARCHAR | Yes | Payer card hash identifier. NULL for 94% of rows; max 1 transaction per card — **cannot** reliably support repeat-behavior analysis. |
| 15 | `verify_type` | VARCHAR | No | Verification type (`"success"`, `"failed"`). Populated for all rows (0.00% null). |
| 16 | `init_time_ms` | TIMESTAMP | No | Transaction initialization timestamp (milliseconds). Used as the primary transaction time field. |
| 17 | `verify_time_ms` | TIMESTAMP | Yes | Verification timestamp. NULL for 94% of rows — likely only populated for verified sessions. |
| 18 | `created_at` | TIMESTAMP | No | Record creation timestamp. |
| 19 | `try_created_at` | TIMESTAMP | Yes | Attempt creation timestamp. NULL for all rows in the sample dataset. |
| 20 | `verified_at` | TIMESTAMP | Yes | Verification completion timestamp. NULL for 94.43% of rows. |
| 21 | `settled_at` | TIMESTAMP | Yes | Settlement timestamp. NULL for 98.95% of rows — settlement is rarely recorded in the sample. |
| 22 | `expire_in` | INTEGER | No | Expiry time in seconds (or duration). Interpretation: needs confirmation — could be duration in seconds or a timestamp. |

## Column Groups

### Identity Columns
- `session_key`, `try_seq`, `terminal_key`, `merchant_key`

### Categorization
- `category_id`, `category_title`

### Amounts
- `amount` (payment amount in IRR)
- `adjusted_fee` (confidentiality-adjusted indicator — NOT real fee)

### Status
- `session_status` (session-level status)
- `try_status` (attempt-level status)
- `verify_type` (verification type)

### Timestamps
- `init_time_ms` (transaction init — **primary time field**)
- `verify_time_ms` (verification time)
- `created_at` (record creation)
- `try_created_at` (attempt creation)
- `verified_at` (verification completion)
- `settled_at` (settlement)

### Diagnostic
- `switch_response_code` (payment switch code)
- `psp_code` (PSP code)
- `issuer_bank_code` (issuer bank)
- `payer_card_key` (payer card hash)
- `expire_in` (expiry/duration)

## Limitations

1. **`adjusted_fee`** is NOT the actual ZarinPal transaction fee. It is a
   confidentiality-adjusted indicator. Never present it as the real fee.

2. **`payer_card_key`** is NULL for 94% of rows with a maximum of 1 transaction
   per card. It cannot reliably support repeat-behavior analysis.

3. **`settled_at`** is NULL for 98.95% of rows. Settlement-based analytics will
   have very limited data.

4. **No `customer_id` or `product_id` columns** — customer analysis, product
   analysis, and inventory management are not supported.

5. **A row is a payment attempt**, not necessarily a unique transaction.
   `session_key` may have multiple rows with different `try_seq` values.

6. **`init_time_ms`** is the primary transaction timestamp. Other timestamps
   (`verify_time_ms`, `verified_at`, `settled_at`) are sparsely populated.
