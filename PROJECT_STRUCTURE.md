# Project Structure

```
zarrinpal-analytics/                       Root directory
├── .env.example                           Environment variable template
├── .gitignore                             Excludes full dataset and secrets
├── AGENTS.md                              AI agent instructions
├── PROJECT_STRUCTURE.md                   This file
├── README.md                              Project overview and setup
├── docker-compose.yml                     Multi-service composition
├── data/                                  Dataset directory
│   ├── README.md                          Data directory documentation
│   ├── sample_10_rows.csv                 Sample data (committed, 10 rows)
│   └── sample_data.csv                    Full dataset (gitignored)
├── docs/                                  Documentation
│   ├── PROJECT_HANDOFF.md                 Stage handoff document
│   ├── data-dictionary.md                 Column definitions
│   ├── data-quality-report.md             Data quality findings
│   ├── metric-definitions.md              Metric formulas and definitions
│   └── api-reference.md                   API endpoint documentation
├── frontend/                              Next.js 14 frontend
│   ├── package.json                       Dependencies and scripts
│   ├── next.config.js                     Next.js configuration
│   ├── tsconfig.json                      TypeScript configuration
│   ├── tailwind.config.js                 Tailwind CSS configuration (RTL)
│   ├── postcss.config.js                  PostCSS configuration
│   ├── app/                               App Router (Next.js 14)
│   │   ├── layout.tsx                     Root layout (RTL, Vazirmatn)
│   │   └── dashboard/                     Dashboard page
│   │       └── page.tsx                   Main dashboard view
│   ├── components/                        React UI components
│   │   ├── ui/                            shadcn/ui primitives
│   │   │   ├── card.tsx                   Card component
│   │   │   ├── dialog.tsx                 Dialog component
│   │   │   └── button.tsx                 Button component
│   │   ├── MerchantSelector.tsx           Merchant dropdown selector
│   │   ├── DateRangeFilter.tsx            Date range picker
│   │   ├── KpiCard.tsx                    KPI metric card
│   │   ├── DailyTrendChart.tsx            Daily count bar chart
│   │   ├── AmountTrendChart.tsx           Daily amount line chart
│   │   └── CalculationDetails.tsx         Metric traceability drawer
│   ├── hooks/                             Custom hooks
│   │   ├── useApi.ts                      API client hook
│   │   └── useDashboard.ts                Dashboard state hook
│   ├── lib/                               Utilities
│   │   └── api.ts                         API client functions
│   ├── types/                             TypeScript types
│   │   └── index.ts                       Shared types
│   └── styles/                            CSS styles
│       ├── globals.css                    Global Tailwind imports
│       └── rtl.css                        RTL overrides
│   └── Dockerfile                         Multi-stage build
├── scripts/                               Utility scripts
│   ├── inspect_schema.py                  Reproducible schema inspection
│   └── validate_dataset.py                Data validation script
├── services/api/                          FastAPI backend
│   ├── app/                               Application package
│   │   ├── main.py                        FastAPI application entry
│   │   ├── config.py                      Configuration settings
│   │   ├── db/                            Database layer
│   │   │   ├── duckdb_database.py         DuckDB data manager
│   │   │   └── __init__.py
│   │   ├── models/                        Pydantic models
│   │   │   ├── __init__.py
│   │   │   └── responses.py               API response models
│   │   └── api/v1/                        API v1 routes
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── __init__.py
│   │       │   ├── health.py             Health check endpoint
│   │       │   ├── schema.py             Schema endpoint
│   │       │   ├── merchants.py          Merchant list/detail endpoints
│   │       │   └── overview.py           Overview/trends endpoints
│   │       └── api.py                    API router
│   ├── requirements.txt                   Python dependencies
│   ├── Dockerfile                         Multi-stage build
│   └── tests/                             Test suite
│       ├── conftest.py                    Test fixtures
│       ├── test_duckdb.py               Database layer tests
│       └── test_api.py                   API endpoint tests
├── specs/                                 Specifications
│   ├── constitution.md                    Project constitution
│   ├── 000-foundation/                    Stage 0: Project foundation
│   │   ├── spec.md                        Foundation spec
│   │   ├── plan.md                        Foundation plan
│   │   └── tasks.md                       Foundation tasks
│   └── 001-foundation/                    Stage 1: Core Merchant Overview
│       ├── spec.md                        Stage 1 spec (this file set)
│       ├── plan.md                        Stage 1 plan
│       └── tasks.md                       Stage 1 tasks
└── tests/                                 Root-level tests (legacy)
    └── backend/
        └── test_placeholder.py            (to be removed)

## Services (docker-compose.yml)

| Service    | Port | Description                          |
|------------|------|--------------------------------------|
| api        | 8000 | FastAPI backend (DuckDB embedded)    |
| frontend   | 3000 | Next.js 14 development server        |
```
