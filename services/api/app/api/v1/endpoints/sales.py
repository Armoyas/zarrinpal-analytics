"""
Stage 2 API endpoints: Sales Share and Time-Based Analytics.

All endpoints return traceability metadata (how_calculated, formulas, counting_unit).
Reuses the shared DuckDBManager singleton from app/api/v1/endpoints/__init__.py.
"""
from typing import Optional

from fastapi import APIRouter, Query
from starlette.concurrency import run_in_threadpool

# Reuse the existing db singleton from __init__.py
from app.api.v1.endpoints import db

router = APIRouter(tags=["stage-2-sales-share"])


@router.get("/sales/share")
async def sales_share(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant_key"),
    category_id: Optional[str] = Query(None, description="Filter by category_id"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Merchant and category sales share with traceability.

    **Sales (Stage 2)** = SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')

    Returns both `merchant_sales_share` and `category_sales_share` arrays,
    each with share percentages and rank, plus a `how_calculated` block.
    """
    return await run_in_threadpool(
        db.get_sales_share,
        start_date=start_date, end_date=end_date,
        merchant_key=merchant_key, category_id=category_id,
    )


@router.get("/activity/daily")
async def activity_daily(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Daily activity trend with previous-period comparison."""
    return await run_in_threadpool(
        db.get_activity_daily,
        merchant_key=merchant_key, category_id=category_id,
        start_date=start_date, end_date=end_date,
    )


@router.get("/activity/monthly")
async def activity_monthly(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Monthly activity trend with previous-period comparison."""
    return await run_in_threadpool(
        db.get_activity_monthly,
        merchant_key=merchant_key, category_id=category_id,
        start_date=start_date, end_date=end_date,
    )


@router.get("/activity/yearly")
async def activity_yearly(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Yearly activity trend with previous-period comparison."""
    return await run_in_threadpool(
        db.get_activity_yearly,
        merchant_key=merchant_key, category_id=category_id,
        start_date=start_date, end_date=end_date,
    )


@router.get("/merchants/ranking")
async def merchants_ranking(
    sort_by: str = Query("amount", regex=r"^(amount|count)$", description="Sort by: amount or count"),
    limit: int = Query(10, ge=1, le=100, description="Results to return (1-100)"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Top merchants by amount or count, with highest activity day/month/year."""
    return await run_in_threadpool(
        db.get_merchant_ranking,
        sort_by=sort_by, limit=limit,
        start_date=start_date, end_date=end_date,
    )


@router.get("/activity/highest-day")
async def highest_activity_day(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Returns the single day with the highest payment attempt count."""
    return await run_in_threadpool(
        db.get_highest_activity_day,
        merchant_key=merchant_key, start_date=start_date, end_date=end_date,
    )


@router.get("/activity/highest-month")
async def highest_activity_month(
    merchant_key: Optional[str] = Query(None, description="Filter by merchant"),
    start_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO date: YYYY-MM-DD"),
):
    """Returns the single month with the highest payment attempt count."""
    return await run_in_threadpool(
        db.get_highest_activity_month,
        merchant_key=merchant_key, start_date=start_date, end_date=end_date,
    )


@router.get("/calculation-details")
async def calculation_details():
    """Returns all metric definitions with traceability metadata."""
    return await run_in_threadpool(db.get_calculation_details)
