zarrinpal-analytics/
├── specs/                          # SDD specification documents
│   ├── constitution.md             # Project principles and constraints
│   ├── zarrinpal-analytics-spec.md # Full technical specification
│   ├── planning.md                  # Architecture and implementation plan
│   └── tasks.md                     # Task breakdown
├── services/
│   ├── api/                        # FastAPI backend
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py            # App entry point
│   │   │   ├── config.py          # Environment configuration
│   │   │   ├── database.py        # SQLAlchemy setup
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   │   ├── __init__.py
│   │   │   │   ├── merchant.py
│   │   │   │   ├── transaction.py
│   │   │   │   └── analytics.py
│   │   │   ├── schemas/           # Pydantic schemas
│   │   │   │   ├── __init__.py
│   │   │   │   ├── merchant.py
│   │   │   │   └── analytics.py
│   │   │   ├── routers/           # API route handlers
│   │   │   │   ├── __init__.py
│   │   │   │   ├── health.py
│   │   │   │   ├── merchants.py
│   │   │   │   └── analytics.py
│   │   │   └── services/          # Business logic
│   │   │       ├── __init__.py
│   │   │       ├── data_processor.py
│   │   │       └── analytics_engine.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── data-processing/           # Data pipeline scripts
│       ├── __init__.py
│       ├── ingest.py              # CSV loading/chunking
│       ├── process.py             # DuckDB/PostgreSQL pipeline
│       ├── analytics.py           # Analytics algorithms
│       └── recommendations.py     # AI-powered insights
├── frontend/                      # Next.js dashboard
│   ├── app/                       # App router
│   ├── components/
│   │   ├── dashboard/             # Dashboard views
│   │   ├── layout/                # Layout components
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   └── api.ts                 # API client
│   ├── public/
│   │   └── fonts/                 # Vazirmatn font files
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── next.config.mjs
│   └── tailwind.config.js
├── docker/
│   └── docker-compose.yml
├── data/
│   └── .gitkeep                   # For dataset placement
├── scripts/
│   ├── init_db.py                 # Database schema setup
│   └── run_pipeline.py           # Run data processing pipeline
├── tests/
│   ├── test_api.py
│   ├── test_analytics.py
│   └── test_ingestion.py
├── .env.example
├── .gitignore
├── README.md
└── setup.md                       # Setup instructions
