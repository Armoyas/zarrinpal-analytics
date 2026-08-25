"""
Pydantic models for ZarinPal Analytical Dashboard API.
All responses include traceability metadata.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Traceability model
# ---------------------------------------------------------------------------

class Traceability(BaseModel):
    """Metadata explaining how a metric or dataset was calculated."""

    metric_id: str = Field(..., description="Unique identifier for the metric")
    definition: str = Field(..., description="Human-readable definition of the metric")
    formula: str = Field(..., description="Mathematical formula or SQL expression")
    source_columns: list[str] = Field(..., description="Columns from the dataset used")
    counting_unit: str = Field(
        ...,
        description="The counting unit: 'row', 'attempt', 'session', 'verified_session', 'settled_session'",
    )
    filters: dict[str, Any] = Field(default_factory=dict, description="Filters applied to the data")
    limitations: Optional[str] = Field(None, description="Any known limitations")

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Shared models
# ---------------------------------------------------------------------------

class DateRange(BaseModel):
    start: str = Field(..., description="Start date (YYYY-MM-DD)")
    end: str = Field(..., description="End date (YYYY-MM-DD)")


class MetricTrace(BaseModel):
    """A metric value with full traceability metadata."""

    metric_id: str
    label: str
    value: Any
    definition: str
    formula: str
    source_columns: list[str]
    counting_unit: str
    filters: dict[str, Any]
    limitations: Optional[str] = None


# ---------------------------------------------------------------------------
# Schema endpoint
# ---------------------------------------------------------------------------

class SchemaColumn(BaseModel):
    name: str
    type: str
    null_count: int
    null_pct: float
    role: str


class SchemaResponse(BaseModel):
    columns: list[SchemaColumn]
    row_count: int
    columns_count: int


# ---------------------------------------------------------------------------
# Merchants endpoint
# ---------------------------------------------------------------------------

class MerchantInfo(BaseModel):
    merchant_key: str
    category_id: int
    category_title: str
    terminal_keys: list[str]
    row_count: int
    total_amount: int
    verified_count: int


class MerchantsResponse(BaseModel):
    merchants: list[MerchantInfo]
    traceability: Traceability


# ---------------------------------------------------------------------------
# Overview endpoint
# ---------------------------------------------------------------------------

class OverviewResponse(BaseModel):
    merchant_key: str
    date_range: DateRange
    metrics: list[MetricTrace]


# ---------------------------------------------------------------------------
# Trends endpoint
# ---------------------------------------------------------------------------

class DailyPoint(BaseModel):
    date: str
    attempts: int
    amount: int
    sessions: int
    verified: int
    failed: int


class TrendsResponse(BaseModel):
    merchant_key: str
    date_range: DateRange
    daily: list[DailyPoint]
    traceability: Traceability


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    stage: str
    data_available: bool
