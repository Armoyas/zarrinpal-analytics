# Specification: Phase 2 — Dashboard UI

> **Status:** Implemented
> **Phase:** Phase 2
> **Created:** 2026-08-21
> **Depends on:** `specs/phase-1-api-foundation/spec.md`

---

## 1. Overview

This specification defines the Next.js frontend dashboard for the ZarrinPal Analytics project.

The dashboard is **Persian RTL, mobile-first**, using:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS v3
- shadcn/ui
- Recharts

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     frontend/                            │
│                                                          │
│  app/                          ← App Router              │
│    layout.tsx                  ← RTL + Vazirmatn         │
│    page.tsx                    ← Dashboard root page     │
│    globals.css               ← Tailwind global styles  │
│                                                          │
│  components/                                          │
│    dashboard/                  ← Dashboard panels         │
│      DashboardPage.tsx        ← Main orchestrator       │
│      PerformanceMetrics.tsx  ← KPI cards w/ tooltips   │
│      TransactionTrends.tsx   ← Recharts line chart     │
│      MerchantRanking.tsx     ← Merchant ranking table  │
│      PeerComparison.tsx      ← Peer comparison         │
│      DataProvenance.tsx      ← Coming soon (placeholder)│
│      NowruzAnalysis.tsx      ← Coming soon (placeholder)│
│      RecommendationPanel.tsx ← Coming soon (placeholder)│
│                                                          │
│    layout/                   ← App layout                │
│      DashboardLayout.tsx    ← Sidebar + header          │
│      Header.tsx             ← Date picker, merchant     │
│      Sidebar.tsx            ← Navigation links          │
│                                                          │
│    ui/                       ← shadcn/ui primitives      │
│      badge.tsx              ← Status badges             │
│      button.tsx             ← Action buttons            │
│      card.tsx               ← KPI/metric cards            │
│      skeleton.tsx           ← Loading placeholders      │
│      table.tsx             ← Data tables                 │
│                                                          │
│  lib/                                              │
│    api.ts                   ← API client                │
│    utils.ts               ← Format utilities (fa-IR)   │
│                                                          │
│  next.config.js            ← Standalone output         │
│  package.json              ← Dependencies              │
│  tailwind.config.ts       ← Tailwind config           │
│  tsconfig.json            ← TypeScript config         │
└─────────────────────────────────────────────────────────┘
```

## 3. RTL & Typography

- **Direction:** `dir="rtl"` on root layout
- **Font:** Vazirmatn (loaded from `@/styles/fonts`)
- **Number formatting:** `Intl.NumberFormat('fa-IR')`
- **Date formatting:** Persian calendar via `Intl.DateTimeFormat('fa-IR')`

## 4. Components

### 4.1 DashboardLayout

- RTL wrapper with Vazirmatn font
- Sidebar with navigation links
- Header with Persian date range picker

### 4.2 PerformanceMetrics (KPI Cards)

Displays a grid of KPI cards:
- **Total Attempts** — count of payment attempts
- **Successful Attempts** — Verified + Paid + Reversed
- **Failed Attempts** — Failed + NoAttempt
- **Success Rate** — percentage
- **Total Amount** — Rial currency
- **Average Amount** — per successful attempt
- **Fee Share** — relative percentage (with disclaimer tooltip)

Each card includes a **"How calculated?"** info icon showing:
- Formula
- Required columns
- Limitations

### 4.3 TransactionTrends (Time-Series Chart)

- Recharts `LineChart`
- X-axis: dates (Persian format)
- Y-axis: selected metric (`attempts`, `amount`, `success_rate`)
- Metric selector dropdown
- Loading and empty states

### 4.4 MerchantRanking

- Table of top merchants by total amount
- Columns: Rank, Merchant Key, Category, Total Amount, Attempts, Success Rate
- Sortable by clicking column headers
- Paginated (20 per page)

### 4.5 PeerComparison

- Compares a selected merchant's metrics to peers in the same category
- Shows `success_rate`, `total_amount`, `avg_amount`
- Relative bars (green/red for above/below peer median)

### 4.6 Coming Soon Placeholders

Components that are **not yet implemented** and show a placeholder card:
- `DataProvenance.tsx`
- `NowruzAnalysis.tsx`
- `RecommendationPanel.tsx`

## 5. API Integration

Frontend calls the Phase 1 API at `NEXT_PUBLIC_API_URL`:

| Component | Endpoint |
|-----------|----------|
| OverviewKPICard | `GET /overview` |
| TransactionTrends | `GET /time-series` |
| MerchantRanking | `GET /merchants` |
| PeerComparison | `GET /merchants/{key}/peer-comparison` |
| Schema | `GET /schema` |
| Health | `GET /health` |

## 6. Test Plan

| Test | Description |
|------|-------------|
| `npm run build` | Production build succeeds |
| `npm run lint` | No lint errors |
| `npm run type-check` | TypeScript compiles without errors |

## 7. Running Locally

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

Environment (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 8. State Management

- No global state manager (Zustand/Jotai) — uses React Query for server state
- React Query caching: 5-minute stale time for metrics
- Error boundaries for each component
- Loading skeletons via shadcn `Skeleton`
