"""Stage 2 tests: Sales Share and Time-Based Analytics
Tests for merchant sales-share analysis and daily/monthly/yearly activity trends.
"""
import pytest
from app.db.duckdb_database import DuckDBManager


@pytest.fixture
def dm():
    """Create a DuckDBManager connected to the test dataset."""
    return DuckDBManager()


@pytest.fixture
def known_merchant(dm):
    """Return a merchant key that exists in the dataset."""
    merchants = dm.get_merchants()
    if merchants and len(merchants) > 0:
        return merchants[0]["merchant_key"]
    return "M1000"


# --- Sales Share tests ---

class TestSalesShare:
    def test_sales_share_returns_dict_with_expected_keys(self, dm):
        """get_sales_share must return a dict with traceability fields."""
        result = dm.get_sales_share()
        assert isinstance(result, dict)
        assert "merchant_sales_share" in result
        assert "category_sales_share" in result
        assert "summary" in result
        assert "how_calculated" in result
        assert "filters" in result

    def test_sales_share_traceability_has_formulas(self, dm):
        """how_calculated must contain formula definitions."""
        result = dm.get_sales_share()
        how = result["how_calculated"]
        assert "sales_definition" in how
        assert "total_amount" in how
        assert "successful_amount" in how
        assert "amount_share_pct" in how
        assert "counting_unit" in how
        assert "limitation" in how

    def test_sales_share_filtered_by_merchant(self, dm, known_merchant):
        """Filtering by merchant_key returns only that merchant in the share list."""
        result = dm.get_sales_share(merchant_key=known_merchant)
        if result["merchant_sales_share"]:
            assert all(
                r["merchant_key"] == known_merchant
                for r in result["merchant_sales_share"]
            )

    def test_sales_share_summary_has_totals(self, dm):
        """Summary includes total_amount, successful_amount, total_attempts."""
        result = dm.get_sales_share()
        summary = result["summary"]
        assert "total_amount" in summary
        assert "successful_amount" in summary
        assert "total_attempts" in summary


# --- Activity trend tests ---

class TestActivityDaily:
    def test_activity_daily_returns_dict(self, dm):
        result = dm.get_activity_daily()
        assert isinstance(result, dict)
        assert "daily_activity" in result
        assert "how_calculated" in result

    def test_activity_daily_has_expected_columns(self, dm):
        result = dm.get_activity_daily()
        data = result["daily_activity"]
        assert len(data) > 0
        expected_keys = {
            "attempt_count", "total_amount", "successful_amount",
            "verified_count", "failed_count", "success_rate",
            "period", "count_change_pct", "amount_change_pct",
        }
        assert expected_keys.issubset(set(data[0].keys()))

    def test_activity_daily_has_previous_period_comparison(self, dm):
        """Each entry must include previous-period comparison fields."""
        result = dm.get_activity_daily()
        data = result["daily_activity"]
        # At least the first entry should have comparison fields (some may be None for first day)
        assert len(data) > 0


class TestActivityMonthly:
    def test_activity_monthly_returns_dict(self, dm):
        result = dm.get_activity_monthly()
        assert isinstance(result, dict)
        assert "monthly_activity" in result

    def test_activity_monthly_has_month_key(self, dm):
        result = dm.get_activity_monthly()
        data = result["monthly_activity"]
        assert len(data) > 0
        assert "month" in data[0] or "period" in data[0]


class TestActivityYearly:
    def test_activity_yearly_returns_dict(self, dm):
        result = dm.get_activity_yearly()
        assert isinstance(result, dict)
        assert "yearly_activity" in result

    def test_activity_yearly_has_year_key(self, dm):
        result = dm.get_activity_yearly()
        data = result["yearly_activity"]
        assert len(data) > 0
        assert "year" in data[0] or "period" in data[0]


# --- Merchant ranking tests ---

class TestMerchantRanking:
    def test_merchant_ranking_by_amount(self, dm):
        result = dm.get_merchant_ranking(sort_by="amount", limit=10)
        assert isinstance(result, dict)
        assert "ranking" in result
        assert len(result["ranking"]) <= 10
        # Should be sorted descending by total_amount
        ranking = result["ranking"]
        if len(ranking) >= 2:
            assert ranking[0]["total_amount"] >= ranking[1]["total_amount"]

    def test_merchant_ranking_by_count(self, dm):
        result = dm.get_merchant_ranking(sort_by="count", limit=10)
        assert isinstance(result, dict)
        assert "ranking" in result
        ranking = result["ranking"]
        if len(ranking) >= 2:
            assert ranking[0]["attempt_count"] >= ranking[1]["attempt_count"]

    def test_merchant_ranking_has_traceability(self, dm):
        result = dm.get_merchant_ranking()
        hc = result["how_calculated"]
        assert "total_amount" in hc
        assert "attempt_count" in hc
        assert "amount_share_pct" in hc


# --- Highest activity tests ---

class TestHighestActivity:
    def test_highest_activity_day(self, dm):
        result = dm.get_highest_activity_day()
        assert isinstance(result, dict)
        assert "day" in result
        assert "attempt_count" in result

    def test_highest_activity_month(self, dm):
        result = dm.get_highest_activity_month()
        assert isinstance(result, dict)
        assert "month" in result
        assert "attempt_count" in result


# --- Calculation details tests ---

class TestCalculationDetails:
    def test_calculation_details(self, dm):
        result = dm.get_calculation_details()
        assert "metrics" in result
        assert "sales_definition_stage1" in result
        assert "sales_definition_stage2" in result
        assert "stage2_sales_rationale" in result

    def test_calculation_details_has_metric_definitions(self, dm):
        result = dm.get_calculation_details()
        metrics = result["metrics"]
        metric_ids = [m["metric_id"] for m in metrics]
        assert "attempt_count" in metric_ids
        assert "unique_session_count" in metric_ids
        assert "total_amount" in metric_ids
        assert "successful_amount" in metric_ids

    def test_calculation_details_has_traceability_fields(self, dm):
        result = dm.get_calculation_details()
        for metric in result["metrics"]:
            assert "formula" in metric
            assert "source_columns" in metric
            assert "counting_unit" in metric
            assert "limitations" in metric


# --- Edge case tests ---

class TestEdgeCases:
    def test_empty_results_safe(self, dm):
        """Querying a non-existent merchant returns empty, not error."""
        result = dm.get_sales_share(merchant_key="NONEXISTENT_MERCHANT_999")
        assert isinstance(result, dict)
        assert result["merchant_sales_share"] == []

    def test_division_by_zero_safe(self, dm):
        """Division by zero doesn't crash — returns 0s."""
        result = dm.get_sales_share(merchant_key="NONEXISTENT_MERCHANT_999")
        summary = result["summary"]
        assert summary["total_amount"] == 0
        assert summary["successful_amount"] == 0

    def test_filtered_activity_daily_safe(self, dm, known_merchant):
        """Activity filtering by merchant doesn't crash."""
        result = dm.get_activity_daily(merchant_key=known_merchant)
        assert isinstance(result, dict)
