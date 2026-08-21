"""AI Analytics Endpoints for ZarrinPal Analytics.

Provides spending pattern analysis, risk alerts, predictive forecasts,
and anomaly detection powered by DuckDB analytics.
"""
from fastapi import APIRouter

from app.db.duckdb_database import DuckDBManager

router = APIRouter()
db = DuckDBManager()


@router.get("/insights/spending-pattern")
async def spending_pattern():
    """AI-driven spending pattern analysis."""
    return db.get_spending_patterns()


@router.get("/insights/risk-alerts")
async def risk_alerts(limit: int = 20):
    """Detect high-risk merchants based on failure rates."""
    return db.get_risk_alerts(limit)


@router.get("/insights/predictive-forecast")
async def predictive_forecast(days: int = 30):
    """Generate predictive forecast for transaction volume."""
    return db.get_predictive_forecast(days)


@router.get("/insights/anomaly-detection")
async def anomaly_detection(limit: int = 50):
    """Detect anomalous transactions using statistical thresholds."""
    return db.get_anomaly_detection(limit)


@router.get("/insights/smart-recommendations")
async def smart_recommendations(limit: int = 10):
    """Generate AI-powered smart recommendations for top merchants."""
    merchants = db.get_merchants(limit=limit)
    recommendations = []
    for m in merchants:
        profile = db.get_merchant_performance(m["merchant_key"])
        recommendations.append({
            "merchant_key": m["merchant_key"],
            "category_title": m.get("category_title", ""),
            "success_rate": m.get("success_rate", 0),
            "recommendations": profile.get("recommendations", ["No recommendations available"]),
            "performance_tier": "high" if m.get("success_rate", 0) > 85 else ("medium" if m.get("success_rate", 0) > 70 else "low"),
        })
    return recommendations
