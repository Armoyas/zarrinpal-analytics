"""API routes for ZarrinPal Analytics.

All endpoints use the REAL CSV schema:
- merchant_key (not merchant_id)
- session_status (not status)
- created_at (date column)
- amount (Rials)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from app.config import get_settings
from app.db.duckdb_database import DuckDBManager
from app.schemas import (
    HealthResponse,
    OverviewMetrics,
    MerchantOverview,
    TimeSeriesPoint,
)

from app.api.v1.endpoints.metrics import router as metrics_router
from app.api.v1.endpoints.insights import router as insights_router
from app.api.v1.endpoints.nowruz import router as nowruz_router

router = APIRouter()
router.include_router(metrics_router, tags=["metrics"])
router.include_router(insights_router, tags=["insights"])
router.include_router(nowruz_router, tags=["nowruz"])

db = DuckDBManager()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API and database health."""
    health = db.health_check()
    return HealthResponse(status="ok", detail=health)


@router.get("/schema")
async def schema():
    """Return the dataset schema."""
    return db.get_schema()


@router.get("/schema/status-distribution")
async def status_distribution():
    """Get distribution of session_status values."""
    return db.get_status_distribution()


@router.get("/overview", response_model=OverviewMetrics)
async def overview(
    start_date: Optional[str] = Query(default=None, description="ISO date: 2024-01-01"),
    end_date: Optional[str] = Query(default=None, description="ISO date: 2024-12-31"),
    merchant_key: Optional[str] = Query(default=None, description="Filter by merchant_key"),
):
    """Get overview KPIs based on confirmed CSV columns.

    Note: Rows are payment ATTEMPTS (try_seq), not unique sessions.
    Metrics are calculated using DuckDB queries on the real dataset.
    """
    return db.get_overview_metrics(start_date, end_date, merchant_key)


@router.get("/merchants", response_model=list[MerchantOverview])
async def merchants(
    limit: int = Query(default=50),
    min_attempts: int = Query(default=1),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
):
    """Get merchant rankings based on real CSV columns.

    Uses merchant_key, category_title, amount, session_status, adjusted_fee.
    """
    return db.get_merchants(limit, min_attempts, start_date, end_date)


@router.get("/merchants/{merchant_key}/peer-comparison")
async def peer_comparison(merchant_key: str):
    """Compare a merchant against its category peers.

    Uses real CSV columns: merchant_key, category_id, category_title,
    session_status, amount.
    """
    result = db.get_peer_comparison(merchant_key)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/time-series", response_model=list[TimeSeriesPoint])
async def time_series(
    metric: str = Query(default="attempts"),
    interval: str = Query(default="day"),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    merchant_key: Optional[str] = Query(default=None),
):
    """Get time series data based on real CSV columns.

    interval: day, week, month
    metric: attempts, amount, revenue, paid, failed
    """
    try:
        return db.get_time_series(metric, interval, start_date, end_date, merchant_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/time-series/daily-trends")
async def daily_trends(
    merchant_key: Optional[str] = Query(default=None),
    days: int = Query(default=90, ge=1, le=365),
):
    """Get daily volume, count, and success-rate trend.

    Default: last 90 days. Uses real CSV columns.
    """
    return db.get_daily_trends(merchant_key, days)
