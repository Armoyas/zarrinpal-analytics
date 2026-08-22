"""Backend tests for Stage 1: Core Merchant Overview."""

import os
import sys
import csv
import tempfile
from pathlib import Path

# Ensure the api app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "services/api"))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def sample_csv(tmp_path_factory):
    """Create a small sample CSV for testing."""
    rows = [
        ["session_key", "try_seq", "terminal_key", "merchant_key", "category_id",
         "category_title", "amount", "adjusted_fee", "session_status", "try_status",
         "switch_response_code", "psp_code", "issuer_bank_code", "payer_card_key",
         "verify_type", "init_time_ms", "verify_time_ms", "created_at",
         "try_created_at", "verified_at", "settled_at", "expire_in"],
        ["s1", "0", "T1", "M1", "1", "آموزش", "1000000", "2400", "Verified", "Verified",
         "", "", "", "", "Automated", "100", "50", "2024-01-01 10:00:00",
         "", "", "", "2024-01-01 10:05:00"],
        ["s2", "0", "T1", "M1", "1", "آموزش", "5000000", "1200", "Failed", "Failed",
         "", "", "", "", "Automated", "200", "", "2024-01-01 11:00:00",
         "", "", "", "2024-01-01 11:05:00"],
        ["s3", "0", "T2", "M1", "1", "آموزش", "3000000", "7200", "Verified", "Verified",
         "25", "100", "50", "card1", "Manual", "150", "80", "2024-01-01 12:00:00",
         "", "2024-01-01 12:10:00", "", "2024-01-01 12:15:00"],
        ["s4", "0", "T1", "M2", "2", "خرده\u200cفروشی آنلاین", "2000000", "4800", "Verified", "Verified",
         "", "", "", "", "Automated", "100", "50", "2024-01-02 10:00:00",
         "", "", "", "2024-01-02 10:05:00"],
        ["s5", "0", "T2", "M2", "2", "خرده\u200cفروشی آنلاین", "200000", "1200", "Failed", "Failed",
         "", "", "", "", "Automated", "300", "", "2024-01-02 11:00:00",
         "", "", "", "2024-01-02 11:05:00"],
    ]
    csv_path = tmp_path_factory.mktemp("data") / "sample_data.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    return str(csv_path)


@pytest.fixture
def app(sample_csv):
    """Create FastAPI app with test data."""
    os.environ["DATA_FILE"] = sample_csv
    os.environ["DUCKDB_PATH"] = ":memory:"

    # Import after setting env
    from app.main import app
    from app.database import close_db, get_db

    # Force re-initialization with test data
    close_db()
    db = get_db()
    # Reload table
    db.sql("DROP TABLE IF EXISTS zp_data")
    db.sql(f"CREATE TABLE zp_data AS SELECT * FROM read_csv('{sample_csv}', header=true, sep=',')")

    yield app
    close_db()


