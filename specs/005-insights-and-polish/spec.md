# Stage 5: Insights & Polish — Specification

## Status
- **Stage 0**: Complete
- **Stage 1**: Complete
- **Stage 2**: Complete
- **Stage 3**: Complete
- **Stage 5**: ✅ Complete

## Goal
Make the application ready for hackathon demonstration. Polish the UX with Persian RTL, mobile-first responsive behavior, improved navigation, responsive charts, Persian number formatting, IRR labels, accessible color contrast, and all UI states (loading, empty, error, skeleton). Improve demo documentation.

## Scope

### In Scope
- **Persian RTL layout** — `dir="rtl"` on `<html>`, Vazirmatn font applied globally
- **Mobile-first responsive behavior** — MobileSidebar drawer for mobile, desktop sidebar for desktop
- **Desktop layout** — Two-column grid (240px sidebar + main) on `md+`
- **Sidebar and mobile navigation** — MobileNavTrigger button in Header, MobileSidebar drawer with close button
- **Responsive charts** — Recharts `ResponsiveContainer` with `width="100%"` and `height={300}`
- **Persian labels** — All UI text in Persian (داشبورد, تراکنش‌ها, فروشگاه‌ها, etc.)
- **Persian number formatting** — `toPersianNumber()` utility converts ASCII digits to ۰-۹
- **IRR labels** — `formatCurrencyIRToman()` displays amounts in تومان with comma formatting
- **Accessible color contrast** — Dark theme palette with WCAG-compliant contrast ratios
- **Loading states** — `<Skeleton>` components for all async content
- **Empty states** — "داده‌ای یافت نشد" messages in tables/charts
- **Error states** — Error boundaries with retry buttons on API failure
- **Skeleton states** — Suspense-based skeleton loaders for lazy components
- **Tooltips** — Status badges with explanatory tooltips
- **Calculation dialogs** — `CalculationDetails` dialog showing how each KPI is computed
- **Data provenance** — `DataProvenance` component showing dataset source and limitations
- **Adjusted-fee warning** — `DataLimitationWarning` banner explaining confidentiality scaling
- **Filter usability** — Persistent merchant/date filters with clear badges and "clear all" button
- **Clear section hierarchy** — H2 section headers with icons, separators between sections

### Out of Scope
- No new analytical metrics
- No backend architecture changes
- No PostgreSQL, Metabase, authentication, or unrelated dependencies

## Frontend Components

### New Components (Stage 6)
| Component | Path | Purpose |
|-----------|------|---------|
| `DashboardLayout` | `components/layout/DashboardLayout.tsx` | Grid layout with responsive sidebar, filter bar, Toaster |
| `Header` | `components/layout/Header.tsx` | Top bar with search, theme toggle, notifications, mobile menu trigger |
| `Sidebar` | `components/layout/Sidebar.tsx` | Navigation with Persian labels and icons |
| `MobileSidebar` | `components/layout/DashboardLayout.tsx` | Mobile-only drawer with backdrop overlay |
| `MerchantSelector` | `components/MerchantSelector.tsx` | Dropdown with search, refresh, Persian number display |
| `DateRangeFilter` | `components/DateRangeFilter.tsx` | Calendar popover with range selection, clear button |
| `CalculationDetails` | `components/CalculationDetails.tsx` | Dialog showing metric definitions and formulas |
| `DataLimitationWarning` | `components/DataLimitationWarning.tsx` | Compact/full banner with 4 known data limitations |
| `ThemeToggle` | `components/layout/ThemeToggle.tsx` | Dark/light mode toggle |
| `QueryProvider` | `components/providers/QueryProvider.tsx` | React Query client provider |

### Dashboard Sections
The dashboard (`frontend/app/dashboard/page.tsx`) presents 9 clear sections:
1. **Merchant overview** — KPI cards (total attempts, success rate, amounts)
2. **Payment activity** — Status distribution and category breakdown tables
3. **Daily/monthly/yearly analysis** — TransactionTrends chart + TimeSeries data
4. **Sales share** — Merchant sales share ranking table
5. **Adjusted-fee analysis** — Warning banner + adjusted fee totals
6. **High-value payments** — HighValueAnalysis table (threshold ≥10M IRR)
7. **Merchant ranking/benchmarking** — MerchantRanking component
8. **Actionable insights** — AI-powered recommendations panel
9. **Data provenance and limitations** — DataProvenance component

## Demo Script

The demo script (`docs/demo-script.md`) shows 12 steps:
1. Merchant selection
2. Date filtering
3. Overview KPIs
4. Daily/monthly/yearly analysis
5. Sales share
6. Adjusted-fee analysis
7. High-value threshold analysis
8. Merchant comparison
9. Actionable insight
10. "How was this calculated?" details
11. Mobile layout
12. Data limitations

## Acceptance Criteria

### AC1: Frontend
- ✅ Persian RTL layout (`dir="rtl"`) on all pages
- ✅ Vazirmatn font applied globally via Tailwind config
- ✅ Mobile-first responsive design (drawer sidebar on mobile, grid on desktop)
- ✅ Persian number formatting with `toPersianNumber()`
- ✅ IRR/تومان currency formatting with `formatCurrencyIRToman()`
- ✅ Loading skeletons on all async sections
- ✅ Empty states with Persian text
- ✅ Error states with retry
- ✅ Tooltips on status badges
- ✅ Calculation details dialog accessible from KPI section
- ✅ Data limitation warning visible on all pages

### AC2: Documentation
- ✅ specs/005-insights-and-polish/spec.md
- ✅ specs/005-insights-and-polish/plan.md
- ✅ specs/005-insights-and-polish/tasks.md
- ✅ docs/PROJECT_HANDOFF.md updated
- ✅ AGENTS.md updated
- ✅ README.md updated
- ✅ PROJECT_STRUCTURE.md updated
- ✅ docs/demo-script.md
- ✅ docs/setup.md
- ✅ docs/api-reference.md

### AC3: Validation
- ✅ Backend tests pass (43 total)
- ✅ Frontend lint passes
- ✅ Frontend typecheck passes
- ✅ Frontend build succeeds
- ✅ Docker Compose config valid
- ✅ Docker Compose build succeeds
- ✅ Git tracking clean (no secrets, no raw CSV committed)
