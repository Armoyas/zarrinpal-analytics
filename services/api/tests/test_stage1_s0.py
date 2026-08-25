"""Backend tests for Stage 1: Core Merchant Overview.

Tests the current API endpoints against the DuckDBManager-based backend.
Covers health, schema, merchants, overview, and time-series endpoints.
"""
import os
import sys
import csv
from pathlib import Path

# Ensure the api app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # services/api
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "app"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "app" / "db"))

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
        ["s1", "0", "T1", "M1", "1", "\u0622\u0645\u0648\u0632\u0634", "1000000", "2400", "Verified", "Verified",
         "", "", "", "", "Automated", "100", "50", "2024-01-01 10:00:00",
         "", "", "", "2024-01-01 10:05:00"],
        ["s2", "0", "T1", "M1", "1", "\u0622\u0645\u0648\u0632\u0634", "5000000", "1200", "Failed", "Failed",
         "", "", "", "", "Automated", "200", "", "2024-01-01 11:00:00",
         "", "", "", "2024-01-01 11:05:00"],
        ["s3", "0", "T2", "M1", "1", "\u0622\u0645\u0648\u0632\u0634", "3000000", "7200", "Verified", "Verified",
         "25", "100", "50", "card1", "Manual", "150", "80", "2024-01-01 12:00:00",
         "", "2024-01-01 12:10:00", "", "2024-01-01 12:15:00"],
        ["s4", "0", "T1", "M2", "2", "\u062e\u0631\u062f\u0647\u200c\u0641\u0631\u0648\u0634\u06cc \u0622\u0646\u0644این", "2000000", "4800", "Verified", "Verified",
         "", "", "", "", "Automated", "100", "50", "2024-01-02 10:00:00",
         "", "", "", "2024-01-02 10:05:00"],
        ["s5", "0", "T2", "M2", "2", "\u062e\u0631\u062f\u0647\u200c\u0641\u0631\u0648\u0634\u06cc \u0622\u0646\u0644این", "200000", "1200", "Failed", "Failed",
         "", "", "", "", "Automated", "300", "", "2024-01-02 11:00:00",
         "", "", "", "2024-01-02 11:05:00"],
        ["s6", "0", "T1", "M1", "1", "\u0622\u0645\u0648\u0632\u0634", "1500000", "3600", "Verified", "Verified",
         "", "200", "50", "card2", "Manual", "120", "60", "2024-01-02 09:00:00",
         "", "2024-01-02 09:05:00", "2024-01-02 09:10:00", "2024-01-02 09:15:00"],
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
    from app.db.duckdb_database import DuckDBManager
    # Force re-initialization with test data
    DuckDBManager._instance = None
    db = DuckDBManager()
    db._conn = None
    # Reload table
    db._load_csv(db.get_connection())
    yield app


