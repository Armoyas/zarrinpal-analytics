# Stage 6 Task Breakdown

## Task 1: Dialog UI Component
File: `frontend/components/ui/dialog.tsx`
- Self-contained CSS dialog (no @radix-ui dependency)
- Exports: Dialog, DialogContent, DialogTrigger, DialogHeader, DialogFooter

## Task 2: DashboardLayout
File: `frontend/components/layout/DashboardLayout.tsx`
- Sidebar (desktop fixed, mobile overlay)
- Header with mobile toggle
- Main content area with padding

## Task 3: MerchantSelector
File: `frontend/components/MerchantSelector.tsx`
- Dropdown with merchant list
- Props: selectedMerchant, onSelect, onRefresh, merchants

## Task 4: DateRangeFilter
File: `frontend/components/DateRangeFilter.tsx`
- Native date inputs (no react-day-picker dependency)
- Props: startDate, endDate, onChange, onClear

## Task 5: CalculationDetails
File: `frontend/components/CalculationDetails.tsx`
- Dialog showing formula breakdowns
- Props: open?, onClose?, merchantKey?, metricType?, showTooltip?

## Task 6: DataLimitationWarning
File: `frontend/components/DataLimitationWarning.tsx`
- Banner warning about sample data and adjusted-fee confidentiality

## Task 7: Dashboard Page
File: `frontend/app/dashboard/page.tsx`
- Moved from root page.tsx to /dashboard route
- Root page.tsx redirects to /dashboard

## Task 8: Documentation
- docs/demo-script.md (12-step demo)
- docs/setup.md (local + Docker setup)
- docs/api-reference.md (all endpoints)
