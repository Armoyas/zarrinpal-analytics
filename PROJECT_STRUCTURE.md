# Project Structure

```
zarrinpal-analytics/
├── AGENTS.md                              # AI agent reference instructions
├── README.md                              # Project overview and quick start
├── PROJECT_STRUCTURE.md                   # This file
├── docker-compose.yml                     # Multi-service Docker Compose
├── docker-compose.staging.yml             # Staging override
├── nginx.conf                             # Reverse proxy configuration
├── deploy.sh                              # Production deploy script
├── .env.example                           # Environment variable template
├── .gitignore                             # Excludes data/, .env, node_modules/
│
├── data/                                  # Data directory (gitignored)
│   └── README.md                          # Data generation instructions
│
├── docs/                                  # Project documentation
│   ├── PROJECT_HANDOFF.md                 # Current phase summary
│   ├── data-dictionary.md                 # Column definitions (22 columns)
│   ├── data-quality-report.md             # Missing values, distributions
│   ├── metric-definitions.md              # All metric formulas + limitations
│   ├── api-reference.md                   # Full API documentation
│   ├── demo-script.md                     # Step-by-step demo walkthrough
│   └── setup.md                           # Environment setup guide
│
├── specs/                                 # Stage-Driven Development specs
│   ├── SPEC_INDEX.md                      # Spec index
│   ├── constitution.md                    # Core principles & stage progress
│   ├── 001-foundation/                    # Stage 0: Foundation
│   ├── 001-core-merchant-overview/        # Stage 1: Core Merchant Overview
│   ├── 002-sales-share/                   # Stage 2: Sales Share & Time Analytics
│   ├── 003-adjusted-fee-analysis/         # Stage 3: Adjusted-Fee Analysis
│   ├── 004-high-value-payments/           # Stage 4: High-Value Payment Analysis
│   └── 005-insights-and-polish/           # Stage 5: Insights & UX Polish
│       ├── spec.md                        # Specification
│       ├── plan.md                        # Implementation plan
│       └── tasks.md                       # Task checklist
│
├── services/
│   ├── api/                               # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py                    # FastAPI app entry point
│   │   │   ├── config.py                  # Pydantic settings (Settings)
│   │   │   ├── db/
│   │   │   │   ├── duckdb_database.py     # DuckDBManager — all analytics
│   │   │   │   └── __init__.py
│   │   │   ├── schemas/
│   │   │   │   ├── __init__.py            # Pydantic response models
│   │   │   │   └── (models)
│   │   │   ├── api/v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py        # APIRouter — core endpoints
│   │   │   │   │   ├── metrics.py         # Metrics endpoints
│   │   │   │   │   ├── insights.py        # AI analytics endpoints
│   │   │   │   │   ├── nowruz.py          # Nowruz holiday analytics
│   │   │   │   │   └── sales.py           # Stage 2 sales share endpoints
│   │   │   └── services/
│   │   │       └── data_processor.py      # Data processing utilities
│   │   ├── Dockerfile                     # Python API Docker image
│   │   ├── requirements.txt               # Python dependencies
│   │   ├── tests/
│   │   │   ├── conftest.py                # Test fixtures (auto-generates data)
│   │   │   ├── test_duckdb.py            # DuckDB method tests (21)
│   │   │   ├── test_stage1_s0.py          # Stage 1 endpoint tests (21)
│   │   │   └── test_stage2.py            # Stage 2 endpoint tests (22)
│   │   └── uv.lock                       # Python package lock
│   │
│   └── frontend/                          # Next.js 14 dashboard
│       ├── app/
│       │   ├── layout.tsx                 # Root layout (RTL, Vazirmatn, ThemeProvider, QueryProvider)
│       │   ├── page.tsx                   # Root page → redirects to /dashboard
│       │   ├── dashboard/
│       │   │   └── page.tsx               # Main dashboard (9 sections)
│       │   ├── ai-dashboard/
│       │   │   └── page.tsx               # AI analytics dashboard
│       │   ├── nowruz-dashboard/
│       │   │   └── page.tsx               # Nowruz holiday analytics
│       │   └── merchant/
│       │       └── [key]/
│       │           └── page.tsx           # Merchant detail page
│       ├── components/
│       │   ├── layout/
│       │   │   ├── DashboardLayout.tsx    # Grid layout + MobileSidebar drawer
│       │   │   ├── Header.tsx             # TopBar (search, theme, notifications, mobile menu)
│       │   │   ├── Sidebar.tsx            # Desktop sidebar + MobileNavTrigger
│       │   │   └── ThemeToggle.tsx        # Dark/light mode toggle
│       │   ├── providers/
│       │   │   ├── ThemeProvider.tsx      # next-themes wrapper
│       │   │   └── QueryProvider.tsx      # React Query provider
│       │   ├── dashboard/
│       │   │   ├── PerformanceMetrics.tsx   # KPI cards grid
│       │   │   ├── TransactionTrends.tsx    # Daily trend chart (recharts)
│       │   │   ├── MerchantRanking.tsx      # Ranking table + chart
│       │   │   ├── PeerComparison.tsx       # Merchant vs peers
│       │   │   ├── RecommendationPanel.tsx  # AI recommendations
│       │   │   ├── AIInsightsCard.tsx       # AI pattern analysis card
│       │   │   ├── AnomalyDetector.tsx      # Anomaly detection card
│       │   │   ├── SpendingPatternsChart.tsx # Spending distribution
│       │   │   ├── RiskAlertCard.tsx        # Risk alerts
│       │   │   ├── NowruzAnalysis.tsx       # Nowruz holiday analysis
│       │   │   ├── AIChat.tsx               # AI chat interface
│       │   │   └── DataProvenance.tsx       # Dataset metadata
│       │   ├── MerchantSelector.tsx         # Merchant dropdown with search
│       │   ├── DateRangeFilter.tsx          # Calendar date range picker
│       │   ├── CalculationDetails.tsx       # Metric traceability dialog
│       │   ├── DataLimitationWarning.tsx    # Data limitations banner
│       │   └── ui/                          # shadcn/ui components
│       │       ├── badge.tsx, button.tsx, card.tsx, dialog.tsx
│       │       ├── dropdown-menu.tsx, input.tsx, progress.tsx
│       │       ├── separator.tsx, skeleton.tsx, table.tsx
│       │       ├── toast.tsx, toaster.tsx, tooltip.tsx
│       │       └── use-toast.ts
│       ├── lib/
│       │   ├── api.ts                       # API client functions
│       │   ├── query-client.ts              # React Query client
│       │   ├── utils.ts                     # Persian number, currency, date formatters
│       │   └── theme.tsx                    # Theme utilities
│       ├── styles/globals.css               # Tailwind base + custom CSS
│       ├── tailwind.config.ts              # Tailwind config (RTL, Vazirmatn, dark mode)
│       ├── postcss.config.js               # PostCSS plugin config
│       ├── next.config.js                  # Next.js config
│       ├── tsconfig.json                   # TypeScript config
│       ├── package.json                    # Dependencies + scripts
│       └── .eslintrc.json                  # ESLint config
│
├── scripts/
│   ├── seed_demo.py                        # Demo data generation (10,000 rows)
│   ├── inspect_schema.py                   # Reproducible schema inspection
│   ├── validate_dataset.py                 # Data validation checks
│   └── test_stage1.py                      # Stage 1 quick test script
│
└── .hermes/                                # Hermes agent configuration
```

## Stage Progress

| Stage | Description | Status |
|-------|-------------|--------|
| 0 | Project foundation and dataset inspection | ✅ Complete |
| 1 | Core Merchant Overview | ✅ Complete |
| 2 | Sales Share and Time-Based Analytics | ✅ Complete |
| 3 | Adjusted-Fee Analysis | ✅ Complete |
| 4 | High-Value Payment Analysis | ✅ Complete |
| 5 | AI Recommendations | ✅ Complete |
| 5/6 | Insights & UX Polish (RTL, mobile, demo prep) | ✅ Complete |
