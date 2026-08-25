# Stage 5 (Stage 6): Insights & Polish — Tasks

## Task Tracking

### Spec Files
- [x] T1: Create spec.md
- [x] T2: Create plan.md
- [x] T3: Create tasks.md

### Frontend Verification
- [ ] T4: Verify DashboardLayout imports — DashboardLayout, MobileSidebar exported
- [ ] T5: Verify Header imports — Header exported with onMobileNavOpen prop
- [ ] T6: Verify Sidebar imports — Sidebar exported, MobileNavTrigger exported
- [ ] T7: Verify MerchantSelector — uses DropdownMenu, toPersianNumber, api.getMerchants
- [ ] T8: Verify DateRangeFilter — uses Calendar, Popover, formatDate, DateRange type
- [ ] T9: Verify CalculationDetails — uses Dialog, api.getCalculationDetails
- [ ] T10: Verify DataLimitationWarning — LIMITATIONS array, compact/full modes
- [ ] T11: Verify ThemeToggle — next-themes integration
- [ ] T12: Verify QueryProvider — React Query client
- [ ] T13: Verify DashboardPage — 9 sections, all imports resolve

### Documentation
- [ ] T14: Create docs/demo-script.md (12 steps)
- [ ] T15: Create docs/setup.md
- [ ] T16: Create PROJECT_STRUCTURE.md
- [ ] T17: Update docs/api-reference.md (add Stage 5 endpoints)
- [ ] T18: Update docs/PROJECT_HANDOFF.md
- [ ] T19: Update AGENTS.md
- [ ] T20: Update README.md

### Validation
- [ ] T21: Run backend tests (pytest)
- [ ] T22: Run frontend lint (next lint)
- [ ] T23: Run frontend typecheck (tsc --noEmit)
- [ ] T24: Run frontend build (next build)
- [ ] T25: Validate Docker Compose config
- [ ] T26: Git tracking check (no secrets, no raw CSV committed)

### Commit & PR
- [ ] T27: Git add all changes
- [ ] T28: Create commit with "feat: polish RTL mobile dashboard"
- [ ] T29: Push to GitHub
- [ ] T30: Create PR stage-6 → main via mcpgit
- [ ] T31: Merge PR
- [ ] T32: Run tests on merged state

## Done Criteria
- 43+ tests passing
- Frontend build succeeds
- Docker Compose valid
- PR merged to main
- All documentation updated