@pytest.fixture
def client(app):
    """Test client for the FastAPI app."""
    from fastapi.testclient import TestClient
    return TestClient(app)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_returns_healthy(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["stage"] == "1-core-overview"
        assert data["data_available"] is True


class TestSchemaEndpoint:
    def test_schema_returns_columns(self, client):
        response = client.get("/api/v1/schema")
        assert response.status_code == 200
        data = response.json()
        assert "columns" in data
        assert "row_count" in data
        assert data["columns_count"] == 22
        assert data["row_count"] == 5

    def test_schema_has_expected_columns(self, client):
        response = client.get("/api/v1/schema")
        data = response.json()
        column_names = [c["name"] for c in data["columns"]]
        assert "session_key" in column_names
        assert "merchant_key" in column_names
        assert "amount" in column_names
        assert "session_status" in column_names


class TestMerchantList:
    def test_merchants_returns_list(self, client):
        response = client.get("/api/v1/merchants")
        assert response.status_code == 200
        data = response.json()
        assert "merchants" in data
        assert "traceability" in data
        assert len(data["merchants"]) == 2  # M1 and M2

    def test_merchants_includes_traceability(self, client):
        response = client.get("/api/v1/merchants")
        data = response.json()
        trace = data["traceability"]
        assert trace["metric_id"] == "merchant_list"
        assert trace["counting_unit"] == "merchant"
        assert "source_columns" in trace
        assert "formula" in trace

    def test_merchant_filter_by_category(self, client):
        response = client.get("/api/v1/merchants?category_id=1")
        assert response.status_code == 200
        data = response.json()
        # Category 1 is M1 only in our test data
        assert len(data["merchants"]) == 1
        assert data["merchants"][0]["merchant_key"] == "M1"

    def test_merchant_filter_invalid_category(self, client):
        response = client.get("/api/v1/merchants?category_id=999")
        assert response.status_code == 200
        data = response.json()
        assert len(data["merchants"]) == 0


class TestOverviewEndpoint:
    def test_overview_merchant_filter(self, client):
        """Test merchant filtering returns correct data."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        assert response.status_code == 200
        data = response.json()
        assert data["merchant_key"] == "M1"
        assert "metrics" in data

    def test_overview_date_filter(self, client):
        """Test date-range filtering."""
        response = client.get(
            "/api/v1/overview?merchant_key=M1&start_date=2024-01-01&end_date=2024-01-01"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["date_range"]["start"] == "2024-01-01"
        assert data["date_range"]["end"] == "2024-01-01"

    def test_overview_invalid_date_range(self, client):
        """Test that start > end returns 400."""
        response = client.get(
            "/api/v1/overview?start_date=2024-12-31&end_date=2024-01-01"
        )
        assert response.status_code == 400

    def test_overview_amount_aggregation(self, client):
        """Test total amount and average amount."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        total_metric = next(m for m in data["metrics"] if m["metric_id"] == "total_amount")
        avg_metric = next(m for m in data["metrics"] if m["metric_id"] == "avg_amount")

        # M1 has amounts: 1000000 + 5000000 + 3000000 = 9000000
        assert total_metric["value"] == 9000000
        # Avg = 9000000 / 3 = 3000000
        assert avg_metric["value"] == 3000000.0

    def test_overview_row_count(self, client):
        """Test payment-attempt row count."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        row_count_metric = next(
            m for m in data["metrics"] if m["metric_id"] == "payment_attempts"
        )
        assert row_count_metric["value"] == 3
        assert row_count_metric["counting_unit"] == "row"

    def test_overview_unique_session_count(self, client):
        """Test unique session count."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        session_metric = next(
            m for m in data["metrics"] if m["metric_id"] == "unique_sessions"
        )
        assert session_metric["value"] == 3  # s1, s2, s3
        assert session_metric["counting_unit"] == "session"

    def test_overview_status_logic(self, client):
        """Test verified, failed, and status counting."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        verified = next(m for m in data["metrics"] if m["metric_id"] == "verified_count")
        failed = next(m for m in data["metrics"] if m["metric_id"] == "failed_count")
        settled = next(m for m in data["metrics"] if m["metric_id"] == "settled_count")

        # M1: Verified=2 (s1, s3), Failed=1 (s2), Settled=1 (s3 has settled_at)
        assert verified["value"] == 2
        assert failed["value"] == 1
        assert settled["value"] == 1

    def test_overview_success_rate(self, client):
        """Test success rate calculation."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        success_rate = next(
            m for m in data["metrics"] if m["metric_id"] == "success_rate"
        )
        # 2 verified / 3 total * 100 = 66.67
        assert success_rate["value"] == 66.67

    def test_overview_traceability(self, client):
        """Test that all metrics have traceability metadata."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        for metric in data["metrics"]:
            assert "metric_id" in metric
            assert "definition" in metric
            assert "formula" in metric
            assert "source_columns" in metric
            assert "counting_unit" in metric
            assert "filters" in metric

    def test_overview_empty_results(self, client):
        """Test empty results for non-existent merchant."""
        response = client.get("/api/v1/overview?merchant_key=NONEXISTENT")
        assert response.status_code == 200
        data = response.json()
        assert len(data["metrics"]) == 8
        assert all(m["value"] == 0 for m in data["metrics"])

    def test_overview_division_by_zero(self, client):
        """Test that success rate is 0 when no rows."""
        response = client.get("/api/v1/overview?merchant_key=NONEXISTENT")
        data = response.json()
        success_rate = next(
            m for m in data["metrics"] if m["metric_id"] == "success_rate"
        )
        assert success_rate["value"] == 0.0


class TestTrendsEndpoint:
    def test_trends_returns_daily_data(self, client):
        response = client.get("/api/v1/trends?merchant_key=M1")
        assert response.status_code == 200
        data = response.json()
        assert "daily" in data
        assert len(data["daily"]) == 2  # 2024-01-01 and 2024-01-02... wait, check data
        # M1 has data on 2024-01-01 (s1, s2, s3) only
        assert len(data["daily"]) == 1

    def test_trends_daily_fields(self, client):
        response = client.get("/api/v1/trends?merchant_key=M1")
        data = response.json()
        day = data["daily"][0]
        assert "date" in day
        assert "attempts" in day
        assert "amount" in day
        assert "sessions" in day
        assert "verified" in day
        assert "failed" in day

    def test_trends_amount_aggregation(self, client):
        response = client.get("/api/v1/trends?merchant_key=M1")
        data = response.json()
        # M1 on 2024-01-01: 1000000 + 5000000 + 3000000 = 9000000
        assert data["daily"][0]["amount"] == 9000000

    def test_trends_invalid_date_range(self, client):
        response = client.get(
            "/api/v1/trends?start_date=2024-12-31&end_date=2024-01-01"
        )
        assert response.status_code == 400

    def test_trends_traceability(self, client):
        response = client.get("/api/v1/trends?merchant_key=M1")
        data = response.json()
        trace = data["traceability"]
        assert trace["metric_id"] == "daily_activity_trend"
        assert trace["counting_unit"] in ["row", "session"]
        assert "formula" in trace


class TestNoData:
    def test_overview_no_merchant_filter(self, client):
        """Test overview without merchant filter returns all data."""
        response = client.get("/api/v1/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["merchant_key"] == "ALL"
        row_count = next(
            m for m in data["metrics"] if m["metric_id"] == "payment_attempts"
        )
        assert row_count["value"] == 5
