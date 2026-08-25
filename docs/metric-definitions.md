# Metric Definitions

This document defines every implemented metric, its formula, source columns, counting unit, and known limitations.

## Sales Definitions

### Stage 1: Total Attempted Amount
- **Metric ID**: `total_amount`
- **Definition**: Sum of `amount` across ALL filtered rows, regardless of payment status.
- **Formula**: `SUM(amount) WHERE filters`
- **Source columns**: `amount`
- **Counting unit**: **rows** (sum, IRR)
- **Limitations**: Includes failed, reversed, and no-attempt rows. This is the Stage 1 "all rows" definition — kept unchanged for backward compatibility.

### Stage 2: Successful Amount (Sales)
- **Metric ID**: `successful_amount`
- **Definition**: Sum of `amount` from rows where `session_status` indicates a completed payment.
- **Formula**: `SUM(CASE WHEN session_status IN ('Verified', 'Paid', 'Reversed') THEN amount ELSE 0 END) WHERE filters`
- **Source columns**: `amount`, `session_status`
- **Counting unit**: **rows** (sum, IRR)
- **Limitations**: Stage 2 "successful_amount" definition. Excludes `Failed` and `NoAttempt`. Not the same as "settled" — `settled_at` is NULL for 98.95% of rows.

---

## Stage 1 Metrics (Core Merchant Overview)

### Payment Attempt Count
- **Metric ID**: `attempt_count` / `total_attempts`
- **Definition**: Number of raw rows in the filtered dataset.
- **Formula**: `COUNT(*) WHERE filters`
- **Source columns**: `*`
- **Counting unit**: **rows**
- **Limitations**: One row = one payment attempt. Multiple attempts per session are counted separately.

### Unique Session Count
- **Metric ID**: `unique_session_count` / `unique_sessions`
- **Definition**: Number of distinct `session_key` values.
- **Formula**: `COUNT(DISTINCT session_key) WHERE filters`
- **Source columns**: `session_key`
- **Counting unit**: **sessions**
- **Limitations**: NULL session_keys are excluded. Multiple attempts per session are counted once.

### Verified Count
- **Metric ID**: `verified_count` / `verified_attempts`
- **Definition**: Count of rows where `session_status = 'Verified'`.
- **Formula**: `COUNT(*) FILTER (WHERE session_status = 'Verified')`
- **Source columns**: `session_status`
- **Counting unit**: **attempts**
- **Limitations**: Uses `session_status`, not `verified_at` (which is NULL for 94.43% of rows).

### Completed Count (Stage 2)
- **Metric ID**: `completed_attempts`
- **Definition**: Count of rows where `session_status IN ('Verified', 'Paid', 'Reversed')`.
- **Formula**: `COUNT(*) FILTER (WHERE session_status IN ('Verified', 'Paid', 'Reversed'))`
- **Source columns**: `session_status`
- **Counting unit**: **attempts**
- **Limitations**: Used for success rate calculation.

### Failed Count
- **Metric ID**: `failed_count`
- **Definition**: Count of rows where `session_status = 'Failed'`.
- **Formula**: `COUNT(*) FILTER (WHERE session_status = 'Failed')`
- **Source columns**: `session_status`
- **Counting unit**: **attempts**
- **Limitations**: Only rows with explicit 'Failed' status.

### Success Rate
- **Metric ID**: `success_rate`
- **Definition**: Percentage of attempts that completed successfully.
- **Formula**: `(COUNT(session_status IN ('Verified','Paid','Reversed')) / COUNT(*)) * 100`
- **Source columns**: `session_status`
- **Counting unit**: **percentage (0-100)**
- **Limitations**: Returns 0.0 when attempt_count is 0 to avoid division-by-zero. Uses `session_status` instead of `settled_at`.

### Average Amount
- **Metric ID**: `avg_amount` / `avg_per_attempt_rials`
- **Definition**: Average `amount` across all rows.
- **Formula**: `AVG(amount) WHERE filters`
- **Source columns**: `amount`
- **Counting unit**: **rows (average, IRR)**
- **Limitations**: Includes zero-amount rows if any exist.

---

## Stage 2 Metrics (Sales Share and Time-Based Analytics)

### Merchant Sales Share (by Total Amount)
- **Metric ID**: `amount_share_pct`
- **Definition**: Merchant's total_amount as a percentage of the filtered population's total amount.
- **Formula**: `(merchant_total_amount / population_total_amount) * 100`
- **Source columns**: `amount`, `merchant_key`
- **Counting unit**: **percentage (0-100)**
- **Limitations**: Uses Stage 1 `total_amount` definition (all rows). Shares may not sum to exactly 100% due to rounding.

