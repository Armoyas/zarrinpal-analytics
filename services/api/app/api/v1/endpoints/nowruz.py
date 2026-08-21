"""Nowruz Analytics Endpoints for ZarrinPal Analytics.

AI-powered holiday analytics for the Persian New Year (Nowruz) period,
including predictions and gift card analysis.
"""
from fastapi import APIRouter

from app.db.duckdb_database import DuckDBManager

router = APIRouter()
db = DuckDBManager()


@router.get("/nowruz/analytics")
async def nowruz_analytics():
    """Get AI-powered Nowruz analytics and predictions."""
    return db.get_nowruz_analytics()


@router.get("/nowruz/forecast")
async def nowruz_forecast():
    """Get Nowruz forecast predictions based on current data."""
    data = db.get_nowruz_analytics()
    prediction = data.get("prediction", {})
    daily_patterns = data.get("daily_patterns", [])
    gift_card = data.get("gift_card_analysis", {})

    return {
        "forecast": prediction,
        "daily_patterns": daily_patterns,
        "gift_card_analysis": gift_card,
        "recommendation": data.get("recommendation", ""),
        "confidence": prediction.get("confidence", 0),
        "predicted_transactions": prediction.get("predicted_transactions", 0),
    }
