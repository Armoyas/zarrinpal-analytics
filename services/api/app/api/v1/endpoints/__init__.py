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
from app.api.v1.endpoints.sales import router as sales_router

router = APIRouter()
router.include_router(metrics_router, tags=["metrics"])
router.include_router(insights_router, tags=["insights"])
router.include_router(nowruz_router, tags=["nowruz"])
router.include_router(sales_router, tags=["sales"])

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


@router.get("/overview")
async def overview(
    start_date: Optional[str] = Query(default=None, description="ISO date: 2024-01-01"),
    end_date: Optional[str] = Query(default=None, description="ISO date: 2024-12-31"),
    merchant_key: Optional[str] = Query(default=None, description="Filter by merchant_key"),
):
    """Get overview KPIs based on confirmed CSV columns.

    Note: Rows are payment ATTEMPTS (try_seq), not unique sessions.
    Metrics are calculated using DuckDB queries on the real dataset.
    """
    result = db.get_overview_metrics(start_date, end_date, merchant_key)
    # Ensure all numeric values are non-None for consistent responses
    if result.get("amount"):
        result["amount"]["total_rials"] = int(result["amount"].get("total_rials") or 0)
        result["amount"]["avg_per_attempt_rials"] = int(result["amount"].get("avg_per_attempt_rials") or 0)
    if result.get("payment_attempts"):
        for k in ["total", "completed", "paid", "verified", "failed", "reversed", "no_attempt"]:
            if k in result["payment_attempts"]:
                result["payment_attempts"][k] = int(result["payment_attempts"].get(k) or 0)
    result["adjusted_fee_total"] = int(result.get("adjusted_fee_total") or 0)
    return result


@router.get("/merchants")
async def merchants(
    limit: int = Query(default=50),
    min_attempts: int = Query(default=1),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    category_id: Optional[str] = Query(default=None, description="Filter by category_id"),
):
    """Get merchant rankings based on real CSV columns.

    Uses merchant_key, category_title, amount, session_status, adjusted_fee.
    """
    return db.get_merchants(limit, min_attempts, start_date, end_date, category_id)


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


@router.get("/merchants/{merchant_key}")
async def merchant_detail(
    merchant_key: str,
    start_date: Optional[str] = Query(default=None, description="ISO date: 2024-01-01"),
    end_date: Optional[str] = Query(default=None, description="ISO date: 2024-12-31"),
):
    """Get comprehensive merchant detail with drill-down metrics.

    Returns overview stats, status breakdown, amount distribution,
    time trends, and comparison with category peers + overall average.
    """
    result = db.get_merchant_detail(merchant_key, start_date, end_date)
    if not result.get("total_attempts", 0) and not result.get("error"):
        raise HTTPException(status_code=404, detail=f"Merchant {merchant_key} not found")
    return result


@router.get("/categories")
async def categories():
    """Get all merchant categories with aggregated metrics."""
    return db.get_category_analysis()


@router.get("/categories/distribution")
async def category_distribution():
    """Get category distribution with share percentages."""
    return db.get_category_distribution()


@router.get("/categories/{category_id}")
async def category_detail(category_id: str):
    """Get detailed category analysis with time series."""
    return db.get_category_analysis(category_id)


@router.get("/high-value/analysis")
async def high_value_analysis(threshold: int = 10000000):
    """Analyze high-value payments above a configurable threshold (IRR)."""
    return db.get_high_value_analysis(threshold)


@router.get("/status-distribution/by-date")
async def status_distribution_by_date(
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
):
    """Get daily attempt counts grouped by session status."""
    return db.get_status_distribution_by_date(start_date, end_date)


@router.get("/ai/chat")
async def ai_chat(
    query: str = Query(default="", description="Natural language question about the data"),
    merchant_key: Optional[str] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
):
    """AI-powered chat assistant for payment analytics.

    Generates natural language insights based on deterministic backend metrics.
    Never invents data - all responses are grounded in actual DuckDB queries.
    """
    insights = []

    # Get relevant data based on query context
    overview = db.get_overview_metrics()
    merchants = db.get_merchants(limit=5)
    spending = db.get_spending_patterns()

    # Determine query intent and generate evidence-based response
    query_lower = (query or "").lower()

    response_parts = []

    if not query_lower or query_lower in ("help", "stats", "overview"):
        response_parts.append(f"کل داده: {overview.get('total_attempts', 0):,} تلاش پرداخت با نرخ موفقیت {overview.get('success_rate', 0):.1f}%")
        response_parts.append(f"مجموع مبالغ: {overview.get('amount', {}).get('total_rials', 0):,} ریال")
        response_parts.append(f"کارمزد تنظیم‌شده: {overview.get('adjusted_fee_total', 0):,} (نمایانگر نسبی، نه کارمزد واقعی)")
        response_parts.append(f"فروشگاه‌های فعال: {len(merchants)}")

    # Pattern-based insights
    for pattern in spending.get("patterns", []):
        response_parts.append(f"🔎 {pattern['description']} (اعتماد: {pattern['confidence']}%)")

    # Merchant-specific
    if merchant_key:
        detail = db.get_merchant_detail(merchant_key)
        response_parts.append(f"فروشگاه {merchant_key}: {detail.get('total_attempts', 0)} تلاش، نرخ موفقیت {detail.get('success_rate', 0):.1f}%")

    # Risk alerts
    alerts = db.get_risk_alerts(limit=5)
    if alerts:
        response_parts.append(f"⚠️ {len(alerts)} فروشگاه با ریسک بالا شناسایی شد")

    # Anomalies
    anomalies = db.get_anomaly_detection(limit=5)
    if anomalies:
        response_parts.append(f"🔍 {len(anomalies)} ناهنجاری در معاملات ثبت شده")

    # Nowruz analytics
    if "nowruz" in query_lower or "نوروز" in query_lower:
        nowruz = db.get_nowruz_analytics()
        response_parts.append(f"پیش‌بینی نوروز: {nowruz.get('prediction', {}).get('predicted_transactions', 0):,} تراکنش")
        response_parts.append(f"افزایش درآمد پیش‌بینی شده: +{nowruz.get('prediction', {}).get('expected_revenue_increase_pct', 0):.1f}%")
        response_parts.append(nowruz.get("recommendation", ""))

    if not response_parts:
        response_parts.append("سؤال شما در مورد داده‌های پرداخت شما بررسی شود. موارد قابل پرسش: الگوهای مصرف، ریسک‌ها، پیش‌بینی، نوروز، یا جزئیات فروشگاه خاص.")

    return {
        "query": query,
        "response": " | ".join(response_parts),
        "insights": insights,
        "data_sources": ["payments"],
        "disclaimer": "تمام پیامدها بر پایه متریک‌های دترمینیستی از DuckDB استخراج شده‌اند. هیچ داده‌ای ساختگی نشده است.",
    }
