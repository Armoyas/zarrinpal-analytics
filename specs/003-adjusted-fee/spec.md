# Stage 3 — Adjusted-Fee Analysis

## Critical Business Rule

> **The `adjusted_fee` column does NOT represent ZarinPal's actual fee. It is a confidentiality-adjusted indicator created using a constant factor.**

### Labels

**English:** Confidentiality-adjusted fee indicator
**Persian:** شاخص کارمزد تعدیل‌شده برای مقایسه نسبی

### What NOT to do
- Never call it the actual fee
- Never call it the real commission
- Never display it as actual ZarinPal pricing
- Never use it for billing or settlement calculations
- Relative comparisons across merchants/categories MAY remain valid within the same dataset

## Sales Definition (reused from Stage 2)

Sales = amount from rows where `session_status IN ('Verified', 'Paid', 'Reversed')`.

## Endpoints

- GET /api/v1/adjusted-fee — aggregate adjusted-fee indicators
- GET /api/v1/adjusted-fee/trend — adjusted-fee trend over time
- GET /api/v1/adjusted-fee/merchants — adjusted-fee by merchant
- GET /api/v1/adjusted-fee/categories — adjusted-fee by category

## Metrics

- Total adjusted-fee indicator (sum)
- Average adjusted-fee indicator (mean)
- Adjusted-fee trend (daily/weekly/monthly)
- Adjusted-fee by merchant (sum and average)
- Adjusted-fee by category (sum and average)
- Adjusted-fee share of amount = sum(adjusted_fee) / sum(amount) × 100
- Relative merchant ranking (sum adjusted_fee)
- Relative category comparison (sum adjusted_fee)

## Traceability

Every metric returns metric_id, definition, formula, source_columns, counting_unit, filters, limitations.

## Limitations

1. adjusted_fee is a confidentiality-adjusted indicator, NOT the real fee.
2. Relative comparisons within the same dataset may be valid.
3. Do not compare across datasets with different adjustment factors.
4. Not suitable for billing or settlement calculations.
