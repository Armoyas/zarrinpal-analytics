# ZarrinPal Analytics Dashboard - Implementation Tasks

## Phase 1: Foundation

## Task 1.1: Project Setup
- Initialize git repository
- Create project structure:
  - `/services/api/` - FastAPI backend
  - `/services/data-processing/` - Pandas/DuckDB scripts
  - `/frontend/` - Next.js dashboard
  - `/specs/` - SDD documents
  - `/docker/` - Docker configurations
- Create .gitignore
- Create initial README.md

## Task 1.2: Backend Infrastructure
- Initialize FastAPI app with main.py
- Create requirements.txt:
  - fastapi, uvicorn, pandas, duckdb, SQLAlchemy, psycopg2-binary, pydantic, redis
- Create config.py with environment variables
- Create database.py with SQLAlchemy setup
- Create models.py with SQLAlchemy models:
  - Merchant, Transaction, AnalyticsFact, Recommendation
- Create schemas.py with Pydantic models

## Task 1.3: API Routes
- Create routers/health.py - health check endpoint
- Create routers/merchants.py - merchant CRUD + summary
- Create routers/analytics.py - dashboard analytics
- Create routers/reports.py - report generation
- Wire all routers in main.py

## Phase 2: Data Pipeline

## Task 2.1: CSV Ingestion Service
- Create services/data-processing/ingest.py
- Implement chunked CSV loading (chunksize=10000)
- Memory optimization with dtype specification
- Handle null values and data quality
- Create data cleaning functions

## Task 2.2: Processing Pipeline
- Create services/data-processing/process.py
- Load CSV into DuckDB for querying
- Create analytical views:
  - merchant_summary (total_volume, success_rate, fee_ratio)
  - daily_trends (date, merchant_id, transactions, revenue)
  - nowruz_analysis (pre/holiday/post periods)
- Export processed data to PostgreSQL

## Task 2.3: Analytics Engine
- Create services/data-processing/analytics.py
- Merchant performance ranking algorithm
- Transaction success rate analysis
- Fee-to-income ratio calculations
- Customer behavior segmentation
- Peer comparison algorithms
- Anomaly detection for fraud

## Phase 3: Frontend

## Task 3.1: Next.js Project Initialization
- npx create-next-app@latest frontend --typescript
- Install dependencies: shadcn/ui, tailwindcss, recharts, axios
- Configure tailwind.config.js with RTL support
- Add Vazirmatn font configuration
- Create layout structure

## Task 3.2: Dashboard Components
- Create components/dashboard/MerchantRanking.tsx
- Create components/dashboard/TransactionTrends.tsx
- Create components/dashboard/PerformanceMetrics.tsx
- Create components/dashboard/RecommendationPanel.tsx
- Create components/layout/Header.tsx
- Create components/layout/Sidebar.tsx
- Create components/layout/MobileNav.tsx

## Task 3.3: API Integration
- Create lib/api.ts - API client with axios
- Create hooks for API calls
- Implement loading states
- Handle error boundaries

## Phase 4: AI + Deployment

## Task 4.1: AI Features
- Create services/data-processing/recommendations.py
- Fee optimization suggestions
- Checkout performance recommendations
- Seasonal strategy recommendations
- Anomaly/fraud alerts

## Task 4.2: Docker Compose
- Create docker-compose.yml
- Configure services: api, frontend, postgres, redis
- Set up shared volumes
- Create .env.example
- Write Dockerfile for api and frontend

## Task 4.3: Testing & Documentation
- Create tests for API endpoints
- Create demo script
- Write setup.md
- Create demo video script