# ZarrinPal Analytics — Demo Script

## Overview

This demo script walks through the ZarrinPal Analytics dashboard, showcasing all
dashboard sections, filtering capabilities, and Persian RTL mobile behavior.

**Demo environment:** `http://localhost:3001` (frontend) with API at `http://localhost:8000`

**Dataset:** 10,000 synthetic payment rows (2024-01-01 to 2024-12-30), 50 merchants, 3 terminals, 18 categories.

---

## Step 1: Merchant Selection

**Goal:** Show how to filter the dashboard by merchant.

1. Navigate to `http://localhost:3001` (redirects to `/dashboard`).
2. In the TopBar, click the **فروشگاه‌ها** (Store) dropdown.
3. Select "M1" (آموزش) from the list.
4. Observe that all KPIs and charts update to show only M1's data.
5. A filter badge "فروشگاه: M1" appears above the KPIs.

**Expected:** All metrics re-query from the backend with `merchant_key=M1`.

---

## Step 2: Date Filtering

**Goal:** Show how to filter by date range.

1. Click the date range button in the TopBar (shows "همه تاریخ‌ها" by default).
2. Select Jan 1 – Jan 15, 2024 from the calendar popover.
3. Click "اعمال" (Apply).
4. Observe the date filter badges appear ("از: ۱۴۰۲/۱۰/۱۱" / "تا: ۱۴۰۲/۱۰/۲۶").
5. Click "پاک کردن فیلترها" to clear all filters and return to the full dataset.

**Expected:** Date range filters pass `start_date` and `end_date` query params to all API calls.

---

## Step 3: Overview KPIs

**Goal:** Show the main dashboard KPIs.

With all filters cleared, scroll to the **شاخص‌های کلان** (KPI) section:

- **کل تلاش‌ها** (total_attempts): Shows total payment attempt rows
- **نرخ موفقیت** (success_rate): Percentage of Verified + Paid + Reversed
- **مجموع مبلغ** (total_amount): Total attempted amount in IRR/تومان
- **کارمزد تنظیم‌شده** (adjusted_fee_total): Confidentiality-scaled indicator (NOT real fee)

**Expected:** Each KPI card has a tooltip "چگونه محاسبه شد؟" that opens the calculation details dialog.

---

## Step 4: Daily/Monthly/Yearly Analysis

**Goal:** Show time-series analysis.

1. Scroll to the **روند تراکنش‌ها** (Transaction Trends) chart.
2. The chart shows daily attempt count and amount over the full year.
3. Observe responsive behavior: chart is full-width on mobile, two-up on desktop.

**Expected:** Chart uses Recharts `ResponsiveContainer` — no horizontal scroll needed.

---

## Step 5: Sales Share

**Goal:** Show merchant sales share ranking.

1. Scroll to the **سهم فروش فروشگاه‌ها** (Sales Share) table.
2. Each merchant is ranked by total attempt count.
3. Columns: rank, merchant key, category, attempts, total amount, success rate %, sales share %.
4. Click the **⟶** arrow on any merchant row to navigate to the merchant detail page (`/merchant/[key]`).

**Expected:** Sales share percentages are calculated as `merchant_amount / total_amount * 100`.

---

## Step 6: Adjusted-Fee Analysis

**Goal:** Show the adjusted_fee confidentiality warning.

1. Above the KPI section, the **DataLimitationWarning** compact banner shows "۴ محدودیت داده".
2. In the KPI cards, the adjusted_fee total has a tooltip explaining it is "a confidentiality-scaled value. Only relative comparisons are valid."
3. The **CalculationDetails** dialog ("چگونه محاسبه شد؟") shows the adjusted_fee limitation in the metric definition.

**Expected:** No metric presents `adjusted_fee` as the actual ZarinPal fee.

---

## Step 7: High-Value Threshold Analysis

**Goal:** Show high-value payment analysis.

