# Stage 5 (Stage 6): Insights & Polish — Plan

## Approach
The frontend code is already largely implemented. This stage focuses on:
1. Verifying all components work together (imports, build)
2. Creating missing spec/plan/tasks files
3. Updating all documentation files
4. Running full validation suite
5. Pushing and creating PR

## Steps

### 1. Spec Files
- [x] Create specs/005-insights-and-polish/spec.md
- [x] Create specs/005-insights-and-polish/plan.md
- [x] Create specs/005-insights-and-polish/tasks.md

### 2. Frontend Components (verify existing + fix issues)
- [x] Verify DashboardLayout.tsx — grid with mobile sidebar drawer
- [x] Verify Header.tsx — search, theme toggle, notifications, mobile menu
- [x] Verify Sidebar.tsx — Persian nav with active states
- [x] Verify MerchantSelector.tsx — dropdown with search/refresh
- [x] Verify DateRangeFilter.tsx — calendar popover
- [x] Verify CalculationDetails.tsx — dialog with metric definitions
- [x] Verify DataLimitationWarning.tsx — compact/full banner
- [x] Verify ThemeToggle.tsx
- [x] Verify QueryProvider.tsx
- [x] Verify DashboardPage (dashboard/page.tsx) — 9 sections layout

### 3. Documentation Updates
- [ ] Update AGENTS.md
- [ ] Update README.md
- [ ] Update docs/PROJECT_HANDOFF.md
- [ ] Update docs/api-reference.md
- [ ] Update docs/metric-definitions.md
- [ ] Create docs/demo-script.md
- [ ] Create docs/setup.md
- [ ] Create PROJECT_STRUCTURE.md

### 4. Validation
- [ ] Backend tests (pytest, 43 tests)
- [ ] Frontend lint (next lint)
- [ ] Frontend typecheck (tsc --noEmit)
- [ ] Frontend build (next build)
- [ ] Docker Compose config validation (docker compose config)
- [ ] Git tracking check (no secrets, no raw CSV)

### 5. Commit & PR
- [ ] git add all
- [ ] Commit: "feat: polish RTL mobile dashboard and prepare hackathon demo"
- [ ] Push to origin stage-6 branch
- [ ] Create PR stage-6 → main
