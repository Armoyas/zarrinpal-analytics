# Project Structure

```
analytical-dashboard/
├── .env.example              # Environment variable template
├── .gitignore                # Safe Git rules (prevents full dataset commit)
├── AGENTS.md                 # AI coding agent reference
├── README.md                 # Project overview and quick start
├── PROJECT_STRUCTURE.md      # This file
├── docker-compose.yml        # Docker Compose foundation
├── data/
│   ├── README.md             # Data directory documentation
│   ├── sample_data.csv       # Sample subset (max 100 rows, if available)
│   └── sample_10_rows.csv    # Small sample for testing
├── docs/
│   ├── data-dictionary.md    # Column-level documentation
│   ├── data-quality-report.md # Data quality findings
│   └── PROJECT_HANDOFF.md    # Stage 0 handoff summary
├── frontend/
│   └── src/
│       ├── App.tsx           # Minimal RTL startup page (Persian)
│       └── index.css         # Base styles
├── scripts/
│   ├── inspect_schema.py     # Reproducible schema inspection
│   └── validate_dataset.py   # Data validation script
├── services/
│   └── api/
│       ├── Dockerfile        # Backend container definition
│       ├── requirements.txt  # Backend Python dependencies
│       └── app/
│           └── main.py       # FastAPI app with /health endpoint
├── specs/
│   ├── constitution.md       # Project constitution (9 principles)
│   └── 000-foundation/
│       ├── spec.md           # Stage 0 specification
│       ├── plan.md           # Implementation plan
│       └── tasks.md          # Task checklist
└── tests/
    └── backend/
        └── test_placeholder.py  # Backend test placeholder
```

## Architecture Decisions

- **No PostgreSQL/SQLAlchemy:** DuckDB reads CSV directly
- **CSS framework:** Vanilla CSS with Vazirmatn font (Stage 0); Tailwind planned for later stages
- **No Metabase:** Analytics computed in backend, served via REST API
- **No authentication:** Out of scope for Stage 0
- **No full dataset commit:** `.gitignore` excludes all data files except sample subsets
