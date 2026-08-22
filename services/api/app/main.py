"""
ZarinPal Analytical Dashboard API.

Endpoints:
  Stage 1 (Core Merchant Overview):
    GET /api/v1/health     — service health
    GET /api/v1/schema     — dataset schema info
    GET /api/v1/merchants  — merchant list with optional category filter
    GET /api/v1/overview   — overview metrics for a merchant/date range
    GET /api/v1/trends    — daily aggregation for trend charts

  Stage 2 (Sales Share & Time-Based Analytics):
    GET /api/v1/sales/share       — merchant/category sales share
    GET /api/v1/activity/daily     — daily payment count + amount trend
    GET /api/v1/activity/monthly   — monthly payment count + amount trend
    GET /api/v1/activity/yearly    — yearly payment count + amount trend
    GET /api/v1/merchants/ranking — top merchants by amount or count
    GET /api/v1/activity/peak-day  — highest activity day
    GET /api/v1/activity/peak-month — highest activity month
    GET /api/v1/comparison        — previous-period comparison

  Stage 3 (Adjusted-Fee Analysis):
    GET /api/v1/adjusted-fee     — aggregate adjusted-fee indicator metrics
    GET /api/v1/adjusted-fee/trend   — trend over time
    GET /api/v1/adjusted-fee/merchants — by merchant
    GET /api/v1/adjusted-fee/categories — by category
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    close_db,
    get_adjusted_fee_by_category,
    get_adjusted_fee_by_merchant,
    get_adjusted_fee_metrics,
    get_adjusted_fee_trend,
    get_daily_activity,
    get_daily_trends,
    get_db,
    get_highest_activity_day,
    get_highest_activity_month,
    get_merchant_ranking,
    get_merchants,
    get_monthly_activity,
    get_overview_metrics,
    get_previous_period_comparison,
    get_row_count,
    get_sales_share,
    get_schema,
    get_yearly_activity,
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
    description="Backend API for ZarinPal merchant analytics dashboard.",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Stage 1 — Core Merchant Overview
# ---------------------------------------------------------------------------

@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    try:
        row_count = get_row_count()
        data_available = row_count > 0
    except Exception:
        data_available = False
    return HealthResponse(
        status="healthy",
        stage="3-adjusted-fee",
        data_available=data_available,
    )


@app.get("/api/v1/schema", response_model=SchemaResponse)
async def schema():
    """Return dataset schema with null counts and roles."""
    columns = get_schema()
    row_count = get_row_count()
    return SchemaResponse(
        columns=columns,
        row_count=row_count,
        columns_count=len(columns),
    )


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
        formula="SELECT merchant_key, category_id, category_title, LIST(DISTINCT terminal_key), "
                "COUNT(*), SUM(amount), COUNT(Verified) GROUP BY merchant_key, category_id, category_title",
        source_columns=["merchant_key", "category_id", "category_title", "terminal_key", "amount", "session_status"],
        counting_unit="merchant",
        filters=filters,
        limitations="All merchants use all 3 terminals (many-to-many relationship)",
    )
    return MerchantsResponse(merchants=merchant_list, traceability=traceability)


@app.get("/api/v1/overview", response_model=OverviewResponse)
async def overview(
    merchant_key: Optional[str] = Query(None, description="Merchant key to filter by"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """Return overview metrics for a given merchant and date range."""
    if start_date and end_date and start_date > end_date:
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


@app.get("/api/v1/trends", response_model=TrendsResponse)
async def trends(
    merchant_key: Optional[str] = Query(None, description="Merchant key to filter by"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """Return daily aggregation data for trend charts."""
    if start_date and end_date and start_date > end_date:
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
        formula="GROUP BY CAST(created_at AS DATE) → COUNT(*), COUNT(DISTINCT session_key), "
                "SUM(amount), COUNT(Verified), COUNT(Failed)",
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


# ---------------------------------------------------------------------------
# Stage 2 — Sales Share & Time-Based Analytics
# ---------------------------------------------------------------------------

@app.get("/api/v1/sales/share")
async def sales_share(
    group_by: str = Query("merchant", description="Group by 'merchant' or 'category'"),
    merchant_key: Optional[str] = Query(None, description="Optional merchant filter"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """
    Return sales share by merchant or category.

    Sales Definition (Stage 2):
      Sales = SUM(amount) WHERE session_status IN ('Verified', 'Paid', 'Reversed')
      These represent completed/successful payment outcomes.
      This is DIFFERENT from Stage 1 total_amount (which sums ALL rows).
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    data = get_sales_share(merchant_key, start_date, end_date, group_by)
    return data


