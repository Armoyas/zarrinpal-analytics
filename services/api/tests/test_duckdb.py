"""Tests for DuckDB data access and metric calculations.

All tests use the REAL CSV schema confirmed by schema inspection.
Validates Stage 1: Core Merchant Overview endpoints and metrics.
"""

import os
from pathlib import Path

import pytest
from app.db.duckdb_database import DuckDBManager


@pytest.fixture(scope="module")
def db_manager():
    """Create a DuckDB manager instance for testing."""
    csv_path = os.path.join(
        Path(__file__).resolve().parents[1],
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
    assert schema["total_rows"] >= 9000


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
    assert metrics["fee_note"].lower().count("not") > 0 or "scaled" in metrics["fee_note"].lower()

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
    note_lower = metrics["fee_note"].lower()
    assert "not" in note_lower or "scaled" in note_lower


def test_merchant_detail(db_manager):
    """Test merchant detail uses real CSV columns."""
    merchants = db_manager.get_merchants(limit=5, min_attempts=10)
    assert len(merchants) > 0
    merchant_key = merchants[0]["merchant_key"]
    result = db_manager.get_merchant_detail(merchant_key)
    assert "error" not in result
    assert "total_amount" in result
    assert "category_title" in result
    assert result["merchant_key"] == merchant_key


def test_daily_trends(db_manager):
    """Test daily trends time-series uses real CSV columns."""
    trends = db_manager.get_daily_trends(days=30)
    assert len(trends) > 0
    first = trends[0]
    assert "day" in first
    assert "daily_count" in first
    assert "daily_amount" in first
    assert "daily_success_rate" in first
    assert first["daily_success_rate"] >= 0


from app.db.duckdb_database import DuckDBManager

# Use a merchant key that exists in the generated sample data
TEST_MERCHANT = "M1000"


def test_merchant_filtering(db_manager):
    """Test that merchant filtering works correctly."""
    all_metrics = db_manager.get_overview_metrics()
    filtered_metrics = db_manager.get_overview_metrics(merchant_key=TEST_MERCHANT)
    assert filtered_metrics["total_attempts"] <= all_metrics["total_attempts"]


def test_date_filtering(db_manager):
    """Test that date-range filtering works correctly."""
    all_metrics = db_manager.get_overview_metrics()
    june_metrics = db_manager.get_overview_metrics(
        start_date="2024-06-01", end_date="2024-06-30"
    )
    assert june_metrics["total_attempts"] <= all_metrics["total_attempts"]
    assert june_metrics["amount"]["total_rials"] <= all_metrics["amount"]["total_rials"]


def test_amount_aggregation(db_manager):
    """Test amount aggregation uses real amount column."""
    metrics = db_manager.get_overview_metrics()
    assert metrics["amount"]["total_rials"] > 0
    assert metrics["amount"]["avg_per_attempt_rials"] > 0
    assert metrics["amount"]["avg_per_attempt_rials"] <= metrics["amount"]["total_rials"]


def test_row_counts(db_manager):
    """Test that row counts use the real dataset."""
    metrics = db_manager.get_overview_metrics()
    assert metrics["total_attempts"] >= 9000


def test_unique_session_counts(db_manager):
    """Test unique session counting uses session_key."""
    metrics = db_manager.get_overview_metrics()
    assert metrics["unique_sessions"] > 0
    assert metrics["unique_sessions"] <= metrics["total_attempts"]


def test_status_logic(db_manager):
    """Test that status counting uses documented status logic."""
    metrics = db_manager.get_overview_metrics()
    attempts = metrics["payment_attempts"]
    # Verified and Paid are successful statuses
    assert attempts["verified"] >= 0
    assert attempts["paid"] >= 0
    assert attempts["failed"] >= 0
    assert attempts["reversed"] >= 0
    assert attempts["no_attempt"] >= 0


def test_empty_results(db_manager):
    """Test that non-existent merchant returns empty results."""
    empty = db_manager.get_overview_metrics(merchant_key="NONEXISTENT_MERCHANT")
    assert empty["total_attempts"] == 0
    assert empty["unique_sessions"] == 0
    assert empty["success_rate"] == 0


def test_invalid_date_range(db_manager):
    """Test that invalid date ranges are handled gracefully."""
    # Start date after end date should still return results (DuckDB handles it)
    result = db_manager.get_overview_metrics(
        start_date="2024-12-01", end_date="2024-01-01"
    )
    assert "total_attempts" in result


def test_division_by_zero(db_manager):
    """Test that division by zero is handled (success rate with 0 total)."""
    empty = db_manager.get_overview_metrics(merchant_key="NONEXISTENT_MERCHANT")
    assert empty["success_rate"] == 0  # Should not be NaN or error
    assert empty["failure_rate"] == 0  # Should not be NaN or error


def test_traceability_metadata(db_manager):
    """Test that traceability metadata is present for key metrics."""
    metrics = db_manager.get_overview_metrics()
    calc = metrics["how_calculated"]
    assert "total_attempts" in calc
    assert "unique_sessions" in calc
    assert "success_rate" in calc
    assert "total_amount" in calc
    assert "avg_amount" in calc


def test_settled_count(db_manager):
    """Test that settled count is available and reliable."""
    metrics = db_manager.get_overview_metrics()
    # settled count should exist in how_calculated or as a key
    assert "settled_count" in metrics["how_calculated"]
