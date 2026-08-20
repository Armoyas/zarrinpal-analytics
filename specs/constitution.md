# ZarrinPal Analytics Dashboard - Constitution

## Project Principles
1. **Data Provenance** - Every insight must trace back to raw data
2. **Actionability First** - Insights must produce specific, measurable actions
3. **Non-Technical UX** - Merchant-friendly interface without raw data exposure
4. **Persian Localization** - Full Farsi support with Vazirmatn font (RTL)
5. **Reproducibility** - Anyone can run the project with provided setup

## Technical Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Data Processing | Python/Pandas + DuckDB | Handles 480MB CSV efficiently |
| Backend API | FastAPI | OpenAPI auto-generation, performance |
| Frontend | Next.js 14 + shadcn/ui + Tailwind | Modern, responsive, mobile-first |
| Database | PostgreSQL | Indexed queries, persistence |
| Containerization | Docker Compose | Reproducible deployment |
| Analytics | Metabase (embedded) | Traceability dashboard |

## Constraints
- `adjusted_fee` is NOT the real fee - relative comparisons only
- All amounts are in Iranian Rials
- Dataset is at payment attempt level
- Some merchants have high volume concentration
- Some columns contain null/missing values

## Success Metrics (300 Points)
| Criterion | Points |
|-----------|--------|
| Actionable & Novel Insights | 90 |
| Data Validity & Traceability | 75 |
| Analytical Depth | 60 |
| Non-Technical UX | 45 |
| Technical Quality & Execution | 30 |
| **Total** | **300** |