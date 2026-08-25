# Stage 6 Plan: Final UX, Mobile, RTL, and Demo Preparation

## Objective
Complete Stage 6 — polish the dashboard for hackathon demo. Project is already
at Stage 5/6 completion. This plan tracks final validation and PR.

## Execution Steps

### Step 1-2: Core UX + Routing (completed)
- DashboardLayout, Header, Sidebar with mobile drawer
- Root page redirects to /dashboard
- MerchantSelector, DateRangeFilter, CalculationDetails, DataLimitationWarning

### Step 3: Persian RTL + Typography (completed)
- dir="rtl", Vazirmatn font, toPersianNumber(), formatCurrencyIRToman()

### Step 4: Responsive Charts (completed)
- All Recharts in ResponsiveContainer

### Step 5: State + Error Handling (completed)
- Skeleton, empty, error, Suspense

### Step 6: Validation (completed)
- Backend tests: 32 passed
- Frontend: lint, typecheck, build all pass
- Docker Compose: valid

### Step 7: Documentation (completed)
- demo-script.md, setup.md, api-reference.md, AGENTS.md, README.md, PROJECT_HANDOFF.md

### Step 8: Commit & PR (pending)
- Commit: "feat: polish RTL mobile dashboard and prepare hackathon demo"
- Push to Armoyas/analytical-dashboard, create PR
