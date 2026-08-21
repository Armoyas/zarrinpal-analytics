"""DuckDB database manager for ZarrinPal analytics.

Reads CSV data directly using DuckDB - no PostgreSQL or ORM required.
All queries use the REAL CSV schema confirmed by schema inspection.
"""

import duckdb
from pathlib import Path
from typing import Any

# Real CSV columns (confirmed by schema inspection):
# session_key, try_seq, terminal_key, merchant_key, category_id,
# category_title, amount, adjusted_fee, session_status, try_status,
# switch_response_code, psp_code, issuer_bank_code, payer_card_key,
# verify_type, init_time_ms, verify_time_ms, created_at, try_created_at,
# verified_at, settled_at, expire_in

STATUS_COMPLETED = "'Verified', 'Paid', 'Reversed'"
STATUS_FAILED = "'Failed'"


class DuckDBManager:
    """Manages DuckDB connection and provides data access methods."""

    def __init__(self, db_path: str | None = None, csv_path: str | None = None):
        # Resolve paths relative to project root.
        # File location: services/api/app/db/duckdb_database.py
        # parents[0]=db/ parents[1]=app/ parents[2]=api/
        # parents[3]=services/api/ parents[4]=project root
        project_root = Path(__file__).resolve().parents[4]
        self.db_path = db_path or str(project_root / "data" / "analytics.duckdb")
        self.csv_path = csv_path or str(project_root / "data" / "sample_data.csv")
        self._conn = None

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        if self._conn is None:
            db_path = Path(self.db_path)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            self._conn = duckdb.connect(database=self.db_path, read_only=False)
            self._ensure_table()
        return self._conn

    def _ensure_table(self):
        conn = self.get_connection()
        tables = conn.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_name = 'payments'"
        ).fetchall()
        if not tables:
            csv_path = Path(self.csv_path)
            if not csv_path.exists():
                raise FileNotFoundError(f"CSV not found: {self.csv_path}")
            conn.execute(f"CREATE TABLE payments AS SELECT * FROM read_csv_auto('{self.csv_path}')")
            conn.commit()

    def close(self):
        if self._conn:
            self._conn.close()
            self._conn = None

    def health_check(self) -> dict[str, Any]:
        """Check if the database and data are accessible."""
        try:
            conn = self.get_connection()
            count = conn.execute("SELECT COUNT(*) FROM payments").fetchone()[0]
            columns = [row[1] for row in conn.execute(
                "SELECT * FROM pragma_table_info('payments')"
            ).fetchall()]
            return {
                "status": "healthy",
                "row_count": count,
                "columns": columns,
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

    def get_schema(self) -> dict[str, Any]:
        """Return the CSV schema information."""
        conn = self.get_connection()
        rows = conn.execute(
            "SELECT name, type FROM pragma_table_info('payments')"
        ).fetchall()
        return {
            "columns": [{"name": r[0], "type": r[1]} for r in rows],
            "total_rows": conn.execute("SELECT COUNT(*) FROM payments").fetchone()[0],
        }

    def get_status_distribution(self) -> list[dict[str, Any]]:
        """Get distribution of session_status values."""
        conn = self.get_connection()
        rows = conn.execute(
            "SELECT session_status, COUNT(*) as count FROM payments GROUP BY session_status ORDER BY count DESC"
        ).fetchall()
        return [{"status": r[0], "count": r[1]} for r in rows]

    def get_overview_metrics(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
    ) -> dict[str, Any]:
        """Calculate overview KPIs based on real CSV columns.

        Note: Rows are payment ATTEMPTS (try_seq), not unique sessions.
        For aggregated metrics, we deduplicate by session_key where appropriate.
        """
        conn = self.get_connection()

        where_clauses = []
        params = []

        if start_date:
            where_clauses.append("CAST(created_at AS DATE) >= CAST(? AS DATE)")
            params.append(start_date)
        if end_date:
            where_clauses.append("CAST(created_at AS DATE) <= CAST(? AS DATE)")
            params.append(end_date)
        if merchant_key:
            where_clauses.append("merchant_key = ?")
            params.append(merchant_key)

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        query = f"""
        WITH base AS (
            SELECT * FROM payments {where_sql}
        )
        SELECT
            COUNT(*) as total_attempts,
            COUNT(DISTINCT session_key) as unique_sessions,
            SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) as completed_attempts,
            SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) as paid_attempts,
            SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) as verified_attempts,
            SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) as failed_attempts,
            SUM(CASE WHEN session_status = 'Reversed' THEN 1 ELSE 0 END) as reversed_attempts,
            SUM(CASE WHEN session_status = 'NoAttempt' THEN 1 ELSE 0 END) as no_attempt,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            SUM(adjusted_fee) as total_adjusted_fee
        FROM base
        """

        result = conn.execute(query, params).fetchone()
        labels = [desc[0] for desc in conn.description]
        metrics = dict(zip(labels, result))

        total = metrics.get("total_attempts", 0)
        paid = metrics.get("paid_attempts", 0)
        verified = metrics.get("verified_attempts", 0)
        completed = metrics.get("completed_attempts", 0)

        success_rate = ((paid + verified) / total * 100) if total > 0 else 0
        failure_rate = (metrics.get("failed_attempts", 0) / total * 100) if total > 0 else 0

        return {
            "total_attempts": metrics.get("total_attempts", 0),
            "unique_sessions": metrics.get("unique_sessions", 0),
            "payment_attempts": {
                "total": total,
                "completed": completed,
                "paid": paid,
                "verified": verified,
                "failed": metrics.get("failed_attempts", 0),
                "reversed": metrics.get("reversed_attempts", 0),
                "no_attempt": metrics.get("no_attempt", 0),
            },
            "success_rate": round(success_rate, 2),
            "failure_rate": round(failure_rate, 2),
            "amount": {
                "total_rials": metrics.get("total_amount", 0),
                "avg_per_attempt_rials": round(metrics.get("avg_amount", 0), 0),
                "currency": "Rial",
            },
            "adjusted_fee_total": metrics.get("total_adjusted_fee", 0),
            "fee_note": "adjusted_fee is a confidentiality-scaled value. Only relative comparisons are valid.",
            "how_calculated": {
                "total_attempts": "COUNT(*) - total payment attempt rows (not unique sessions)",
                "unique_sessions": "COUNT(DISTINCT session_key) - deduplicated sessions",
                "success_rate": "((paid_attempts + verified_attempts) / total_attempts) * 100",
                "failure_rate": "(failed_attempts / total_attempts) * 100",
                "total_amount": "SUM(amount) - sum of all attempt amounts in Rials",
                "avg_amount": "AVG(amount) - average amount per attempt in Rials",
            },
        }

    def get_merchants(
        self,
        limit: int = 50,
        min_attempts: int = 1,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get merchant rankings based on real CSV columns."""
        conn = self.get_connection()

        where_conditions = ["1=1"]
        params = []

        if start_date:
            where_conditions.append("CAST(created_at AS DATE) >= CAST(? AS DATE)")
            params.append(start_date)
        if end_date:
            where_conditions.append("CAST(created_at AS DATE) <= CAST(? AS DATE)")
            params.append(end_date)

        where_sql = " AND ".join(where_conditions)

        query = f"""
        SELECT
            merchant_key,
            category_title,
            COUNT(*) as total_attempts,
            COUNT(DISTINCT session_key) as unique_sessions,
            SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) as paid_attempts,
            SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) as completed_attempts,
            SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) as failed_attempts,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            SUM(adjusted_fee) as total_adjusted_fee,
            ROUND(
                CAST(SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) AS FLOAT) * 100.0
                / NULLIF(COUNT(*), 0), 2
            ) as success_rate_pct
        FROM payments
        WHERE {where_sql}
        GROUP BY merchant_key, category_title
        HAVING COUNT(*) >= ?
        ORDER BY total_attempts DESC
        LIMIT ?
        """

        params.extend([min_attempts, limit])

        rows = conn.execute(query, params).fetchall()
        labels = [desc[0] for desc in conn.description]

        results = []
        for row in rows:
            d = dict(zip(labels, row))
            if d.get("time_period") is not None and hasattr(d["time_period"], "strftime"):
                d["time_period"] = d["time_period"].strftime("%Y-%m-%d")
            results.append(d)
        return results

    def get_peer_comparison(self, merchant_key: str) -> dict[str, Any]:
        """Compare a merchant against its category peers using real CSV columns."""
        conn = self.get_connection()

        cat_row = conn.execute(
            "SELECT DISTINCT category_id, category_title FROM payments WHERE merchant_key = ? LIMIT 1",
            [merchant_key]
        ).fetchone()

        if not cat_row:
            return {"error": "Merchant not found"}

        category_id, category_title = cat_row[0], cat_row[1]

        # Get merchant totals and peer stats
        query = """
            WITH merchant_totals AS (
                SELECT
                    merchant_key,
                    SUM(amount) AS total_amount,
                    COUNT(*) AS total_attempts,
                    SUM(CASE WHEN session_status IN ('Verified','Paid','Reversed') THEN 1 ELSE 0 END) AS successful
                FROM payments
                WHERE category_id = ?
                GROUP BY merchant_key
            ),
            stats AS (
                SELECT
                    AVG(total_amount) AS peer_avg_amount,
                    AVG(CAST(successful AS FLOAT) / NULLIF(total_attempts, 0)) AS peer_avg_rate
                FROM merchant_totals
            )
            SELECT
                (SELECT total_amount FROM merchant_totals WHERE merchant_key = ?) AS my_amount,
                (SELECT successful FROM merchant_totals WHERE merchant_key = ?) AS my_success,
                (SELECT total_attempts FROM merchant_totals WHERE merchant_key = ?) AS my_attempts,
                s.peer_avg_amount,
                s.peer_avg_rate
            FROM stats s
            CROSS JOIN (SELECT COUNT(*) AS total FROM merchant_totals) m
        """
        row = conn.execute(query, [category_id, merchant_key, merchant_key, merchant_key]).fetchone()
        labels = [desc[0] for desc in conn.description]
        result = dict(zip(labels, row)) if row else {}

        # Calculate percentile rank
        rank_row = conn.execute(
            "SELECT COUNT(*) FROM (SELECT merchant_key, SUM(amount) AS total_amount FROM payments WHERE category_id = ? GROUP BY merchant_key) WHERE total_amount <= (SELECT SUM(amount) FROM payments WHERE merchant_key = ? AND category_id = ?)",
            [category_id, merchant_key, category_id]
        ).fetchone()
        total_merchants = conn.execute(
            "SELECT COUNT(DISTINCT merchant_key) FROM payments WHERE category_id = ?",
            [category_id]
        ).fetchone()[0]
        percentile_rank = round((rank_row[0] or 0) / (total_merchants or 1) * 100, 2)

        result["percentile_rank"] = percentile_rank
        result["category"] = category_title
        result["category_id"] = category_id
        my_success = result.get("my_success", 0) or 0
        my_attempts = result.get("my_attempts", 0) or 1
        result["my_success_rate"] = round(my_success / my_attempts * 100, 2)
        result["merchant_key"] = merchant_key

        return result

    def get_daily_trends(
        self,
        merchant_key: str | None = None,
        days: int = 90,
    ) -> list[dict[str, Any]]:
        """Daily volume, count, and success-rate trend for the last N days."""
        conn = self.get_connection()

        conditions = []
        params = []

        if merchant_key:
            conditions.append("merchant_key = ?")
            params.append(merchant_key)

        conditions_with_dates = [
            "CAST(created_at AS DATE) >= (SELECT MAX(CAST(created_at AS DATE)) - INTERVAL %d DAY FROM payments)" % days
        ]
        conditions_with_dates.extend(conditions)

        where_clause = ""
        if conditions_with_dates:
            where_clause = "WHERE " + " AND ".join(conditions_with_dates)

        query = f"""
            SELECT
                CAST(created_at AS DATE) AS day,
                COUNT(*) AS count,
                SUM(amount) AS amount,
                ROUND(
                    100.0 * SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 2
                ) AS success_rate
            FROM payments
            {where_clause}
            GROUP BY CAST(created_at AS DATE)
            ORDER BY day
        """

        rows = conn.execute(query, params).fetchall()
        labels = [desc[0] for desc in conn.description]

        results = []
        for row in rows:
            d = dict(zip(labels, row))
            if d.get("day") is not None and hasattr(d["day"], "strftime"):
                d["day"] = d["day"].strftime("%Y-%m-%d")
            results.append(d)
        return results

    def get_time_series(
        self,
        metric: str = "attempts",
        interval: str = "day",
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get time series data based on real CSV columns.

        interval: day, week, month
        metric: attempts, amount, paid, failed, revenue
        """
        conn = self.get_connection()

        valid_metrics = ["attempts", "amount", "paid", "failed", "revenue"]
        if metric not in valid_metrics:
            raise ValueError(f"Invalid metric. Choose from: {valid_metrics}")

        valid_intervals = ["day", "week", "month"]
        if interval not in valid_intervals:
            raise ValueError(f"Invalid interval. Choose from: {valid_intervals}")

        interval_expr = {
            "day": "CAST(created_at AS DATE)",
            "week": "CAST(DATE_TRUNC('week', created_at) AS DATE)",
            "month": "CAST(DATE_TRUNC('month', created_at) AS DATE)",
        }[interval]

        where_clauses = []
        params = []

        if start_date:
            where_clauses.append("CAST(created_at AS DATE) >= CAST(? AS DATE)")
            params.append(start_date)
        if end_date:
            where_clauses.append("CAST(created_at AS DATE) <= CAST(? AS DATE)")
            params.append(end_date)
        if merchant_key:
            where_clauses.append("merchant_key = ?")
            params.append(merchant_key)

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        if metric == "attempts":
            agg_expr = "COUNT(*)"
        elif metric == "amount":
            agg_expr = "SUM(amount)"
        elif metric == "revenue":
            agg_expr = "SUM(CASE WHEN session_status = 'Paid' THEN amount ELSE 0 END)"
        elif metric == "paid":
            agg_expr = "SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END)"
        elif metric == "failed":
            agg_expr = "SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END)"

        query = f"""
        SELECT
            {interval_expr} as time_period,
            {agg_expr} as value
        FROM payments
        {where_sql}
        GROUP BY time_period
        ORDER BY time_period
        """

        rows = conn.execute(query, params).fetchall()
        labels = [desc[0] for desc in conn.description]

        results = []
        for row in rows:
            d = dict(zip(labels, row))
            if d.get("time_period") is not None and hasattr(d["time_period"], "strftime"):
                d["time_period"] = d["time_period"].strftime("%Y-%m-%d")
            results.append(d)
        return results
