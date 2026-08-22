# Data Dictionary

**Source file:** `sample_data.csv` (sample subset of full dataset, max 100 rows)
**Rows (sample):** see `docs/data-quality-report.md` for full inspection
**Columns:** 22
**Currency:** Iranian rial (IRR)
**Timezone:** Asia/Tehran (assume unless `created_at` timestamp includes offset)
**Adjusted-fee note:** The `adjusted_fee` column is confidentially-scaled and must NOT be presented as the real ZarinPal fee. Relative comparisons within the dataset are valid; absolute fee values are not.

---

## Columns

### `session_key`
- **Source:** Dataset column
- **Type:** string (UUID-like)
- **Nulls:** 0 (0.00%)
- **Unique values:** See full dataset report
- **Description:** Unique identifier for a payment session. A session may contain one or more attempts (rows) distinguished by `try_seq`.
- **Role:** Session identifier

### `try_seq`
- **Source:** Dataset column
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Description:** Attempt sequence number within a session. `try_seq = 0` or `try_seq = 1` typically indicates the first attempt. Higher values indicate retry attempts for the same session.
- **Role:** Attempt identifier (combined with session_key to identify a unique attempt)

### `terminal_key`
- **Source:** Dataset column
- **Type:** string (e.g., `T5000`, `T5001`)
- **Nulls:** 0 (0.00%)
- **Description:** Terminal identifier used for the payment attempt.
- **Role:** Payment terminal

### `merchant_key`
- **Source:** Dataset column
- **Type:** string (e.g., `M1000`, `M1001`)
- **Nulls:** 0 (0.00%)
- **Description:** Unique identifier for the merchant. Every merchant has multiple terminal keys.
- **Role:** Merchant identifier

### `category_id`
- **Source:** Dataset column
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Description:** Numeric category code for the merchant's business category.
- **Role:** Merchant category code

### `category_title`
- **Source:** Dataset column
- **Type:** string (Persian)
- **Nulls:** 0 (0.00%)
- **Description:** Persian text label for the merchant's business category (e.g., `آموزش و آموزشگاه`, `خرده‌فروشی آنلاین`).
- **Role:** Human-readable category

### `amount`
- **Source:** Dataset column
- **Type:** integer
- **Unit:** Iranian rial (IRR)
- **Nulls:** 0 (0.00%)
- **Description:** Transaction amount in IRR.
- **Role:** Payment amount

### `adjusted_fee`
- **Source:** Dataset column
- **Type:** integer
- **Unit:** Iranian rial (IRR) — but NOT the real ZarinPal fee
- **Nulls:** 0 (0.00%)
- **Description:** Confidentiality-adjusted fee indicator. This column is scaled/obfuscated to preserve ZarinPal's fee structure confidentiality. It is NOT the actual ZarinPal fee. Relative comparisons within a dataset are valid; absolute values are NOT.
- **Role:** Fee proxy indicator (with documented limitations)
- **Formula:** N/A (raw column value, not a computed metric)

### `session_status`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Values:** `Verified`, `InBank`, `Failed`, `Paid`, `NoAttempt`, `Reversed`
- **Description:** Aggregated status of the payment session (best attempt outcome).
- **Role:** Session outcome

### `try_status`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Values:** `Verified`, `InBank`, `Failed`, `Paid`, `NoAttempt`, `Reversed`
- **Description:** Status of the individual payment attempt.
- **Role:** Attempt outcome

### `switch_response_code`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** ~94% (high missing rate)
- **Description:** Response code from the payment switch (card network). Often missing when transaction does not reach the switch.
- **Role:** Diagnostic field

### `psp_code`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** ~94% (high missing rate)
- **Description:** PSP (Payment Service Provider) response code.
- **Role:** Diagnostic field

### `issuer_bank_code`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** ~94% (high missing rate)
- **Description:** Code of the issuer bank.
- **Role:** Diagnostic field

### `payer_card_key`
- **Source:** Dataset column
- **Type:** string (masked card identifier)
- **Nulls:** ~94% (high missing rate)
- **Description:** Masked payer card key. Sparse data means repeat-behavior analysis is NOT reliable.
- **Role:** Payer identifier (with documented limitation)

### `verify_type`
- **Source:** Dataset column
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Values:** `Manual`, `Automated`
- **Description:** Whether verification was manual or automated.
- **Role:** Verification type

### `init_time_ms`
- **Source:** Dataset column
- **Type:** integer
- **Unit:** milliseconds
- **Nulls:** 0 (0.00%)
- **Description:** Time taken for initialization phase of the payment attempt.
- **Role:** Performance metric

### `verify_time_ms`
- **Source:** Dataset column
- **Type:** float
- **Unit:** milliseconds
- **Nulls:** ~94% (high missing rate)
- **Description:** Time taken for verification phase. Missing when verification was not performed.
- **Role:** Performance metric

### `created_at`
- **Source:** Dataset column
- **Type:** datetime (string format: `YYYY-MM-DD HH:MM:SS`)
- **Nulls:** 0 (0.00%)
- **Description:** Timestamp when the payment attempt was created.
- **Role:** Primary timestamp, always available

### `try_created_at`
- **Source:** Dataset column
- **Type:** datetime (string format: `YYYY-MM-DD HH:MM:SS`)
- **Nulls:** ~94% (high missing rate)
- **Description:** Timestamp when the try/attempt was created.
- **Role:** Attempt timestamp

### `verified_at`
- **Source:** Dataset column
- **Type:** datetime (string format: `YYYY-MM-DD HH:MM:SS`)
- **Nulls:** ~94% (high missing rate)
- **Description:** Timestamp when the payment was verified.
- **Role:** Verification timestamp

### `settled_at`
- **Source:** Dataset column
- **Type:** datetime (string format: `YYYY-MM-DD HH:MM:SS`)
- **Nulls:** ~99% (very high missing rate)
- **Description:** Timestamp when the payment was settled. Very sparse.
- **Role:** Settlement timestamp

### `expire_in`
- **Source:** Dataset column
- **Type:** string (datetime format)
- **Nulls:** 0 (0.00%)
- **Description:** Expiration timestamp for the payment session.
- **Role:** Session expiry

---

## Entity Relationships

| Entity | Identifier | Description |
|--------|-----------|-------------|
| **Row (attempt)** | `session_key` + `try_seq` | A single payment attempt |
| **Session** | `session_key` | A payment session, potentially with multiple attempts |
| **Merchant** | `merchant_key` | A ZarinPal merchant; has multiple terminals |
| **Terminal** | `terminal_key` | A payment terminal; belongs to a merchant |

## Derived Metric Formulas

| Metric | Formula | Source Columns |
|--------|---------|---------------|
| Verified payment count | `COUNT WHERE session_status = 'Verified'` | `session_status` |
| Verified session share | `COUNT(Verified) / COUNT(DISTINCT session_key)` | `session_status`, `session_key` |
| Success rate | `COUNT(Verified) / COUNT(*)` | `session_status` |
| Merchant transaction volume | `SUM(amount) GROUP BY merchant_key` | `amount`, `merchant_key` |
| Merchant sales share | `SUM(amount) for merchant / SUM(amount)` | `amount`, `merchant_key` |
| High-value threshold | `amount > 75th percentile` | `amount` |
| Avg adjusted_fee ratio | `SUM(adjusted_fee) / SUM(amount)` | `adjusted_fee`, `amount` |