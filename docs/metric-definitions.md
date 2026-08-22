# Metric Definitions

**Stage:** 1 — Core Merchant Overview  
**Last Updated:** 2026-08-22

All metrics are computed in the backend (DuckDB) and returned with full
traceability metadata. The frontend never computes metrics.

---

## Metric List

### 1. Payment-Attempt Row Count

| Property | Value |
|---|---|
| **metric_id** | `payment_attempts` |
| **Definition** | Total number of payment attempt rows in the dataset (after filters) |
| **Formula** | `COUNT(*)` |
| **Source columns** | `session_key`, `try_seq`, `created_at` |
| **Counting unit** | `row` |
| **Persian label** | تعداد تلاش‌های پرداخت |

**Limitations:** None. Counts all rows matching the filter criteria.

---

### 2. Unique Session Count

| Property | Value |
|---|---|
| **metric_id** | `unique_sessions` |
| **Definition** | Number of distinct `session_key` values (each session may contain multiple attempt rows) |
| **Formula** | `COUNT(DISTINCT session_key)` |
| **Source columns** | `session_key` |
| **Counting unit** | `session` |
| **Persian label** | سشن‌های منحصر به فرد |

**Limitations:** In the sample dataset, every `session_key` is unique (one
attempt per session). In the full dataset, sessions may contain multiple
attempts distinguished by `try_seq`.

---

### 3. Verified Count

| Property | Value |
|---|---|
| **metric_id** | `verified_count` |
| **Definition** | Number of rows where `session_status = 'Verified'` |
| **Formula** | `COUNT(*) WHERE session_status = 'Verified'` |
| **Source columns** | `session_status` |
| **Counting unit** | `verified_session` |
| **Persian label** | پرداخت‌های تأیید شده |

**Limitations:** Counts rows, not distinct sessions. If a session has multiple
attempts but only one is verified, this may overcount. In the current dataset
schema, `session_status` represents the best outcome for the session, so each
session appears once.

---

### 4. Settled Count

| Property | Value |
|---|---|
| **metric_id** | `settled_count` |
| **Definition** | Number of rows where `settled_at` is non-null |
| **Formula** | `COUNT(*) WHERE settled_at IS NOT NULL` |
| **Source columns** | `settled_at` |
| **Counting unit** | `settled_session` |
| **Persian label** | پرداخت‌های تسویه شده |

**Limitations:** `settled_at` is approximately 99% null in the dataset
(98.95% missing). Only 105 of 10,000 rows have settlement timestamps.
Settlement analytics are severely limited by data sparsity.

---

### 5. Failed Count

| Property | Value |
|---|---|
| **metric_id** | `failed_count` |
| **Definition** | Number of rows where `session_status = 'Failed'` |
| **Formula** | `COUNT(*) WHERE session_status = 'Failed'` |
| **Source columns** | `session_status` |
| **Counting unit** | `row` |
| **Persian label** | شکست‌های پرداخت |

**Limitations:** Counts raw rows with `session_status = 'Failed'`. Other
non-verified statuses (`InBank`, `NoAttempt`, `Reversed`, `Paid`) are NOT
included in "failed" count.

---

### 6. Success Rate

| Property | Value |
|---|---|
| **metric_id** | `success_rate` |
| **Definition** | Percentage of payment attempts that resulted in a verified payment |
| **Formula** | `COUNT(Verified) / COUNT(*) * 100` |
| **Source columns** | `session_status` |
| **Counting unit** | `verified_session` |
| **Persian label** | نرخ موفقیت |

**Limitations:** Success rate is calculated as verified sessions relative to
total payment attempt rows. When `row_count = 0`, the rate is `0.0`
(division-by-zero protection). This measures session-status-level success,
not attempt-level success.

---

### 7. Total Amount

| Property | Value |
|---|---|
| **metric_id** | `total_amount` |
| **Definition** | Sum of all payment amounts in IRR |
| **Formula** | `SUM(amount)` |
| **Source columns** | `amount` |
| **Counting unit** | `row` |
| **Persian label** | مجموع مبلغ |

**Limitations:** Amounts are in Iranian rial (IRR). No nulls, zeros, or
negative values in the dataset. Sum reflects all rows matching filters.

---

### 8. Average Amount

| Property | Value |
|---|---|
| **metric_id** | `avg_amount` |
| **Definition** | Average payment amount in IRR |
| **Formula** | `AVG(amount)` |
| **Source columns** | `amount` |
| **Counting unit** | `row` |
| **Persian label** | متوسط مبلغ |

**Limitations:** Computed over all rows matching filters. Rounded to 2 decimal
places.

---

### 9. Daily Activity Count (Trend)

| Property | Value |
|---|---|
| **metric_id** | `daily_activity_trend` |
| **Definition** | Daily aggregation of payment attempts, verified count, and failed count |
| **Formula** | `GROUP BY CAST(created_at AS DATE)` → `COUNT(*)`, `COUNT(Verified)`, `COUNT(Failed)` |
| **Source columns** | `created_at`, `session_status`, `session_key` |
| **Counting unit** | `row` (per day) |
| **Persian label** | فعالیت روزانه |

**Limitations:** Daily buckets are based on `created_at` (always present, 100%
non-null). Other date columns (`verify_time_ms`, `settled_at`) are too sparse
for daily granularity.

---

### 10. Daily Amount Trend

| Property | Value |
|---|---|
| **metric_id** | `daily_amount_trend` |
| **Definition** | Daily total amount (IRR) trend |
| **Formula** | `GROUP BY CAST(created_at AS DATE)` → `SUM(amount)` |
| **Source columns** | `created_at`, `amount` |
| **Counting unit** | `row` (per day) |
| **Persian label** | روند مبلغ روزانه |

**Limitations:** Daily buckets based on `created_at`. Only days with activity
appear in the result.

---

## Metric Traceability

Every metric returned by the backend API includes the following metadata fields
so the frontend can display "How was this calculated?":

| Field | Description |
|---|---|
| `metric_id` | Unique identifier (see above) |
| `label` | Persian display label |
| `value` | Computed value |
| `definition` | Human-readable definition |
| `formula` | Mathematical or SQL formula |
| `source_columns` | Array of column names used |
| `counting_unit` | Unit of measurement (`row`, `session`, `verified_session`, `settled_session`) |
| `filters` | Applied filters (merchant_key, start_date, end_date) |
| `limitations` | Known data limitations |

## Adjusted Fee Disclaimer

The `adjusted_fee` column is **NOT** returned as a metric in Stage 1. It is a
confidentiality-adjusted indicator and must not be presented as the real
ZarinPal fee. Relative comparisons within a dataset are valid; absolute fee
values are not.
