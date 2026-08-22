# Stage 1: Core Merchant Overview — Tasks

## Task Breakdown

### Backend Tasks
1. **Schema Models**: Create Pydantic models for API responses (OverviewMetrics, TrendPoint, MerchantInfo, etc.)
2. **Database Layer**: Create DuckDB manager with query helpers for merchant overview
3. **Health Endpoint**: `GET /api/v1/health` — return service status
4. **Schema Endpoint**: `GET /api/v1/schema` — return dataset columns and types
5. **Merchant List Endpoint**: `GET /api/v1/merchants` — return merchant list with optional filtering
6. **Overview Endpoint**: `GET /api/v1/overview` — return KPI metrics for selected merchant/date range
7. **Trends Endpoint**: `GET /api/v1/trends` — return daily payment count and amount trends
8. **Merchant Detail Endpoint**: `GET /api/v1/merchants/{key}/detail` — return merchant detail metrics

### Frontend Tasks
1. **Project Structure**: Set up Next.js 14 with TypeScript, Tailwind CSS
2. **MerchantSelector**: Dropdown with search for selecting merchant
3. **DateRangeFilter**: Date range picker with preset ranges
4. **KpiCard**: Reusable card component for displaying KPI metrics
5. **DailyTrendChart**: Bar chart for daily payment activity counts
6. **AmountTrendChart**: Line chart for daily amount trends
7. **CalculationDetails**: Drawer showing metric formulas and traceability
8. **DataLimitationWarning**: Warning banner about data limitations
9. **Dashboard Page**: Main page combining all components

### Testing Tasks
1. **Test Fixtures**: Create sample 10-row CSV for testing
2. **Conftest**: Set up DuckDBManager for tests
3. **Filtering Tests**: Test merchant and date filtering
4. **Aggregation Tests**: Test amount sum/avg calculations
5. **Row Count Tests**: Test attempt/session/status counts
6. **Edge Case Tests**: Test empty results, invalid dates, division by zero
7. **Traceability Tests**: Test metadata fields in responses

### Deploy Tasks
1. **docker-compose.yml**: Add frontend service
2. **API Dockerfile**: Multi-stage build
3. **Frontend Dockerfile**: Next.js production build
4. **Environment**: Set up .env.example

### Documentation Tasks
1. **docs/data-dictionary.md**: Document all dataset columns
2. **docs/data-quality-report.md**: Document data quality findings
3. **docs/metric-definitions.md**: Define all metrics with formulas
4. **docs/api-reference.md**: Document all API endpoints
5. **docs/PROJECT_HANDOFF.md**: Project handoff document
6. **specs/constitution.md**: Project constitution with principles
7. **AGENTS.md**: AI agent instructions
8. **README.md**: Project overview and setup instructions

## Completed
- [x] All backend tasks
- [x] All frontend tasks
- [x] All testing tasks
- [x] All deploy tasks
- [x] All documentation tasks

## Next: Stage 2 Tasks
- Merchant sales share
- Category sales share
- Monthly/yearly activity
- Top merchants ranking
