"""Tests for DuckDB data access and metric calculations.

All tests use the REAL CSV schema confirmed by schema inspection.
"""

import os
from pathlib import Path

import pytest
from duckdb_database import DuckDBManager


@pytest.fixture(scope="module")
def db_manager():
    """Create a DuckDB manager instance for testing."""
    csv_path = os.path.join(
        Path(__file__).resolve().parents[3],
        "data", "sample_data.csv"
    )
    db = DuckDBManager(
        db_path="data/test_analytics.duckdb",
        csv_path=csv_path
    )
    yield db
    db.close()


def test_db_health(db_manager):
    """Test that the database is healthy and accessible."""
    health = db_manager.health_check()
    assert health["status"] == "healthy"
    assert health["row_count"] > 0


def test_db_schema(db_manager):
    """Test that the schema matches the real CSV columns."""
    schema = db_manager.get_schema()
    column_names = [col["name"] for col in schema["columns"]]

    # Real CSV columns
    expected = [
        "session_key", "try_seq", "terminal_key", "merchant_key",
        "category_id", "category_title", "amount", "adjusted_fee",
        "session_status", "try_status", "switch_response_code",
        "psp_code", "issuer_bank_code", "payer_card_key",
        "verify_type", "init_time_ms", "verify_time_ms",
        "created_at", "try_created_at", "verified_at",
        "settled_at", "expire_in",
    ]
    assert column_names == expected
    assert schema["total_rows"] == 10000


def test_overview_metrics(db_manager):
    """Test overview KPIs use real column names."""
    metrics = db_manager.get_overview_metrics()

    # Basic assertions - no invented columns
    assert "total_attempts" in metrics
    assert "unique_sessions" in metrics
    assert "payment_attempts" in metrics
    assert metrics["payment_attempts"]["total"] > 0

    # Status values should be real CSV values
    attempts = metrics["payment_attempts"]
    assert "paid" in attempts
    assert "verified" in attempts
    assert "failed" in attempts

    # Amount in Rials
    assert metrics["amount"]["currency"] == "IRR"

    # adjusted_fee note
    assert "adjusted_fee" in metrics["fee_note"]
    assert "relative" in metrics["fee_note"].lower()

    # How calculated traceability
    assert "how_calculated" in metrics
    assert "total_attempts" in metrics["how_calculated"]


def test_merchants_ranking(db_manager):
    """Test merchant ranking uses real column names."""
    merchants = db_manager.get_merchants(limit=10, min_attempts=10)

    assert len(merchants) > 0
    assert len(merchants) <= 10

    # Verify real columns used
    first = merchants[0]
    assert "merchant_key" in first  # not merchant_id
    assert "category_title" in first
    assert "success_rate_pct" in first

    # Check sorting (descending by total_attempts)
    counts = [m["total_attempts"] for m in merchants]
    assert counts == sorted(counts, reverse=True)


def test_time_series(db_manager):
    """Test time series uses real column names."""
    series = db_manager.get_time_series(
        metric="attempts",
        interval="day",
    )

    assert len(series) > 0
    first = series[0]
    assert "time_period" in first
    assert "value" in first


def test_time_series_invalid_metric(db_manager):
    """Test that invalid metrics are rejected."""
    with pytest.raises(ValueError):
        db_manager.get_time_series(metric="invalid_metric")


def test_no_customer_or_product_columns(db_manager):
    """Verify that no customer_id or product_id columns are used."""
    schema = db_manager.get_schema()
    column_names = [col["name"] for col in schema["columns"]]
    assert "customer_id" not in column_names
    assert "product_id" not in column_names


def test_adjusted_fee_not_presented_as_real(db_manager):
    """Verify adjusted_fee is clearly marked as scaled."""
    metrics = db_manager.get_overview_metrics()
    assert metrics["adjusted_fee_total"] > 0
    assert "not" in metrics["fee_note"].lower() or "scaled" in metrics["fee_note"].lower()


def test_peer_comparison(db_manager):
    """Test peer comparison uses real CSV columns."""
    merchants = db_manager.get_merchants(limit=5, min_attempts=10)
    assert len(merchants) > 0
    merchant_key = merchants[0]["merchant_key"]
    result = db_manager.get_peer_comparison(merchant_key)
    assert "error" not in result
    assert "my_amount" in result
    assert "peer_avg_amount" in result
    assert "percentile_rank" in result
    assert "category" in result
    assert result["merchant_key"] == merchant_key


def test_daily_trends(db_manager):
    """Test daily trends time-series uses real CSV columns."""
    trends = db_manager.get_daily_trends(days=30)
    assert len(trends) > 0
    first = trends[0]
    assert "day" in first
    assert "count" in first
    assert "amount" in first
    assert "success_rate" in first
    assert first["success_rate"] >= 0
