# ZarrinPal Analytics Dashboard - Specification

## 1. Purpose
Build an interactive merchant analytics dashboard analyzing ZarrinPal's payment transaction dataset (480MB CSV) to deliver actionable insights for merchants.

## 2. Scope

### In Scope
- CSV data ingestion pipeline (480MB optimized)
- Transaction data processing and indexing
- Merchant performance analytics with ranking
- Seasonal/holiday impact analysis (Nowruz focus)
- Customer behavior segmentation
- Peer comparison for merchants
- AI-powered recommendations
- Export to PDF/XLSX
- Mobile-responsive dashboard
- Persian (Farsi) localization with Vazirmatn font
- Data provenance/traceability system

### Out of Scope
- Real-time transaction processing
- Actual fee calculations (adjusted_fee is obfuscated)
- Payment gateway integration
- User authentication beyond demo

## 3. User Stories

### Primary User: ZarrinPal Merchant (Non-technical)
```
As a merchant using ZarrinPal for payments,
I want to see an analytical dashboard with actionable insights
So that I can optimize my business performance
```

### Specific Stories:
1. As a merchant, I want to see my transaction success rate trend so I can identify issues
2. As a merchant, I want to compare my performance against similar merchants in my category
3. As a merchant, I want to see Nowruz impact on my sales so I can plan seasonal strategies
4. As a merchant, I want actionable recommendations to improve my checkout performance
5. As a merchant, I want to export reports for my team meetings

## 4. Functional Requirements

### 4.1 Data Pipeline
- Load CSV with chunked processing for memory efficiency
- Store in DuckDB for fast analytical queries
- Index data by merchant, date, transaction status
- Handle null values and data quality issues

### 4.2 API Endpoints
```
GET /api/v1/health
GET /api/v1/merchants
GET /api/v1/merchants/{id}/summary
GET /api/v1/analytics/dashboard?merchant_id=..&period=..
GET /api/v1/analytics/nowruz-impact
GET /api/v1/analytics/comparisons
GET /api/v1/recommendations/{merchant_id}
POST /api/v1/reports/generate
```

### 4.3 Frontend Features
- Dashboard widgets (KPI cards, trend charts, heatmaps)
- Merchant selection with auto-suggest
- Date range picker with Persian calendar support
- Nowruz seasonal analysis view
- AI recommendations panel
- Export controls (PDF, XLSX)
- Mobile navigation drawer

## 5. Non-Functional Requirements
- Dashboard loads in < 3 seconds
- API responses in < 500ms
- Mobile-first responsive design
- Persian language support (RTL)
- Accessible (WCAG 2.1 AA compliance)
- Containerized deployment with Docker Compose

## 6. Assumptions
- Dataset is available at fixed CSV path
- adjusted_fee uses unknown multiplication coefficient (only relative comparisons valid)
- Merchants are categorized by business type in dataset metadata
- Nowruz dates: March 20-23 annually (approximate)