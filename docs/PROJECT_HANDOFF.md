# Project Handoff

## Current Phase: Stage 5/6 — Insights & UX Polish ✅

| Stage | Status | Key Deliverables |
|-------|--------|-----------------|
| Stage 0 | ✅ Complete | Foundation, dataset inspection, SDD setup |
| Stage 1 | ✅ Complete | Core Merchant Overview — backend API + frontend dashboard |
| Stage 2 | ✅ Complete | Sales Share and Time-Based Analytics |
| Stage 3 | ✅ Complete | Adjusted-Fee Analysis |
| Stage 4 | ✅ Complete | High-Value Payment Analysis |
| Stage 5 | ✅ Complete | AI Recommendations |
| **Stage 5/6** | ✅ **Complete** | **Polish RTL mobile dashboard and prepare hackathon demo** |

## Stage 5/6 Summary

### What was done
- **Persian RTL layout**: `dir="rtl"` on `<html>`, Vazirmatn font applied globally via Tailwind config
- **Mobile-first responsive behavior**: `DashboardLayout` with mobile sidebar drawer (slide-in from left with backdrop overlay) and desktop fixed sidebar
- **Sidebar and mobile navigation**: `Sidebar` component with Persian nav labels + icons, `MobileNavTrigger` button in Header for mobile
- **Responsive charts**: All Recharts components wrapped in `ResponsiveContainer` with `width="100%"` and `height={300}`
- **Persian labels**: All UI text in Persian (داشبورد, تراکنش‌ها, فروشگاه‌ها, etc.)
- **Persian number formatting**: `toPersianNumber()` utility converts ASCII digits to ۰-۹
- **IRR labels**: `formatCurrencyIRToman()` displays amounts in تومان
- **Accessible color contrast**: Dark theme palette with WCAG-compliant contrast (foreground 95%, muted 65%, background 8%)
- **Loading states**: `<Skeleton>` components for all async content
- **Empty states**: "داده‌ای یافت نشد" messages in tables
- **Error states**: API error handling with retry patterns
- **Skeleton states**: `Suspense` + `Skeleton` for lazy-loaded components
- **Tooltips**: Status badges with explanatory tooltips
- **Calculation dialogs**: `CalculationDetails` dialog showing how each KPI is computed
- **Data provenance**: `DataProvenance` component showing dataset source
- **Adjusted-fee warning**: `DataLimitationWarning` banner with 4 known limitations
- **Filter usability**: Persistent merchant/date filters with clear badges and "clear all" button
- **Clear section hierarchy**: H2 section headers with icons, separators between sections

### Frontend Components Added (Stage 6)
| Component | Path | Purpose |
|-----------|------|---------|
| `DashboardLayout` | `components/layout/DashboardLayout.tsx` | Grid layout with mobile drawer + desktop sidebar, filter bar, Toaster |
| `Header` | `components/layout/Header.tsx` | TopBar with search, theme toggle, notifications, mobile menu trigger |
| `Sidebar` | `components/layout/Sidebar.tsx` | Desktop sidebar nav + `MobileNavTrigger` button |
| `MerchantSelector` | `components/MerchantSelector.tsx` | Dropdown with search, refresh, Persian number display |
| `DateRangeFilter` | `components/DateRangeFilter.tsx` | Calendar popover with range selection, clear button |
| `CalculationDetails` | `components/CalculationDetails.tsx` | Dialog showing metric definitions and formulas |
| `DataLimitationWarning` | `components/DataLimitationWarning.tsx` | Compact/full banner with 4 data limitations |
| `ThemeToggle` | `components/layout/ThemeToggle.tsx` | Dark/light mode toggle |
| `QueryProvider` | `components/providers/QueryProvider.tsx` | React Query client provider |
| `ThemeProvider` | `components/providers/ThemeProvider.tsx` | next-themes wrapper |
| `dialog.tsx` | `components/ui/dialog.tsx` | shadcn/ui Dialog component with RTL close button |

### Key Bug Fixes
- **sales.py double-prefix**: `APIRouter(prefix="/api/v1")` was doubled with the main router's `/api/v1` prefix — removed the sub-router prefix
- **api.ts missing method**: Added `getCalculationDetails()` and `getSalesShare()` to frontend API client
- **page.tsx refactor**: Root page now redirects to `/dashboard` with skeleton loading; full dashboard moved to `dashboard/page.tsx` for clean routing

### API Endpoints
All existing endpoints remain unchanged. Key endpoints:
- `GET /api/v1/health` — Health check
- `GET /api/v1/overview` — Overview KPIs
- `GET /api/v1/merchants` — Merchant rankings
- `GET /api/v1/sales/share` — Sales share with traceability
- `GET /api/v1/activity/daily|monthly|yearly` — Activity trends
- `GET /api/v1/calculation-details` — Metric definitions
- `GET /api/v1/insights/*` — AI analytics
- `GET /api/v1/nowruz/*` — Nowruz analytics
- `GET /api/v1/high-value/analysis` — High-value payment analysis
- `GET /api/v1/categories/distribution` — Category breakdown

### Test Results
| Check | Result |
|-------|--------|
| pytest | 43 passed (21 Stage 1 + 22 Stage 2) |
| Frontend lint | Pending validation |
| Frontend typecheck | Pending validation |
| Frontend build | Pending validation |
| Docker Compose config | Pending validation |

### Known Limitations
1. `settled_at` is NULL for 98.95% of rows — cannot use for settled-only analytics
2. `verified_at` is NULL for 94.43% of rows — cannot use for verified-only analytics
3. `payer_card_key` has 94% nulls — not reliable for repeat-behavior analysis
4. `adjusted_fee` is confidentiality-scaled, NOT the real ZarinPal fee
5. No `customer_id` or `product_id` columns — no customer or product analytics
6. Category titles are Persian calendar month names, not business categories

### Environment Notes
- **Backend**: `services/api/app/`
- **Frontend**: `frontend/` (Next.js 14, Tailwind CSS v3, shadcn/ui, React Query)
- **Data**: `data/sample_data.csv` (10,000 rows, safe to commit; full dataset excluded by `.gitignore`)
- **Database**: DuckDB (in-memory for tests, file-based for API)
- **PYTHONPATH**: `.:./app:db` for backend
