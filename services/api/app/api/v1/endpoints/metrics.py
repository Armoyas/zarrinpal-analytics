"""Metrics Endpoints for ZarrinPal Analytics.

Provides additional metrics endpoints beyond the core API.
"""
from fastapi import APIRouter

from app.db.duckdb_database import DuckDBManager

router = APIRouter()
db = DuckDBManager()


@router.get("/metrics/status-distribution")
async def status_distribution():
    """Get distribution of session_status values."""
    return db.get_status_distribution()


@router.get("/metrics/health")
async def health_check():
    """Detailed database health metrics."""
    return db.health_check()
