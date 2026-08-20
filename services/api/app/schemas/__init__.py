"""
Pydantic schemas for API request/response validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ==================== Health & Misc ====================

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


class PaginatedResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[Any]


# ==================== Merchants ====================

class MerchantBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class MerchantCreate(MerchantBase):
    id: str


class MerchantResponse(MerchantBase):
    id: str
    total_transactions: int
    total_volume: float
    avg_transaction_amount: float
    success_rate: float
    rank_volume: Optional[int] = None
    percentile_volume: Optional[float] = None
    
    class Config:
        from_attributes = True


class MerchantSummary(BaseModel):
    id: str
    name: str
    category: Optional[str]
    total_transactions: int
    total_volume: float
    avg_transaction_amount: float
    success_rate: float
    rank_volume: int
    percentile_volume: float
    trend: Optional[str] = None  # "up", "down", "stable"
    trend_pct: Optional[float] = None
    top_payment_methods: Optional[List[Dict[str, Any]]] = None


class MerchantComparison(BaseModel):
    target_merchant: MerchantSummary
    peer_merchants: List[MerchantSummary]
    category_benchmarks: Dict[str, Any]


# ==================== Analytics ====================

class TimeSeriesPoint(BaseModel):
    date: datetime
    value: float
    label: Optional[str] = None


class DashboardMetrics(BaseModel):
    total_merchants: int
    total_transactions: int
    total_volume: float
    overall_success_rate: float
    avg_adjusted_fee_share: float
    top_performers: List[MerchantResponse]


class NowruzImpact(BaseModel):
    pre_period: Dict[str, Any]
    holiday_period: Dict[str, Any]
    post_period: Dict[str, Any]
    recommendations: List[str]
    merchant_specific: Optional[Dict[str, Any]] = None


class InsightsResponse(BaseModel):
    merchant_id: str
    insights: List[Dict[str, Any]]
    data_provenance: List[Dict[str, Any]]


# ==================== Recommendations ====================

class RecommendationResponse(BaseModel):
    merchant_id: str
    recommendations: List[Dict[str, Any]]
    confidence_scores: Optional[Dict[str, float]] = None


# ==================== Reports ====================

class ReportRequest(BaseModel):
    merchant_id: str
    period: str  # e.g., "2024-01", "2024-Q1", "all"
    format: str = Field(default="pdf", pattern="^(pdf|xlsx)$")
    include: Optional[List[str]] = None  # sections to include
