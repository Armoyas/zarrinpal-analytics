# PROJECT_STRUCTURE.md

**Last Updated:** 2026-08-22  
**Current Stage:** Stage 1 — Core Merchant Overview (Complete)

```
analytical-dashboard/
├── .env.example                          # Environment variable template
├── .gitignore                            # Excludes full dataset, allows sample
├── AGENTS.md                             # AI coding agent reference guide
├── README.md                             # Project overview
├── PROJECT_STRUCTURE.md                  # This file
├── docker-compose.yml                    # Docker Compose (api + frontend)
├── data/
│   ├── README.md                         # Data directory docs
│   ├── sample_data.csv                   # Full sample dataset (NOT committed)
│   └── sample_10_rows.csv                # Small sample for docs (committed)
├── docs/
│   ├── PROJECT_HANDOFF.md                # Stage handoff summary
│   ├── api-reference.md                  # API endpoint documentation
│   ├── data-dictionary.md                # Column-level documentation
│   ├── data-quality-report.md            # Data quality findings
│   └── schema-summary.json               # Machine-readable schema (NOT committed)
├── frontend/                             # Next.js 14 frontend
│   ├── Dockerfile                        # Multi-stage Docker build
│   ├── package.json                      # Dependencies and scripts
│   ├── tsconfig.json                     # TypeScript config (ES2020)
│   ├── tailwind.config.js                # Tailwind CSS v3 config
│   ├── postcss.config.js                 # PostCSS config
│   ├── next.config.js                    # Next.js config
│   ├── .eslintrc.json                    # ESLint config
│   ├── app/
│   │   ├── layout.tsx                    # RTL layout with Vazirmatn font
│   │   ├── page.tsx                      # Dashboard page
│   │   ├── styles/
│   │   │   └── globals.css               # Tailwind base styles
│   │   ├── components/
│   │   │   ├── AmountTrendChart.tsx      # Daily amount trend (line chart)
│   │   │   ├── CalculationDetails.tsx    # Traceability drawer
│   │   │   ├── DailyTrendChart.tsx       # Daily activity (bar chart)
│   │   │   ├── DataLimitationWarning.tsx # Data warnings
│   │   │   ├── DateRangeFilter.tsx       # Date range inputs
│   │   │   ├── KpiCard.tsx               # KPI card component
│   │   │   ├── MerchantSelector.tsx      # Merchant dropdown
│   │   │   └── types.ts                  # Frontend type definitions
│   │   └── lib/
│   │       └── api.ts                    # API client
│   └── frontend/                         # shadcn/ui-style component stubs
│       └── page.tsx                      # Minimal page (replaced by app/)
├── scripts/
│   ├── inspect_schema.py                 # Reproducible schema inspection
│   └── validate_dataset.py               # Data validation script
├── services/api/                         # Backend (FastAPI + DuckDB)
│   ├── Dockerfile                        # Python 3.11 slim
│   ├── requirements.txt                  # Python dependencies
│   ├── app/
│   │   ├── __init__.py                   # Package init
│   │   ├── database.py                   # DuckDB connection + query layer
│   │   ├── main.py                       # FastAPI app (5 endpoints)
│   │   └── models.py                     # Pydantic models + traceability
│   └── tests/
│       ├── conftest.py                   # Pytest fixtures
│       └── test_stage1_s0.py             # 27 backend tests
├── specs/
│   ├── constitution.md                   # Project constitution (9 principles)
│   ├── 000-foundation/
│   │   ├── spec.md                       # Stage 0 spec (Complete)
│   │   ├── plan.md                       # Stage 0 plan
│   │   └── tasks.md                      # Stage 0 task checklist
│   └── 001-core-overview/
│       ├── spec.md                       # Stage 1 spec (Complete)
│       ├── plan.md                       # Stage 1 plan
│       └── tasks.md                      # Stage 1 task checklist
└── tests/
    └── backend/                          # (empty — tests in services/api/tests/)
```

## Stage Completion Status

| Stage | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Advanced Analytics | ⏳ Not Started |
| 3 | Merchant Performance | ⏳ Not Started |
| 4 | Sales Share & High-Value | ⏳ Not Started |
| 5 | AI-Powered Insights | ⏳ Not Started |
