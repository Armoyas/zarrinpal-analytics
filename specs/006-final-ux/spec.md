# Stage 6 — Final UX, Mobile, RTL, and Demo

## Objective

Make the application ready for hackathon demonstration. Polish the existing
dashboard with Persian RTL layout, mobile-first responsive behavior, proper
loading/empty/error states, and demo preparation materials.

## Constraints

- Do not add major new analytics.
- Do not change existing metric formulas unless a verified bug exists.
- Do not change the backend architecture.
- Do not add PostgreSQL, Metabase, authentication, or unrelated dependencies.

## UX Goals

- Persian RTL layout consistency
- Mobile-first responsive behavior
- Desktop layout refinement
- Sidebar and mobile navigation
- Responsive charts
- Persian labels and number formatting (IRR)
- Accessible color contrast
- Loading, empty, error, and skeleton states
- Tooltips and calculation dialogs
- Data provenance and adjusted-fee warning
- Filter usability
- Clear section hierarchy

## Dashboard Sections

1. Merchant overview
2. Payment activity
3. Daily/monthly/yearly analysis
4. Sales share
5. Adjusted-fee analysis
6. High-value payments
7. Merchant ranking / benchmarking
8. Actionable insights
9. Data provenance and limitations

## Demo Preparation

- docs/demo-script.md
- docs/setup.md
- docs/api-reference.md

## Validation

- Backend tests
- Frontend lint
- Frontend type checking
- Frontend build
- Docker Compose configuration validation
- Git tracking check
- Secret-file check
- Full dataset protection check
