# Metric Definitions

> See docs/api-reference.md for endpoint details.

## Stage 1: Payment Overview Metrics

All metrics in this section are computed from the merchant's payment-attempt rows,
filtered by `merchant_key` and optional date range.

---

### M1 — Payment Attempt Count

**Metric ID:** `attempt_count`
**Label (EN):** Payment attempts
**Label (FA):** تعداد تلاش‌ها
**Unit:** rows

*Definition*
Number of raw rows in the dataset that match the filter.

*Formula*
```latex
attempt\_count = COUNT(rows) WHERE filters
```

*Source columns*: — (counts all rows)
*Counting unit**: rows**
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: A row is a "payment attempt". Multiple attempts for the same
session are counted separately. This is NOT a unique-transaction count.

---

### M2 — Unique Session Count

**Metric ID:** `unique_session_count`
**Label (EN):** Unique sessions
**Label (FA):** نشست‌های یکتا
**Unit:** sessions

*Definition*
Number of distinct `session_key` values among the filtered rows.

*Formula*
```latex
unique\_session\_count = COUNT(DISTINCT session\_key) WHERE filters
```

*Source columns*: `session_key`
*Counting unit*: unique sessions
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: If `session_key` contains NULL values they are excluded from the count.
A session that has multiple attempts (different `try_seq`) is still counted once.

---

### M3 — Verified Count

**Metric ID:** `verified_count`
**Label (EN):** Verified payments
**Label (FA):** پرداخت‌های تأیید شده
**Unit:** rows

*Definition*
Number of rows where `session_status = 'verified'` (case-insensitive).

*Formula*
```latex
verified\_count = COUNT(rows) WHERE session\_status = 'verified' AND filters
```

*Source columns*: `session_status`
*Counting unit*: rows
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: Uses `session_status` as recorded in the dataset. The verification
status reflects the dataset's recorded value, not a live ZarinPal API check.

---

### M4 — Settled Count

**Metric ID:** `settled_count`
**Label (EN):** Settled payments
**Label (FA):** پرداخت‌های تسویه شده
**Unit:** rows

*Definition*
Number of rows where `settled_at` is not NULL.

*Formula*
```latex
settled\_count = COUNT(rows) WHERE settled\_at IS NOT NULL AND filters
```

*Source columns*: `settled_at`
*Counting unit*: rows
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: `settled_at` is NULL for 98.95% of rows in the sample dataset.
Results should be interpreted as "settlement recorded in the dataset", not
actual ZarinPal settlement.

---

### M5 — Failed Count

**Metric ID:** `failed_count`
**Label (EN):** Failed payments
**Label (FA):** پرداخت‌های ناموفق
**Unit:** rows

*Definition*
Number of rows where `session_status = 'failed'` (case-insensitive).

*Formula*
```latex
failed\_count = COUNT(rows) WHERE session\_status = 'failed' AND filters
```

*Source columns*: `session_status`
*Counting unit*: rows
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: Same as M3 — reflects dataset recorded status.

---

### M6 — Success Rate

**Metric ID:** `success_rate`
**Label (EN):** Success rate
**Label (FA):** نرخ موفقیت
**Unit:** percentage (0–100)

*Definition*
Percentage of payment attempts that were verified.

*Formula*
```latex
success\_rate = (verified\_count / attempt\_count) × 100
```

*Source columns*: `session_status`
*Counting unit**: verified rows / all rows**
*Filters*: same as M3 and M1
*Limitations*: If `attempt_count = 0`, returns 0.0 to avoid division-by-zero.
"Verified" ≠ "settled". Some sessions may be verified but not settled.

---

### M7 — Total Amount

**Metric ID:** `total_amount`
**Label (EN):** Total amount
**Label (FA):** مجموع مبلغ
**Unit:** IRR (Iranian Rial)

*Definition*
Sum of `amount` across all filtered rows.

*Formula*
```latex
total\_amount = SUM(amount) WHERE filters
```

*Source columns*: `amount`
*Counting unit**: rows (sum)**
*Filters*: `merchant_key`, `category_id`, `init_time_ms` date range
*Limitations*: Includes amounts from all rows in the filter, regardless of
payment status (verified/failed/etc.). This is a Stage 1 definition; Stage 2
will introduce verified-amount and settled-amount definitions.

---

### M8 — Average Amount

**Metric ID:** `average_amount`
**Label (EN):** Average amount
**Label (FA):** میانگین مبلغ
**Unit:** IRR

*Definition*
Average `amount` per payment attempt.

*Formula*
```latex
average\_amount = total\_amount / attempt\_count
```

*Source columns*: `amount`
*Counting unit**: rows (mean)**
*Filters*: same as M7 and M1
*Limitations*: If `attempt_count = 0`, returns 0.0 to avoid division-by-zero.
Includes all rows regardless of status.

---

## Stage 2: Sales Share and Time-Based Metrics

> Status: Pending (to be implemented in Stage 2)

Planned definitions:
- Merchant sales share (merchant amount / total amount × 100)
- Category sales share (category amount / total amount × 100)
- Daily/monthly/yearly activity count and amount trends
- Previous-period comparison
- Top merchants by amount and count