### Merchant Sales Share (by Successful Amount)
- **Metric ID**: `successful_amount_share_pct`
- **Definition**: Merchant's successful_amount as a percentage of the filtered population's successful amount.
- **Formula**: `(merchant_successful_amount / population_successful_amount) * 100`
- **Source columns**: `amount`, `session_status`, `merchant_key`
- **Counting unit**: **percentage (0-100)**
- **Limitations**: Uses Stage 2 sales definition. Shares may not sum to exactly 100% due to rounding.

### Category Sales Share
- **Metric ID**: `category_amount_share_pct` / `category_successful_amount_share_pct`
- **Definition**: Category's amount as a percentage of the population total.
- **Formula**: `(category_amount / population_amount) * 100`
- **Source columns**: `amount`, `session_status`, `category_id`, `category_title`
- **Counting unit**: **percentage (0-100)**

### Daily/Monthly/Yearly Attempt Count
- **Metric ID**: `attempt_count` (per period)
- **Definition**: Number of payment attempt rows per time period.
- **Formula**: `COUNT(*) GROUP BY period`
- **Source columns**: `created_at`
- **Counting unit**: **rows per period**
- **Limitations**: Period grouping may exclude rows with NULL `created_at`.

### Daily/Monthly/Yearly Total Amount
- **Metric ID**: `total_amount` (per period)
- **Definition**: Sum of amount per time period.
- **Formula**: `SUM(amount) GROUP BY period`
- **Source columns**: `amount`, `created_at`
- **Counting unit**: **rows per period (sum, IRR)**

### Daily/Monthly/Yearly Successful Amount
- **Metric ID**: `successful_amount` (per period)
- **Definition**: Sum of amount from completed payments per time period.
- **Formula**: `SUM(CASE WHEN session_status IN ('Verified','Paid','Reversed') THEN amount ELSE 0 END) GROUP BY period`
- **Source columns**: `amount`, `session_status`, `created_at`
- **Counting unit**: **rows per period (sum, IRR)**
- **Limitations**: Stage 2 definition.

### Previous-Period Count Change %
- **Metric ID**: `count_change_pct`
- **Definition**: Percentage change in attempt count vs. the previous period.
- **Formula**: `((count_current - count_previous) / count_previous) * 100`
- **Source columns**: `created_at`
- **Counting unit**: **percentage**
- **Limitations**: Uses LAG window function. Returns `None` for the first period or when previous period count is 0.

### Previous-Period Amount Change %
- **Metric ID**: `amount_change_pct`
- **Definition**: Percentage change in total amount vs. the previous period.
- **Formula**: `((amount_current - amount_previous) / amount_previous) * 100`
- **Source columns**: `amount`, `created_at`
- **Counting unit**: **percentage**
- **Limitations**: Uses LAG window function. Returns `None` for first period or when previous amount is 0.

### Top Merchants by Amount
- **Metric ID**: `amount_rank`
- **Definition**: Merchants ranked by total amount, descending.
- **Formula**: `RANK() OVER (ORDER BY SUM(amount) DESC)`
- **Source columns**: `amount`, `merchant_key`
- **Counting unit**: **merchants**

### Top Merchants by Count
- **Metric ID**: `count_rank`
- **Definition**: Merchants ranked by attempt count, descending.
- **Formula**: `RANK() OVER (ORDER BY COUNT(*) DESC)`
- **Source columns**: `merchant_key`
- **Counting unit**: **merchants**

### Highest Activity Day/Month/Year
- **Metric ID**: `highest_activity_day`, `highest_activity_month`
- **Definition**: The calendar period with the highest payment attempt count.
- **Formula**: `GROUP BY period, ORDER BY count DESC, LIMIT 1`
- **Source columns**: `created_at`
- **Counting unit**: **period**
- **Limitations**: Returns the first period in case of ties.

---

## Non-Implemented Metrics (Explicitly Excluded)

### Adjusted-Fee Analysis
- **Status**: Stage 3 (not yet implemented)
- **Reason**: `adjusted_fee` is a confidentiality-adjusted indicator, NOT the real ZarinPal fee. Cannot be presented as actual fees.

### High-Value Payment Analysis
- **Status**: Stage 4 (not yet implemented)
- **Reason**: Not requested for Stage 2 scope.

### AI Recommendations
- **Status**: Stage 5 (not yet implemented)
- **Reason**: Not requested for Stage 2 scope.

### Customer/Product/Inventory Analytics
- **Status**: Not supported by schema
- **Reason**: No `customer_id` or `product_id` columns exist in the dataset.

### Retention Analysis
- **Status**: Not supported
- **Reason**: `payer_card_key` has 94.02% nulls — cannot reliably support repeat-behavior analysis.
