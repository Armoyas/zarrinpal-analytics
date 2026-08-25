# Stage 6 Implementation Plan

## Phase 1: UX Infrastructure

- [x] Create Dialog UI component (self-contained, no external dependencies)
- [x] Create DashboardLayout with mobile-responsive sidebar
- [x] Create Header with mobile menu toggle
- [x] Create MerchantSelector dropdown component
- [x] Create DateRangeFilter with native date inputs
- [x] Create CalculationDetails drawer/dialog
- [x] Create DataLimitationWarning banner
- [x] Refactor dashboard page to `/dashboard` route

## Phase 2: RTL and Mobile Polish

- [x] Persian number formatting in all charts and labels
- [x] RTL layout consistency across all dashboard sections
- [x] Mobile-responsive grid (1 column on mobile, 2-3 on desktop)
- [x] Sidebar navigation with mobile overlay
- [x] Skeleton loaders for all data sections
- [x] Empty / error state handling for chart components

## Phase 3: Demo Preparation

- [x] docs/demo-script.md — 12-step demo walkthrough
- [x] docs/setup.md — deployment and local setup
- [x] docs/api-reference.md — all endpoints documented

## Phase 4: Validation

- [x] Backend tests (32 passed)
- [x] Frontend type check (tsc --noEmit, 0 errors)
- [x] Frontend lint (0 errors)
- [x] Frontend build (7 routes, all static)
- [x] Docker Compose config valid
- [x] Git tracking: all new files committed
- [x] Secret-file scan: no leaks
- [x] Full dataset protection: seed script guarded

## Phase 5: Commit and Push

- [x] Commit: "feat: polish RTL mobile dashboard and prepare hackathon demo"
- [ ] Push to Armoyas/analytical-dashboard
- [ ] Create PR and merge to main
