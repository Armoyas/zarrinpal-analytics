# Stage 6 Demo Script — Final UX, Mobile, RTL

## Prerequisites
- Docker Compose installed
- Port 80 available
- Terminal with curl

## Setup
```bash
cd services/api
PYTHONPATH=.:./app/db python -m pytest tests/ -q  # 43 tests pass
# Frontend type check
cd ../frontend && npx tsc --noEmit  # passes
# Start services
cd /root/zp-project
docker compose up --build -d
```

Open `http://localhost` — dashboard auto-redirects to `/dashboard`.

## Demo Flow (12 steps)

### 1. Merchant Selection
- Use the MerchantSelector in the top-right of the Header bar
- Search for "M1" — selects the merchant and updates all sections

### 2. Date Filtering
- Use the DateRangeFilter next to merchant selector
- Pick "Last 7 days" — all time-based charts update

### 3. Overview KPIs
- Hero section at the top shows: Total Attempts, Total Revenue (IRR), Success Rate %, Avg Adjust Fee
- Click the "How was this calculated?" info icon on any card for formula breakdown

### 4. Daily/Monthly/Yearly Analysis
- Scroll to "Payment Activity" section
- Bar chart shows daily transaction volume
- Toggle between daily/monthly/yearly tabs via the segment control

### 5. Sales Share
- "Sales Share" card — pie chart of card payment methods (card1, card2, etc.)

### 6. Adjusted-Fee Analysis
- "Adjusted Fee" section — waterfall showing fee calculation
- Warning banner appears if adjusted_fee confidentiality-scaled values are present

### 7. High-Value Threshold Analysis
- "High-Value Payments" table — transactions above 5,000,000 IRR
- Columns: Session Key, Amount, Adjusted Fee, Status

### 8. Merchant Comparison
- "Merchant Ranking" table — ranked by total transaction volume
- Use the comparison toggle to view M1 vs M2 side-by-side

### 9. Actionable Insights
- "Insights" section — AI-generated recommendations
- Shows: top spending patterns, anomaly alerts, optimization suggestions

### 10. Calculation Details
- Click the question-mark icon (HelpCircle) next to any metric
- "How was this calculated?" dialog slides up from the bottom
- Shows formula, source table columns, and sample values

### 11. Mobile Layout
- Use browser dev tools (Ctrl+Shift+M) to toggle to mobile
- Sidebar collapses to hamburger menu (top-left)
- Tap hamburger — slide-out navigation appears with full menu
- DashboardLayout uses CSS grid that reflows to single column on mobile

### 12. Data Limitations
- Yellow warning banner at the bottom of the dashboard
- States: adjusted_fee is confidentiality-scaled; no PII data; 10,000 row sample
- Click "View Details" for full list of limitations

## API Reference (key endpoints)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/overview` | GET | Merchant overview metrics |
| `/api/v1/time-series` | GET | Daily/monthly/yearly trends |
| `/api/v1/merchants` | GET | Merchant list with filters |
| `/api/v1/sales/share` | GET | Sales share by category |
| `/api/v1/sales/activity/daily` | GET | Daily transaction volume |
| `/api/v1/sales/calculation-details` | GET | Formula breakdown |

## Troubleshooting
- If charts show empty: check that the seed data loaded (`services/api/data/sessions.csv` > 10k rows)
- If RTL renders incorrectly: verify `lang="fa"` is set on `<html>` in layout
- If Docker build fails: ensure port 80 is free
