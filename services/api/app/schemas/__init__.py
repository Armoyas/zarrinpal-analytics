"""Pydantic schemas for API request/response models.

All schemas use the REAL CSV column names confirmed by schema inspection.
"""

from pydantic import BaseModel, Field
from typing import Any


class HealthResponse(BaseModel):
    status: str
    detail: dict[str, Any] | None = None


class SchemaColumn(BaseModel):
    name: str
    type: str


class SchemaResponse(BaseModel):
    columns: list[SchemaColumn]
    total_rows: int


class PaymentAttempts(BaseModel):
    total: int
    completed: int
    paid: int
    verified: int
    failed: int
    reversed: int
    no_attempt: int


class AmountInfo(BaseModel):
    total_rials: int
    avg_per_attempt_rials: float
    currency: str


class HowCalculated(BaseModel):
    total_attempts: str
    unique_sessions: str
    success_rate: str
    failure_rate: str
    total_amount: str
    avg_amount: str


class OverviewMetrics(BaseModel):
    total_attempts: int
    unique_sessions: int
    payment_attempts: PaymentAttempts
    success_rate: float
    failure_rate: float
    amount: AmountInfo
    adjusted_fee_total: int
    fee_note: str
    how_calculated: HowCalculated


class MerchantOverview(BaseModel):
    merchant_key: str
    category_title: str
    total_attempts: int
    unique_sessions: int
    paid_attempts: int
    completed_attempts: int
    failed_attempts: int
    total_amount: int
    avg_amount: float
    total_adjusted_fee: int
    success_rate_pct: float


class TimeSeriesPoint(BaseModel):
    time_period: str
    value: float


class MetricTraceability(BaseModel):
    """Traceability metadata for every metric returned by the API."""
    metric_id: str
    definition: str
    formula: str
    source_columns: list[str]
    counting_unit: str
    filters: dict[str, Any]
    limitations: list[str]


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
