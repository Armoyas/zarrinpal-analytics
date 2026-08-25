# Stage 6 Specification: Final UX, Mobile, RTL, and Demo Preparation

## Overview

Make the ZarrinPal Analytics dashboard production-ready for the Elcamp 1405 hackathon
demonstration. Focus on UX polish, mobile responsiveness, Persian RTL correctness,
and demo preparation. No new analytics or backend architecture changes.

## Goals

1. **Persian RTL correctness** — `dir="rtl"`, Vazirmatn font, Persian labels, Persian number formatting
2. **Mobile-first responsive** — dashboard fully functional on 360px viewport
3. **Sidebar + mobile navigation** — desktop sidebar + mobile drawer
4. **Responsive charts** — all Recharts wrapped in ResponsiveContainer
5. **Persian labels and number formatting** — `toPersianNumber()`, `formatCurrencyIRToman()`
6. **IRR labels** — amounts in تومان via `formatCurrencyIRToman()`
7. **Accessible color contrast** — WCAG-compliant dark theme
8. **Loading states** — Skeleton components for async content
9. **Empty states** — "داده‌ای یافت نشد" in tables and cards
10. **Error states** — API error handling with retry patterns
11. **Skeleton states** — Suspense + Skeleton for lazy components
12. **Tooltips** — explanatory tooltips on KPI cards and badges
13. **Calculation dialogs** — `CalculationDetails` dialog with metric formulas
14. **Data provenance** — `DataProvenance` showing dataset metadata
15. **Adjusted-fee warning** — `DataLimitationWarning` with 4 limitations
16. **Filter usability** — persistent filters with clear badges
17. **Clear section hierarchy** — H2 headers with icons, separators

## Dashboard Sections

1. Merchant overview — KPIs + merchant detail card
2. Payment activity — status distribution + activity trends
3. Daily/monthly/yearly analysis — trends chart
4. Sales share — merchant ranking table with share %
5. Adjusted-fee analysis — fee total with confidentiality warning
6. High-value payments — payments above 10M IRR threshold
7. Merchant ranking/benchmarking — peer comparison
8. Actionable insights — AI recommendations + chat panel
9. Data provenance and limitations

## Backend

- No new endpoints required
- No metric formula changes
- `getCalculationDetails()` exists at `GET /api/v1/sales/calculation-details`

## Frontend Components

| Component | Purpose |
|-----------|---------|
| DashboardLayout | Grid layout, mobile drawer, filter bar, Toaster |
| Header | TopBar with theme toggle, mobile menu trigger |
| Sidebar | Desktop nav + mobile drawer (Persian labels) |
| MerchantSelector | Dropdown with search + refresh |
| DateRangeFilter | Native date inputs with clear button |
| CalculationDetails | Dialog showing metric formulas |
| DataLimitationWarning | Banner with 4 data limitations |
| dialog.tsx | Self-contained dialog (no Radix dependency) |
| ThemeToggle | Dark/light mode toggle |

## Routing

- `frontend/app/page.tsx` — redirects to `/dashboard`
- `frontend/app/dashboard/page.tsx` — full dashboard (9 sections)

## Validation

- [x] Backend tests: 32 passed
- [x] Frontend lint: 0 errors, 1 warning
- [x] Frontend typecheck: 0 errors
- [x] Frontend build: 7 routes generated
- [x] Docker Compose config: VALID
- [x] Git tracking check: no secrets
- [x] Full dataset protection: .gitignore excludes sample_data.csv