1. The dashboard includes a **High Value Analysis** section showing payments above 10,000,000 IRR (1,000 تومان).
2. Metrics shown: total attempts, high-value attempt count, percentage of attempts, percentage of total amount, breakdown by merchant, by category, and by status.

**Expected:** Threshold is clearly labeled as 10M IRR (1,000 تومان).

---

## Step 8: Merchant Comparison

**Goal:** Show peer comparison and merchant detail.

1. From the sales share table, click any merchant's **⟶** link.
2. The merchant detail page (`/merchant/[key]`) shows:
   - Overview stats (attempts, success rate, totals)
   - Status breakdown table
   - Amount distribution
   - Daily trend chart
   - Peer comparison vs category average
   - Category peers list
3. A back button returns to the dashboard.

**Expected:** Peer comparison shows merchant vs category peers + overall average.

---

## Step 9: Actionable Insight

**Goal:** Show AI-powered recommendations.

1. Scroll to the **هوش مصنوعی** section.
2. The **RecommendationPanel** shows performance-based recommendations for top merchants.
3. Each recommendation includes merchant key, success rate, and actionable advice.
4. The **AI Chat** panel allows natural-language queries ("Show me risk alerts", "What are spending patterns?").

**Expected:** AI responses are grounded in real DuckDB queries — no invented data.

---

## Step 10: "How was this calculated?" Details

**Goal:** Show full metric traceability.

1. In the KPI section header, click **چگونه محاسبه شد؟** (or the HelpCircle icon).
2. The **CalculationDetails** dialog opens, showing:
   - Sales definitions (Stage 1 vs Stage 2)
   - Each metric with: definition, formula (in `<code>`), source columns, counting unit, filters, limitations
   - Rationale for Stage 2 sales definition (why session_status instead of settled_at)
3. Click the X button or click outside to close.

**Expected:** Every metric formula is visible — no black boxes.

---

## Step 11: Mobile Layout

**Goal:** Show mobile-first responsive behavior.

1. Open Chrome DevTools → toggle device toolbar (⌘⇧M).
2. Select "iPhone SE" or "Pixel 5" (360px width).
3. Refresh the page.
4. Observe:
   - The sidebar is hidden — a hamburger menu (☰) appears in the TopBar.
   - Tapping the menu opens a slide-in drawer with Persian navigation.
   - The TopBar shows the dashboard title (truncated to icon on very small screens).
   - KPI cards stack vertically.
   - Tables become horizontally scrollable.
   - The DataLimitationWarning banner is compact (single-row).
5. Close the drawer using the X button or backdrop tap.

**Expected:** Full dashboard functionality on a 360px viewport.

---

## Step 12: Data Limitations

**Goal:** Show data provenance and limitations.

1. Scroll to the bottom of the dashboard.
2. The **DataProvenance** component shows dataset metadata: source file, row count, column count, date range, merchants count, currency, encoding.
3. The **DataLimitationWarning** (full, non-compact mode on the dashboard page) shows all 4 known limitations:
   - **کارمزد تنظیم‌شده** — not the real fee, only for relative comparison
   - **تسویه حساب** — settled_at is NULL for 98.95% of rows
   - **کارت پرداخت‌کننده** — payer_card_key is 94% NULL
   - **عدم وجود شناسه مشتری/محصول** — no customer_id/product_id
4. Click "جزئیات" link in the compact banner to expand full details.

**Expected:** All limitations are visible and clearly described in Persian.

---

## Cleanup

1. Close all browser tabs.
2. Run `docker compose down` to stop services.
3. Note: `data/sample_data.csv` is in `.gitignore` — it is NOT committed to git.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API shows "connection refused" | Run `docker compose up --build` from repo root |
| Frontend shows "Failed to fetch" | Check that `NEXT_PUBLIC_API_URL` env var points to `http://localhost:8000` |
| Empty data on dashboard | Ensure `data/sample_data.csv` exists (auto-generated by tests/seed script) |
| Persian text shows boxes | Verify Vazirmatn font is loaded (check Network tab in DevTools) |
