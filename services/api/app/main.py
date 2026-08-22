"""
ZarinPal Analytical Dashboard API.
Stage 1: Core Merchant Overview.

Endpoints:
  GET /api/v1/health     — service health
  GET /api/v1/schema     — dataset schema info
  GET /api/v1/merchants  — merchant list with optional category filter
  GET /api/v1/overview   — overview metrics for a merchant/date range
  GET /api/v1/trends    — daily aggregation for trend charts
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse

from app.database import (
    close_db,
    get_db,
    get_daily_trends,
    get_merchants,
    get_overview_metrics,
    get_row_count,
    get_schema,
)
from app.models import (
    HealthResponse,
    MerchantsResponse,
    OverviewResponse,
    SchemaResponse,
    Traceability,
    TrendsResponse,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATA_FILE = os.environ.get("DATA_FILE", "data/sample_data.csv")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Initialize DB on startup
    try:
        get_db()
    except Exception as e:
        print(f"Warning: DB initialization failed: {e}")
    yield
    close_db()


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ZarinPal Analytical Dashboard API",
    description="Backend API for ZarinPal merchant analytics dashboard. Stage 1: Core Merchant Overview.",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    db = get_db()
    try:
        row_count = get_row_count()
        data_available = row_count > 0
    except Exception:
        data_available = False
    return HealthResponse(
        status="healthy",
        stage="1-core-overview",
        data_available=data_available,
    )


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

@app.get("/api/v1/schema", response_model=SchemaResponse)
async def schema():
    """Return dataset schema with null counts and roles."""
    db = get_db()
    columns = get_schema()
    row_count = get_row_count()
    return SchemaResponse(
        columns=columns,
        row_count=row_count,
        columns_count=len(columns),
    )


# ---------------------------------------------------------------------------
# Merchants
# ---------------------------------------------------------------------------

@app.get("/api/v1/merchants", response_model=MerchantsResponse)
async def merchants(
    category_id: Optional[int] = Query(None, description="Filter by category_id"),
):
    """Return list of merchants, optionally filtered by category."""
    merchant_list = get_merchants(category_id)
    filters = {}
    if category_id is not None:
        filters["category_id"] = str(category_id)
    traceability = Traceability(
        metric_id="merchant_list",
        definition="List of merchants with aggregate stats",
        formula="SELECT merchant_key, category_id, category_title, LIST(DISTINCT terminal_key), COUNT(*), SUM(amount), COUNT(Verified) GROUP BY merchant_key",
        source_columns=["merchant_key", "category_id", "category_title", "terminal_key", "amount", "session_status"],
        counting_unit="merchant",
        filters=filters,
        limitations="All merchants use all 3 terminals (many-to-many relationship)",
    )
    return MerchantsResponse(merchants=merchant_list, traceability=traceability)


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------

@app.get("/api/v1/overview", response_model=OverviewResponse)
async def overview(
    merchant_key: Optional[str] = Query(None, description="Merchant key to filter by"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """
    Return overview metrics for a given merchant and date range.
    If merchant_key is omitted, returns aggregate across all merchants.
    """
    # Validate date range
    if start_date and end_date:
        if start_date > end_date:
            raise HTTPException(
                status_code=400,
                detail="start_date must be before or equal to end_date",
            )

    metrics = get_overview_metrics(merchant_key, start_date, end_date)
    date_range = {"start": start_date or "1300-01-01", "end": end_date or "1450-12-30"}

    return OverviewResponse(
        merchant_key=merchant_key or "ALL",
        date_range=date_range,
        metrics=metrics,
    )


# ---------------------------------------------------------------------------
# Trends
# ---------------------------------------------------------------------------

@app.get("/api/v1/trends", response_model=TrendsResponse)
async def trends(
    merchant_key: Optional[str] = Query(None, description="Merchant key to filter by"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """
    Return daily aggregation data for trend charts.
    """
    if start_date and end_date:
        if start_date > end_date:
            raise HTTPException(
                status_code=400,
                detail="start_date must be before or equal to end_date",
            )

    daily = get_daily_trends(merchant_key, start_date, end_date)
    filters: dict = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    traceability = Traceability(
        metric_id="daily_activity_trend",
        definition="Daily aggregation of payment attempts, sessions, verified count, failed count, and total amount",
        formula="GROUP BY CAST(created_at AS DATE) → COUNT(*), COUNT(DISTINCT session_key), SUM(amount), COUNT(Verified), COUNT(Failed)",
        source_columns=["created_at", "session_key", "amount", "session_status"],
        counting_unit="row",
        filters=filters,
        limitations=None,
    )

    date_range = {"start": start_date or "1300-01-01", "end": end_date or "1450-12-30"}
    return TrendsResponse(
        merchant_key=merchant_key or "ALL",
        date_range=date_range,
        daily=daily,
        traceability=traceability,
    )
