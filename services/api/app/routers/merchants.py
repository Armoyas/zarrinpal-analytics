"""
API route handlers for merchant operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import List, Optional

from database import get_db
from models import Merchant
from schemas import (
    MerchantResponse,
    MerchantSummary,
    MerchantComparison,
    PaginatedResponse,
)

router = APIRouter(tags=["merchants"])


@router.get("/merchants", response_model=PaginatedResponse)
async def list_merchants(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query(default="total_volume", 
                          pattern="^(total_volume|total_transactions|success_rate|name|avg_transaction_amount)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List all merchants with filtering and pagination."""
    query = db.query(Merchant)
    
    if category:
        query = query.filter(Merchant.category == category)
    if search:
        query = query.filter(Merchant.name.ilike(f"%{search}%"))
    
    # Apply sorting
    sort_column = getattr(Merchant, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    total = query.count()
    merchants = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Add rankings
    for i, merchant in enumerate(merchants):
        merchant.rank_volume = (page - 1) * per_page + i + 1
    
    return PaginatedResponse(
        total=total,
        page=page,
        per_page=per_page,
        items=[m.__dict__ for m in merchants],
    )


@router.get("/merchants/{merchant_id}", response_model=MerchantSummary)
async def get_merchant_summary(
    merchant_id: str,
    db: Session = Depends(get_db),
):
    """Get detailed summary for a specific merchant."""
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Calculate rankings
    rank = db.query(func.count(Merchant.id)).filter(
        Merchant.total_volume > merchant.total_volume
    ).scalar() + 1
    total_merchants = db.query(func.count(Merchant.id)).scalar()
    percentile = (1 - (rank / total_merchants)) * 100 if total_merchants > 0 else 0
    
    return MerchantSummary(
        id=merchant.id,
        name=merchant.name,
        category=merchant.category,
        total_transactions=merchant.total_transactions,
        total_volume=merchant.total_volume,
        avg_transaction_amount=merchant.avg_transaction_amount,
        success_rate=merchant.success_rate,
        rank_volume=rank,
        percentile_volume=percentile,
        top_payment_methods=[],  # Populated by analytics service
    )


@router.get("/merchants/{merchant_id}/comparisons", response_model=MerchantComparison)
async def compare_merchant(
    merchant_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Compare a merchant against peers in same category."""
    target = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Get peer merchants (same category)
    peers = db.query(Merchant).filter(
        Merchant.category == target.category,
        Merchant.id != target.id,
    ).order_by(desc(Merchant.total_volume)).limit(limit).all()
    
    # Category benchmarks
    category_avg_volume = db.query(func.avg(Merchant.total_volume)).filter(
        Merchant.category == target.category
    ).scalar()
    category_avg_success = db.query(func.avg(Merchant.success_rate)).filter(
        Merchant.category == target.category
    ).scalar()
    
    return MerchantComparison(
        target_merchant=MerchantSummary(
            id=target.id,
            name=target.name,
            category=target.category,
            total_transactions=target.total_transactions,
            total_volume=target.total_volume,
            avg_transaction_amount=target.avg_transaction_amount,
            success_rate=target.success_rate,
            rank_volume=0,
            percentile_volume=0,
        ),
        peer_merchants=[MerchantSummary(
            id=p.id,
            name=p.name,
            category=p.category,
            total_transactions=p.total_transactions,
            total_volume=p.total_volume,
            avg_transaction_amount=p.avg_transaction_amount,
            success_rate=p.success_rate,
            rank_volume=0,
            percentile_volume=0,
        ) for p in peers],
        category_benchmarks={
            "avg_volume": category_avg_volume or 0,
            "avg_success_rate": category_avg_success or 0,
        },
    )
