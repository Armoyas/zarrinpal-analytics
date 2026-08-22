# Stage 2 — Sales Share and Time-Based Analytics

## Scope

Implement merchant/category sales-share analysis and daily/monthly/yearly activity trends.

## Sales Definition

**Sales (Stage 2)** = `SUM(amount)` from rows where `session_status IN ('Verified', 'Paid', 'Reversed')`.

This represents completed/successful payment attempts. Rows with `session_status` of 'Failed' or 'NoAttempt' are excluded from this "successful amount" calculation.

**Stage 1 "total amount"** (all rows) is preserved as "total_attempted_amount" — both definitions are exposed with clear labels.

### Rationale

- `settled_at IS NOT NULL` selects only 1.05% of rows — too sparse for meaningful share analysis.
- `session_status` is 0% null and has clear semantics: Verified (44.8%) + Paid (10.3%) + Reversed (5.1%) = 60.2% of all rows represent successful payments.
- This is a **status-based definition**, not a settlement-based one.

### Labels

| Definition | Counting Unit | Status Filter |
|---|---|---|
| Total attempted amount | All rows | None |
| Successful amount | Rows | session_status IN ('Verified', 'Paid', 'Reversed') |

## Endpoints

- GET /api/v1/sales/share — merchant & category sales share
- GET /api/v1/activity/daily — daily payment count & amount
- GET /api/v1/activity/monthly — monthly payment count & amount
- GET /api/v1/activity/yearly — yearly payment count & amount
- GET /api/v1/merchants/ranking — top merchants by amount and count
- GET /api/v1/activity/peak-day — highest activity day
- GET /api/v1/activity/peak-month — highest activity month
- GET /api/v1/comparison — previous-period comparison

## Metrics

### Sales Share
- Merchant sales share (successful amount) = merchant amount / total population amount × 100
- Category sales share (successful amount) = category amount / total population amount × 100

### Activity Counts
- Daily payment attempt count (raw rows)
- Daily successful amount (sum of amount where session_status in completed set)
- Daily success rate = successful rows / total rows × 100

### Trends
- Daily/monthly/yearly payment count
- Daily/monthly/yearly successful amount
- Daily/monthly/yearly success rate

### Ranking
- Top merchants by successful amount
- Top merchants by payment count

### Peak Activity
- Highest activity day (max payment count)
- Highest activity month (max payment count)

## Traceability

Every metric returns:
- metric_id
- definition
- formula
- source_columns
- counting_unit
- filters
- limitations

## Acceptance Criteria

- [x] Sales share endpoints return merchant/category breakdown with shares
- [x] Activity endpoints support daily/monthly/yearly intervals
- [x] Ranking returns top N merchants by amount and count
- [x] Peak day/month identification works
- [x] Previous-period comparison returns growth percentages
- [x] All metrics include traceability metadata
- [x] Tests cover filtering, aggregation, and edge cases
- [x] Frontend displays sales share, activity trends, and rankings
- [x] Persian RTL layout with Vazirmatn font