@app.get("/api/v1/activity/daily")
async def activity_daily(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return daily payment count trend (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_daily_activity(merchant_key, start_date, end_date)


@app.get("/api/v1/activity/monthly")
async def activity_monthly(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return monthly payment count trend (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_monthly_activity(merchant_key, start_date, end_date)


@app.get("/api/v1/activity/yearly")
async def activity_yearly(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return yearly payment count trend (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_yearly_activity(merchant_key, start_date, end_date)


@app.get("/api/v1/merchants/ranking")
async def merchant_ranking(
    by: str = Query("amount", description="Rank by 'amount' or 'count'"),
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return merchant rankings by amount or count (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_merchant_ranking(by, merchant_key, start_date, end_date)


@app.get("/api/v1/activity/peak-day")
async def peak_day(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return the day with the highest activity (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_highest_activity_day(merchant_key, start_date, end_date)


@app.get("/api/v1/activity/peak-month")
async def peak_month(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Return the month with the highest activity (Stage 2)."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    return get_highest_activity_month(merchant_key, start_date, end_date)


@app.get("/api/v1/comparison")
async def period_comparison(
    merchant_key: Optional[str] = Query(None),
):
    """Compare current period vs previous period (Stage 2)."""
    return get_previous_period_comparison(merchant_key)


# ---------------------------------------------------------------------------
# Stage 3 — Adjusted-Fee Analysis
# ---------------------------------------------------------------------------

ADJUSTED_FEE_WARNING = (
    "adjusted_fee is a CONFIDENTIALITY-ADJUSTED FEE INDICATOR, NOT the actual "
    "ZarinPal fee. It was derived using a constant scaling factor and cannot "
    "represent real pricing. Relative comparisons within the dataset may remain valid. "
    "Never present it as the actual ZarinPal fee or real commission."
)


@app.get("/api/v1/adjusted-fee")
async def adjusted_fee(
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """
    Return aggregate adjusted-fee indicator metrics.

    ⚠️ CRITICAL: adjusted_fee is a CONFIDENTIALITY-ADJUSTED FEE INDICATOR,
    not the actual ZarinPal fee. All outputs are clearly labeled.
    Absolute values are NOT real pricing. Relative comparisons may be valid.
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )
    data = get_adjusted_fee_metrics(merchant_key, start_date, end_date)
    data["warning_en"] = ADJUSTED_FEE_WARNING
    data["warning_fa"] = (
        "شاخص کارمزد تعدیلشده برای مقایسه نسبی — این مقدار هزینه واقعی زرین‌پال نیست. "
        "مقادیر مطلق قابل اطمینان نیستند؛ مقایسه‌های نسبی ممکن است معتبر باشند."
    )
    return data


@app.get("/api/v1/adjusted-fee/trend")
async def adjusted_fee_trend(
    interval: str = Query("month", description="Interval: day, month, or year"),
    merchant_key: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """
    Return adjusted-fee indicator trend over time.

    ⚠️ CRITICAL: adjusted_fee is NOT the actual ZarinPal fee.
    """
    data = get_adjusted_fee_trend(merchant_key, interval)
    data["warning_en"] = ADJUSTED_FEE_WARNING
    data["warning_fa"] = (
        "شاخص کارمزد تعدیلشده برای مقایسه نسبی — این مقدار هزینه واقعی زرین‌پال نیست."
    )
    return data


@app.get("/api/v1/adjusted-fee/merchants")
async def adjusted_fee_merchants(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """
    Return adjusted-fee indicator by merchant.

    ⚠️ CRITICAL: adjusted_fee is NOT the actual ZarinPal fee.
    """
    data = get_adjusted_fee_by_merchant(start_date, end_date)
    data["warning_en"] = ADJUSTED_FEE_WARNING
    data["warning_fa"] = (
        "شاخص کارمزد تعدیلشده برای مقایسه نسبی — این مقدار هزینه واقعی زرین‌پال نیست."
    )
    return data


@app.get("/api/v1/adjusted-fee/categories")
async def adjusted_fee_categories(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """
    Return adjusted-fee indicator by category.

    ⚠️ CRITICAL: adjusted_fee is NOT the actual ZarinPal fee.
    """
    data = get_adjusted_fee_by_category(start_date, end_date)
    data["warning_en"] = ADJUSTED_FEE_WARNING
    data["warning_fa"] = (
        "شاخص کارمزد تعدیلشده برای مقایسه نسبی — این مقدار هزینه واقعی زرین‌پال نیست."
    )
    return data