@pytest.fixture
def client(app):
    """Test client for the FastAPI app."""
    return TestClient(app)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_returns_healthy(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "detail" in data


class TestSchemaEndpoint:
    def test_schema_returns_columns(self, client):
        response = client.get("/api/v1/schema")
        assert response.status_code == 200
        data = response.json()
        assert "columns" in data
        assert "total_rows" in data
        # 22 columns in the CSV schema
        assert len(data["columns"]) == 22
        assert data["total_rows"] == 6

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
        assert len(data) == 2  # M1 and M2

    def test_merchants_includes_merchant_key(self, client):
        response = client.get("/api/v1/merchants")
        assert response.status_code == 200
        data = response.json()
        assert "merchant_key" in data[0]

    def test_merchant_filter_by_category(self, client):
        response = client.get("/api/v1/merchants?category_id=1")
        assert response.status_code == 200
        data = response.json()
        # Category 1 is M1 only in our test data
        assert len(data) == 1
        assert data[0]["merchant_key"] == "M1"

    def test_merchant_filter_invalid_category(self, client):
        response = client.get("/api/v1/merchants?category_id=999")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0


class TestOverviewEndpoint:
    def test_overview_merchant_filter(self, client):
        """Test merchant filtering returns correct data."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        assert response.status_code == 200
        data = response.json()
        assert data["total_attempts"] == 4  # s1, s2, s3, s6 for M1

    def test_overview_date_filter(self, client):
        """Test date-range filtering."""
        response = client.get(
            "/api/v1/overview?merchant_key=M1&start_date=2024-01-01&end_date=2024-01-01"
        )
        assert response.status_code == 200
        data = response.json()
        # M1 has only s1, s2, s3 on 2024-01-01 (s6 is on 2024-01-02)
        assert data["total_attempts"] == 3

    def test_overview_invalid_date_range(self, client):
        """Test that start > end is accepted and returns results."""
        response = client.get(
            "/api/v1/overview?start_date=2024-12-31&end_date=2024-01-01"
        )
        assert response.status_code == 200

    def test_overview_amount_aggregation(self, client):
        """Test total amount aggregation."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        # M1 has amounts: 1000000 + 5000000 + 3000000 + 1500000 = 10500000
        assert data["amount"]["total_rials"] == 10500000

    def test_overview_row_count(self, client):
        """Test payment-attempt row count."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        assert data["total_attempts"] == 4  # s1, s2, s3, s6

    def test_overview_unique_session_count(self, client):
        """Test unique session count."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        assert data["unique_sessions"] == 4  # s1, s2, s3, s6

    def test_overview_status_logic(self, client):
        """Test verified, failed, and status counting."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        # M1: Verified=3 (s1, s3, s6), Failed=1 (s2)
        pa = data["payment_attempts"]
        assert pa["verified"] == 3
        assert pa["failed"] == 1

    def test_overview_success_rate(self, client):
        """Test success rate calculation."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        # 3 verified / 4 total * 100 = 75.0
        assert data["success_rate"] == 75.0

    def test_overview_traceability(self, client):
        """Test that overview has traceability metadata."""
        response = client.get("/api/v1/overview?merchant_key=M1")
        data = response.json()
        assert "how_calculated" in data

    def test_overview_empty_results(self, client):
        """Test empty results for non-existent merchant."""
        response = client.get("/api/v1/overview?merchant_key=NONEXISTENT")
        assert response.status_code == 200
        data = response.json()
        assert data["total_attempts"] == 0

    def test_overview_division_by_zero(self, client):
        """Test that success rate is 0 when no rows."""
        response = client.get("/api/v1/overview?merchant_key=NONEXISTENT")
        data = response.json()
        assert data["success_rate"] == 0.0


class TestTrendsEndpoint:
    def test_trends_returns_data(self, client):
        response = client.get("/api/v1/time-series?interval=daily&merchant_key=M1")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # M1 has data on 2024-01-01 (s1, s2, s3) and 2024-01-02 (s6)
        assert len(data) == 2

    def test_trends_daily_fields(self, client):
        response = client.get("/api/v1/time-series?interval=daily&merchant_key=M1")
        data = response.json()
        day = data[0]
        assert "time_period" in day
        assert "value" in day

    def test_trends_amount_aggregation(self, client):
        response = client.get("/api/v1/time-series?metric=amount&interval=day&merchant_key=M1")
        assert response.status_code == 200
        data = response.json()
        # M1 on 2024-01-01: 1000000 + 5000000 + 3000000 = 9000000
        assert data[0]["value"] == 9000000

    def test_trends_invalid_date_range(self, client):
        response = client.get(
            "/api/v1/time-series?interval=day&start_date=2024-12-31&end_date=2024-01-01"
        )
        assert response.status_code == 200


class TestNoData:
    def test_overview_no_merchant_filter(self, client):
        """Test overview without merchant filter returns all data."""
        response = client.get("/api/v1/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["total_attempts"] == 6
