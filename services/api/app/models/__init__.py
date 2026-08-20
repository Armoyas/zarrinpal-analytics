"""
SQLAlchemy models for ZarrinPal Analytics Dashboard.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class Merchant(Base):
    """Merchant entity."""
    __tablename__ = "merchants"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, nullable=True)
    
    # Aggregated fields
    total_transactions = Column(Integer, default=0)
    total_volume = Column(Float, default=0.0)  # In Rials
    avg_transaction_amount = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    
    transactions = relationship("Transaction", back_populates="merchant")
    analytics = relationship("AnalyticsFact", back_populates="merchant")


class Transaction(Base):
    """Transaction (payment attempt) entity."""
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True)
    amount = Column(Float, nullable=True)  # In Rials
    adjusted_fee = Column(Float, nullable=True)  # NOT real fee - obfuscation applied
    status = Column(String, index=True)  # success, failed, pending
    payment_method = Column(String, nullable=True)
    card_type = Column(String, nullable=True)
    created_at = Column(DateTime, index=True)
    updated_at = Column(DateTime, nullable=True)
    
    # Traceability fields
    raw_data_ref = Column(String, nullable=True)
    
    merchant = relationship("Merchant", back_populates="transactions")


class AnalyticsFact(Base):
    """Pre-computed analytics facts for fast querying."""
    __tablename__ = "analytics_facts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True)
    
    # Date/period info
    period = Column(String)  # e.g., "2024-01", "2024-Q1"
    date = Column(DateTime, nullable=True)
    
    # Metrics
    transaction_count = Column(Integer, default=0)
    successful_count = Column(Integer, default=0)
    total_volume = Column(Float, default=0.0)
    total_adjusted_fee = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    avg_transaction = Column(Float, default=0.0)
    
    # Comparisons (pre-computed for performance)
    rank_volume = Column(Integer, nullable=True)
    rank_success_rate = Column(Integer, nullable=True)
    percentile_volume = Column(Float, nullable=True)
    
    merchant = relationship("Merchant", back_populates="analytics")


class Recommendation(Base):
    """AI-powered recommendations for merchants."""
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True)
    recommendation_type = Column(String, index=True)  # fee_optimization, checkout, seasonal
    title = Column(String)
    description = Column(Text)
    priority = Column(String)  # high, medium, low
    action_url = Column(String, nullable=True)
    
    # Traceability
    data_reference = Column(Text)  # JSON describing the data that supports this
    created_at = Column(DateTime)
