"""
API route handlers for analytics operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional
from sqlalchemy import func

from database import get_db
from models import Merchant, AnalyticsFact, Recommendation
from schemas import (
    DashboardMetrics,
    NowruzImpact,
    InsightsResponse,
    RecommendationResponse,
    ReportRequest,
)

router = APIRouter(tags=["analytics"])


@router.get("/analytics/dashboard/{merchant_id}", response_model=InsightsResponse)
async def get_merchant_dashboard(
    merchant_id: str,
    period: str = Query(default="30d", pattern="^(7d|30d|90d|all)$"),
    db: Session = Depends(get_db),
):
    """Get dashboard analytics for a specific merchant with traceable insights."""
    
    # Validate merchant exists
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Calculate period dates
    end_date = datetime.utcnow()
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    else:
        start_date = merchant.created_at or datetime(2024, 1, 1)
    
    # Get analytics facts for merchant in period
    facts = db.query(AnalyticsFact).filter(
        AnalyticsFact.merchant_id == merchant_id,
        AnalyticsFact.date >= start_date,
        AnalyticsFact.date <= end_date,
    ).all()
    
    # Build insights
    insights = []
    data_provenance = []
    
    # Insight: Transaction trend
    daily_facts = sorted(facts, key=lambda f: f.date)
    if len(daily_facts) >= 2:
        first = daily_facts[0]
        last = daily_facts[-1]
        trend_pct = ((last.success_rate - first.success_rate) / first.success_rate * 100) if first.success_rate > 0 else 0
        
        insights.append({
            "type": "trend",
            "title": "Transaction Success Rate Trend",
            "description": f"Success rate {'increased' if trend_pct > 0 else 'decreased'} by {abs(trend_pct):.1f}% over the {period} period.",
            "value": trend_pct,
            "recommendation": "Monitor trends and investigate sudden drops." if trend_pct < -5 else None,
        })
        data_provenance.append({
            "insight": "Transaction Success Rate Trend",
            "source": "analytics_facts table",
            "calculation": "((last_period - first_period) / first_period) * 100",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        })
    
    # Insight: Fee efficiency (using adjusted_fee, noting it's relative)
    avg_fee_share = sum(f.total_adjusted_fee for f in facts) / sum(f.total_volume for f in facts) if facts else 0
    insights.append({
        "type": "fee_efficiency",
        "title": "Fee Efficiency vs Peers",
        "description": f"Your adjusted fee share is {avg_fee_share*100:.2f}% of transaction volume.",
        "value": avg_fee_share,
        "note": "Note: adjusted_fee is obfuscated - relative comparisons only",
        "recommendation": "Compare with category average. Higher ratios may indicate room for fee optimization." if avg_fee_share > 0.03 else None,
    })
    data_provenance.append({
        "insight": "Fee Efficiency",
        "source": "analytics_facts.total_adjusted_fee / analytics_facts.total_volume",
        "calculation": "sum(adjusted_fee) / sum(total_volume) for period",
        "caution": "adjusted_fee is obfuscated per ZarrinPal policy",
    })
    
    return InsightsResponse(
        merchant_id=merchant_id,
        insights=insights,
        data_provenance=data_provenance,
    )


@router.get("/analytics/nowruz-impact/{merchant_id}", response_model=NowruzImpact)
async def get_nowruz_impact(
    merchant_id: str,
    year: int = Query(default=datetime.now().year),
    db: Session = Depends(get_db),
):
    """Analyze Nowruz (Persian New Year) impact on merchant transactions."""
    
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Nowruz period: approximately March 20-April 2
    nowruz_start = date(year, 3, 20)
    pre_start = nowruz_start - timedelta(days=14)
    post_end = nowruz_start + timedelta(days=14)
    
    def get_period_stats(start, end):
        facts = db.query(AnalyticsFact).filter(
            AnalyticsFact.merchant_id == merchant_id,
        ).all()
        filtered = [f for f in facts if start <= f.date.date() <= end] if facts else []
        return {
            "period_start": start.isoformat(),
            "period_end": end.isoformat(),
            "transactions": sum(f.transaction_count for f in filtered),
            "successful": sum(f.successful_count for f in filtered),
            "total_volume": sum(f.total_volume for f in filtered),
            "avg_transaction": sum(f.total_volume for f in filtered) / sum(f.transaction_count for f in filtered) if sum(f.transaction_count for f in filtered) > 0 else 0,
            "success_rate": sum(f.successful_count for f in filtered) / sum(f.transaction_count for f in filtered) if sum(f.transaction_count for f in filtered) > 0 else 0,
        }
    
    pre_stats = get_period_stats(pre_start, nowruz_start - timedelta(days=1))
    holiday_stats = get_period_stats(nowruz_start, nowruz_start + timedelta(days=13))
    post_stats = get_period_stats(post_end - timedelta(days=14), post_end)
    
    # Generate seasonal recommendations
    recommendations = []
    if holiday_stats["transactions"] > pre_stats["transactions"] * 1.2:
        recommendations.append(
            f"Nowruz increased your transaction volume by "
            f"{((holiday_stats['transactions'] / pre_stats['transactions'] - 1) * 100):.1f}%"
        )
    if holiday_stats["success_rate"] < pre_stats["success_rate"] * 0.9:
        recommendations.append("Success rate dropped during Nowruz - consider extra support staffing")
    
    return NowruzImpact(
        pre_period=pre_stats,
        holiday_period=holiday_stats,
        post_period=post_stats,
        recommendations=recommendations,
    )


@router.get("/analytics/recommendations/{merchant_id}", response_model=RecommendationResponse)
async def get_recommendations(
    merchant_id: str,
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get AI-powered recommendations for a merchant."""
    
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    recs = db.query(Recommendation).filter(
        Recommendation.merchant_id == merchant_id,
    ).order_by(Recommendation.priority).limit(limit).all()
    
    return RecommendationResponse(
        merchant_id=merchant_id,
        recommendations=[{
            "type": r.recommendation_type,
            "title": r.title,
            "description": r.description,
            "priority": r.priority,
            "action_url": r.action_url,
            "data_reference": r.data_reference,
        } for r in recs],
        confidence_scores={},
    )


@router.post("/reports/generate")
async def generate_report(
    request: ReportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Generate a PDF or XLSX report for a merchant."""
    
    # Validate merchant exists
    merchant = db.query(Merchant).filter(Merchant.id == request.merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # For now, return a placeholder - the actual generation would be a background task
    return {
        "report_id": f"report_{request.merchant_id}_{datetime.utcnow().timestamp()}",
        "merchant_id": request.merchant_id,
        "format": request.format,
        "status": "queued",
        "message": "Report generation started. Check back later for download link.",
    }


@router.get("/analytics/metrics/summary")
async def get_marketplace_metrics(
    db: Session = Depends(get_db),
):
    """Get high-level marketplace metrics for the dashboard landing page."""
    
    total_merchants = db.query(func.count(Merchant.id)).scalar()
    total_transactions = db.query(func.sum(Merchant.total_transactions)).scalar() or 0
    total_volume = db.query(func.sum(Merchant.total_volume)).scalar() or 0
    overall_success = db.query(func.avg(Merchant.success_rate)).scalar() or 0
    
    top_merchants = db.query(Merchant).order_by(
        desc(Merchant.total_volume)
    ).limit(10).all()
    
    return DashboardMetrics(
        total_merchants=total_merchants,
        total_transactions=total_transactions,
        total_volume=total_volume,
        overall_success_rate=overall_success,
        avg_adjusted_fee_share=0.0,
        top_performers=[MerchantResponse.model_validate(m) for m in top_merchants],
    )
