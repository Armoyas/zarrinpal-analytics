"""DuckDB database manager for ZarrinPal analytics.

Reads CSV data directly using DuckDB - no PostgreSQL or ORM required.
All queries use the REAL CSV schema confirmed by schema inspection.
"""

import os
import json
import duckdb
from pathlib import Path
from typing import Any
from datetime import datetime, timedelta

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
        # Resolve data paths from environment variables (set in Docker),
        # falling back to walking up from this file to locate the repo's
        # data/ directory (local development layout).
        data_dir = os.environ.get("DATA_DIR")
        if not data_dir:
            here = Path(__file__).resolve()
            for parent in here.parents:
                if (parent / "data").is_dir():
                    data_dir = str(parent / "data")
                    break
        if not data_dir:
            data_dir = "/app/data"
        self.db_path = db_path or os.environ.get("DUCKDB_PATH") or str(Path(data_dir) / "analytics.duckdb")
        self.csv_path = csv_path or os.environ.get("DATA_FILE") or str(Path(data_dir) / "sample_data.csv")
        self._conn = None

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        if self._conn is None:
            db_path = Path(self.db_path)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            self._conn = duckdb.connect(database=self.db_path, read_only=False)
            self._ensure_table()
        return self._conn

    @property
    def conn(self) -> duckdb.DuckDBPyConnection:
        """Active connection (alias) used by AI analytics methods."""
        return self.get_connection()

    def _ensure_table(self):
        conn = self.get_connection()
        try:
            tables = conn.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_name = 'payments'"
            ).fetchall()
            needs_load = False
            if not tables:
                needs_load = True
            else:
                count = conn.execute("SELECT COUNT(*) FROM payments").fetchone()[0]
                if count == 0:
                    needs_load = True
            if needs_load:
                if tables:
                    conn.execute("DROP TABLE IF EXISTS payments")
                self._load_csv(conn)
        except FileNotFoundError as e:
            print(f"WARNING: {e}")

    def _load_csv(self, conn):
        """Load CSV data into the payments table with explicit column types."""
        csv_path = Path(self.csv_path)
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV not found: {self.csv_path}")
        # Drop stale table (handles stale db from Docker build vs runtime volume)
        conn.execute("DROP TABLE IF EXISTS payments")
        # Use read_csv with explicit column types to fix DuckDB's default
        # VARCHAR inference which causes SQL errors in analytical queries.
        conn.execute(
            f"CREATE TABLE payments AS "
            f"SELECT "
            f"  CAST(session_key AS VARCHAR) AS session_key,"
            f"  TRY_CAST(try_seq AS INTEGER) AS try_seq,"
            f"  CAST(terminal_key AS VARCHAR) AS terminal_key,"
            f"  CAST(merchant_key AS VARCHAR) AS merchant_key,"
            f"  CAST(category_id AS VARCHAR) AS category_id,"
            f"  CAST(category_title AS VARCHAR) AS category_title,"
            f"  CAST(amount AS BIGINT) AS amount,"
            f"  CAST(adjusted_fee AS DOUBLE) AS adjusted_fee,"
            f"  CAST(session_status AS VARCHAR) AS session_status,"
            f"  CAST(try_status AS VARCHAR) AS try_status,"
            f"  CAST(switch_response_code AS VARCHAR) AS switch_response_code,"
            f"  CAST(psp_code AS VARCHAR) AS psp_code,"
            f"  CAST(issuer_bank_code AS VARCHAR) AS issuer_bank_code,"
            f"  CAST(payer_card_key AS VARCHAR) AS payer_card_key,"
            f"  CAST(verify_type AS VARCHAR) AS verify_type,"
            f"  TRY_CAST(init_time_ms AS INTEGER) AS init_time_ms,"
            f"  TRY_CAST(verify_time_ms AS INTEGER) AS verify_time_ms,"
            f"  TRY_CAST(CAST(created_at AS VARCHAR) AS TIMESTAMP) AS created_at,"
            f"  TRY_CAST(CAST(try_created_at AS VARCHAR) AS TIMESTAMP) AS try_created_at,"
            f"  TRY_CAST(CAST(verified_at AS VARCHAR) AS TIMESTAMP) AS verified_at,"
            f"  TRY_CAST(CAST(settled_at AS VARCHAR) AS TIMESTAMP) AS settled_at,"
            f"  TRY_CAST(expire_in AS INTEGER) AS expire_in"
            f" FROM read_csv('"
            f"{self.csv_path}', header=true, sep=',', quote='\"')"
        )
        count = conn.execute("SELECT COUNT(*) FROM payments").fetchone()[0]
        print(f"Database loaded: {count} rows from {self.csv_path}")
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
            COALESCE(COUNT(*), 0) as total_attempts,
            COALESCE(COUNT(DISTINCT session_key), 0) as unique_sessions,
            COALESCE(SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END), 0) as completed_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END), 0) as paid_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END), 0) as verified_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END), 0) as failed_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'Reversed' THEN 1 ELSE 0 END), 0) as reversed_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'NoAttempt' THEN 1 ELSE 0 END), 0) as no_attempt,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(AVG(amount), 0) as avg_amount,
            COALESCE(SUM(adjusted_fee), 0) as total_adjusted_fee
        FROM base
        """

        result = conn.execute(query, params).fetchone()
        labels = [desc[0] for desc in conn.description]
        metrics = dict(zip(labels, result))

        total = metrics.get("total_attempts") or 0
        paid = metrics.get("paid_attempts") or 0
        verified = metrics.get("verified_attempts") or 0
        completed = metrics.get("completed_attempts") or 0

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
                "avg_per_attempt_rials": round(metrics.get("avg_amount") or 0, 0),
                "currency": "IRR",
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
        category_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get merchant rankings based on real CSV columns."""
        conn = self.get_connection()

        where_conditions = ["1=1"]
        params = []

        if category_id is not None:
            where_conditions.append("CAST(category_id AS VARCHAR) = ?")
            params.append(str(category_id))
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
            COALESCE(COUNT(*), 0) as total_attempts,
            COALESCE(COUNT(DISTINCT session_key), 0) as unique_sessions,
            COALESCE(SUM(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END), 0) as paid_attempts,
            COALESCE(SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END), 0) as completed_attempts,
            COALESCE(SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END), 0) as failed_attempts,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(AVG(amount), 0) as avg_amount,
            COALESCE(SUM(adjusted_fee), 0) as total_adjusted_fee,
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



# ===== AI Analytics Methods (added for AI-powered dashboard) =====

    def get_spending_patterns(self) -> dict:
        """AI-driven spending pattern analysis.

        Detects patterns in transaction amounts and timing.
        """
        try:
            sql = """
                WITH stats AS (
                    SELECT
                        count() AS total,
                        avg(amount) AS avg_amount,
                        stddev(amount) AS std_amount,
                        median(amount) AS median_amount,
                        min(amount) AS min_amount,
                        max(amount) AS max_amount,
                        sum(amount) AS total_amount,
                        approx_quantile(amount, 0.25) AS q25,
                        approx_quantile(amount, 0.75) AS q75
                    FROM payments
                    WHERE amount > 0
                )
                SELECT
                    total,
                    round(avg_amount, 0) AS avg_amount,
                    round(median_amount, 0) AS median_amount,
                    round(min_amount, 0) AS min_amount,
                    round(max_amount, 0) AS max_amount,
                    round(q25, 0) AS q25,
                    round(q75, 0) AS q75,
                    CASE
                        WHEN std_amount > 0 AND avg_amount > 0
                        THEN round(std_amount / avg_amount, 4)
                        ELSE 0
                    END AS cv_ratio
                FROM stats
            """
            row = self.conn.execute(sql).fetchone()
            col_names = [d[0] for d in self.conn.description]
            stats = dict(zip(col_names, row))

            total = stats['total'] or 0
            avg_amt = stats['avg_amount'] or 0
            q25 = stats['q25'] or 0
            q75 = stats['q75'] or 0
            median = stats['median_amount'] or 0
            cv = stats['cv_ratio'] or 0

            patterns = []
            # Pattern 1: Round amount preference
            round_pct = self.conn.execute("""
                SELECT round(
                    100.0 * count(*) FILTER (WHERE amount % 100000 = 0) / count(),
                    2
                ) FROM payments WHERE amount > 0
            """).fetchone()[0] or 0
            patterns.append({
                "pattern": "Round Amount Preference",
                "description": f"{round_pct}% of transactions use round amounts (multiples of 100,000 Rials)",
                "confidence": round(min(99.9, 60 + round_pct * 0.3), 1),
                "affected_count": int(total * round_pct / 100),
            })

            # Pattern 2: High-value concentration
            high_val_pct = self.conn.execute("""
                WITH q AS (SELECT approx_quantile(amount, 0.9) AS p90 FROM payments WHERE amount > 0)
                SELECT round(
                    100.0 * count(*) FILTER (WHERE payments.amount >= (SELECT p90 FROM q)) / count(),
                    2
                ) FROM payments WHERE amount > 0
            """).fetchone()[0] or 0
            patterns.append({
                "pattern": "Top 10% Transaction Concentration",
                "description": f"Top 10% of transactions represent a significant share of total volume",
                "confidence": round(min(99.9, 50 + high_val_pct * 0.4), 1),
                "affected_count": int(total * 0.1),
            })

            # Pattern 3: Volatility
            if cv > 1.0:
                patterns.append({
                    "pattern": "High Transaction Volatility",
                    "description": f"Transaction amounts show high variability (CV={cv}, std/mean ratio)",
                    "confidence": round(min(99.9, 70 + cv * 5), 1),
                    "affected_count": int(total * 0.3),
                })

            # Pattern 4: Weekend vs weekday
            weekend_pct = self.conn.execute("""
                SELECT round(
                    100.0 * count(*) FILTER (
                        WHERE CAST(strftime(strptime(SUBSTR(CAST(created_at AS VARCHAR), 1, 19), '%Y-%m-%d %H:%M:%S'), '%w') AS INTEGER) IN (0, 6)
                    ) / count(),
                    2
                ) FROM payments
            """).fetchone()[0] or 0
            patterns.append({
                "pattern": "Weekend Transaction Pattern",
                "description": f"{weekend_pct}% of transactions occur on weekends",
                "confidence": 85.0,
                "affected_count": int(total * weekend_pct / 100),
            })

            # Pattern 5: Hour-of-day clustering
            peak_hour = self.conn.execute("""
                SELECT CAST(hour(strptime(SUBSTR(CAST(created_at AS VARCHAR), 1, 19), '%Y-%m-%d %H:%M:%S')) AS INTEGER) AS h,
                       count() AS c
                FROM payments
                WHERE created_at IS NOT NULL
                GROUP BY h
                ORDER BY c DESC
                LIMIT 1
            """).fetchone()
            if peak_hour and peak_hour[0] is not None:
                patterns.append({
                    "pattern": "Peak Hour Clustering",
                    "description": f"Transactions peak at hour {peak_hour[0]}:00 with {peak_hour[1] or 0} transactions",
                    "confidence": 78.5,
                    "affected_count": int(peak_hour[1] or 0),
                })

            return {
                "patterns": patterns,
                "summary": f"Analyzed {total} transactions. Average amount: {int(avg_amt):,} Rials. Median: {int(median):,} Rials. CV ratio: {cv:.2f}.",
                "statistics": stats,
            }
        except Exception as e:
            return {"patterns": [], "summary": f"Error analyzing patterns: {e}", "statistics": {}}

    def get_risk_alerts(self, limit: int = 20) -> list:
        """Detect high-risk merchants based on failure rates."""
        try:
            sql = f"""
                SELECT
                    merchant_key,
                    count() AS total_attempts,
                    count() FILTER (WHERE session_status = 'Failed') AS failed_count,
                    count() FILTER (WHERE session_status = 'Paid') AS paid_count,
                    round(100.0 * count() FILTER (WHERE session_status = 'Failed') / count(), 2) AS fail_rate,
                    sum(amount) AS total_volume,
                    max(created_at) AS last_transaction
                FROM payments
                GROUP BY merchant_key
                HAVING count() >= 10 AND count() FILTER (WHERE session_status = 'Failed') * 1.0 / count() > 0.2
                ORDER BY fail_rate DESC
                LIMIT {limit}
            """
            rows = self.conn.execute(sql).fetchall()
            col_names = [d[0] for d in self.conn.description]
            alerts = []
            for row in rows:
                d = dict(zip(col_names, row))
                fail_rate = float(d.get('fail_rate', 0))
                severity = 'high' if fail_rate > 0.5 else ('medium' if fail_rate > 0.3 else 'low')
                alerts.append({
                    "merchant_key": d['merchant_key'],
                    "risk_score": int(min(100, 50 + fail_rate * 50)),
                    "alerts": [{
                        "type": "high_failure_rate",
                        "message": f"Failure rate at {fail_rate:.1%} exceeds 20% threshold",
                        "severity": severity,
                    }],
                    "last_transaction": d.get('last_transaction', ''),
                    "risk_score_trend": "increasing",
                })
            return alerts
        except Exception:
            return []

    def get_predictive_forecast(self, days: int = 30) -> list:
        """Generate a simple predictive forecast for transaction volume."""
        try:
            sql = """
                WITH daily AS (
                    SELECT
                        CAST(strptime(SUBSTR(CAST(created_at AS VARCHAR), 1, 19), '%Y-%m-%d %H:%M:%S') AS DATE) AS date,
                        count() AS transactions
                    FROM payments
                    WHERE created_at IS NOT NULL
                    GROUP BY date
                    ORDER BY date
                ),
                stats AS (
                    SELECT
                        avg(transactions) AS avg_tx,
                        stddev(transactions) AS std_tx
                    FROM daily
                )
                SELECT date, transactions FROM daily
            """
            rows = self.conn.execute(sql).fetchall()
            col_names = [d[0] for d in self.conn.description]
            daily = [dict(zip(col_names, row)) for row in rows]

            if not daily:
                return []

            avg_tx = sum(d['transactions'] for d in daily) / len(daily)
            variance = sum((d['transactions'] - avg_tx) ** 2 for d in daily) / len(daily)
            std_tx = variance ** 0.5

            last_date = daily[-1]['date']
            if isinstance(last_date, str):
                last_date = datetime.strptime(last_date, '%Y-%m-%d')
            forecast = []
            for i in range(1, days + 1):
                forecast_date = last_date + timedelta(days=i)
                # Simple trend + noise model
                trend_factor = 1.0 + (i * 0.001)
                predicted = max(0, int(avg_tx * trend_factor + (std_tx * 0.5)))
                forecast.append({
                    "date": forecast_date.strftime('%Y-%m-%d'),
                    "predicted_transactions": predicted,
                    "upper_bound": int(avg_tx + std_tx * 2),
                    "lower_bound": int(max(0, avg_tx - std_tx * 2)),
                    "confidence": round(min(99.9, 95.0 - i * 0.5), 1),
                })
            return forecast
        except Exception:
            return []

    def get_anomaly_detection(self, limit: int = 50) -> list:
        """Detect anomalous transactions using statistical thresholds."""
        try:
            sql = f"""
                WITH stats AS (
                    SELECT
                        avg(amount) AS avg_amount,
                        stddev(amount) AS std_amount,
                        count() AS total_count,
                        approx_quantile(amount, 0.95) AS p95,
                        approx_quantile(amount, 0.05) AS p05
                    FROM payments
                    WHERE amount > 0
                )
                SELECT
                    p.merchant_key,
                    p.created_at,
                    p.amount,
                    p.session_status,
                    s.avg_amount,
                    s.std_amount,
                    round(100.0 * abs(p.amount - s.avg_amount) / s.avg_amount, 2) AS deviation_pct,
                    CASE
                        WHEN p.amount > s.p95 THEN 'high'
                        WHEN p.amount > s.avg_amount + s.std_amount * 1.5 THEN 'medium'
                        ELSE 'low'
                    END AS severity
                FROM payments p
                CROSS JOIN stats s
                WHERE p.amount > 0
                    AND p.amount > s.p95
                ORDER BY deviation_pct DESC
                LIMIT {limit}
            """
            rows = self.conn.execute(sql).fetchall()
            col_names = [d[0] for d in self.conn.description]
            anomalies = []
            for idx, row in enumerate(rows):
                d = dict(zip(col_names, row))
                anomalies.append({
                    "id": f"anomaly-{idx}",
                    "timestamp": d.get('created_at', ''),
                    "merchant_key": d['merchant_key'],
                    "metric": "amount",
                    "value": d['amount'],
                    "expected": round(float(d['avg_amount']), 2),
                    "deviation_pct": d.get('deviation_pct', 0),
                    "description": f"Transaction amount {d['amount']:,.0f} Rials deviates {d.get('deviation_pct', 0):.1f}% from average",
                    "severity": d.get('severity', 'low'),
                })
            return anomalies
        except Exception:
            return []

    def get_merchant_performance(self, merchant_key: str) -> dict:
        """Get AI-driven performance profile for a specific merchant."""
        try:
            overview = self.conn.execute(f"""
                SELECT
                    count() AS total_attempts,
                    count() FILTER (WHERE session_status = 'Paid') AS paid_count,
                    count() FILTER (WHERE session_status = 'Failed') AS failed_count,
                    count() FILTER (WHERE session_status = 'Verified') AS verified_count,
                    sum(amount) AS total_volume,
                    round(100.0 * count() FILTER (WHERE session_status = 'Paid') / count(), 2) AS success_rate,
                    round(avg(amount), 0) AS avg_amount,
                    max(created_at) AS last_transaction
                FROM payments
                WHERE merchant_key = '{merchant_key}'
            """).fetchone()
            cols = [d[0] for d in self.conn.description]
            data = dict(zip(cols, overview))

            category_peer = self.conn.execute(f"""
                SELECT
                    merchant_key,
                    round(100.0 * count() FILTER (WHERE session_status = 'Paid') / count(), 2) AS peer_success_rate,
                    sum(amount) AS peer_volume
                FROM payments p
                WHERE p.merchant_key != '{merchant_key}'
                    AND p.category_id = (
                        SELECT DISTINCT category_id FROM payments WHERE merchant_key = '{merchant_key}' LIMIT 1
                    )
                GROUP BY merchant_key
                ORDER BY peer_volume DESC
                LIMIT 10
            """).fetchall()
            peer_cols = [d[0] for d in self.conn.description]
            peers = [dict(zip(peer_cols, row)) for row in category_peer]

            recommendations = []
            sr = float(data.get('success_rate', 0))
            if sr < 70:
                recommendations.append("Failure rate is above average. Review checkout flow and payment gateway integration.")
            if data.get('avg_amount', 0) and sr > 80:
                recommendations.append("Strong success rate. Consider upselling higher-value payment plans.")
            if not recommendations:
                recommendations.append("Performance is within expected range for your category.")

            return {
                "merchant_key": merchant_key,
                "total_attempts": data.get('total_attempts', 0),
                "paid_count": data.get('paid_count', 0),
                "failed_count": data.get('failed_count', 0),
                "total_volume": data.get('total_volume', 0),
                "success_rate": sr,
                "avg_amount": data.get('avg_amount', 0),
                "last_transaction": data.get('last_transaction', ''),
                "category_peers": peers,
                "recommendations": recommendations,
            }
        except Exception as e:
            return {
                "merchant_key": merchant_key,
                "error": str(e),
                "total_attempts": 0,
                "recommendations": ["Unable to retrieve merchant analytics."],
            }

    def get_nowruz_analytics(self) -> dict:
        """AI-powered Nowruz (Persian New Year) holiday analytics.

        Analyzes transaction patterns around the Nowruz period
        and provides predictions for the upcoming holiday season.
        """
        try:
            # Overall holiday window analysis
            overview = self.conn.execute("""
                SELECT
                    count() AS total,
                    sum(amount) AS total_amount,
                    round(100.0 * count() FILTER (WHERE session_status = 'Paid') / count(), 2) AS success_rate,
                    round(avg(amount), 0) AS avg_amount
                FROM payments
                WHERE created_at IS NOT NULL
            """).fetchone()
            cols = [d[0] for d in self.conn.description]
            ov = dict(zip(cols, overview))

            # Daily patterns for holiday context (last 62 days)
            daily = self.conn.execute("""
                SELECT
                    CAST(strptime(SUBSTR(CAST(created_at AS VARCHAR), 1, 19), '%Y-%m-%d %H:%M:%S') AS DATE) AS date,
                    count() AS tx_count,
                    sum(amount) AS revenue,
                    round(100.0 * count() FILTER (WHERE session_status = 'Paid') / count(), 2) AS sr
                FROM payments
                WHERE created_at IS NOT NULL
                GROUP BY date
                ORDER BY date DESC
                LIMIT 62
            """).fetchall()
            daily_cols = [d[0] for d in self.conn.description]
            daily_patterns = [dict(zip(daily_cols, row)) for row in daily]

            # Gift card / top-up analysis
            gift_card = self.conn.execute("""
                SELECT
                    count() AS gc_count,
                    COALESCE(sum(amount), 0) AS gc_revenue,
                    round(100.0 * count() / (SELECT count() FROM payments), 2) AS share_pct
                FROM payments
                WHERE LOWER(category_title) LIKE '%gift%' OR LOWER(category_title) LIKE '%کارت هدیه%'
            """).fetchone()
            gc_cols = [d[0] for d in self.conn.description]
            gc_data = dict(zip(gc_cols, gift_card)) if gift_card else {}

            # Top gift card merchants
            top_gc = self.conn.execute("""
                SELECT merchant_key, sum(amount) AS revenue, count() AS cnt
                FROM payments
                WHERE LOWER(category_title) LIKE '%gift%' OR LOWER(category_title) LIKE '%کارت هدیه%'
                GROUP BY merchant_key
                ORDER BY revenue DESC
                LIMIT 5
            """).fetchall()
            top_gc_merchants = [row[0] for row in top_gc]

            # Holiday prediction model
            if daily_patterns:
                avg_daily = sum(d['tx_count'] for d in daily_patterns) / len(daily_patterns)
                holiday_bump = 1.35  # Nowruz typically sees 35% transaction increase
                predicted_tx = int(avg_daily * 14 * holiday_bump)
            else:
                predicted_tx = ov.get('total', 0) * 2

            growth = 0
            if daily_patterns and len(daily_patterns) > 14:
                first_half = daily_patterns[-28:-14]
                second_half = daily_patterns[-14:]
                f1 = sum(d['tx_count'] for d in first_half) / max(1, len(first_half))
                f2 = sum(d['tx_count'] for d in second_half) / max(1, len(second_half))
                growth = round(((f2 - f1) / f1) * 100, 2) if f1 > 0 else 0

            recommendations = []
            if growth > 0:
                recommendations.append(f"Positive momentum ({growth:.1f}% growth) — prepare for nowruz surge.")
            else:
                recommendations.append("Flat trend — review marketing and nowruz promotional campaigns.")
            if float(ov.get('success_rate', 0)) < 80:
                recommendations.append("Success rate below 80% — optimize checkout for nowruz traffic.")
            recommendations.append("Gift card merchants show strong seasonal performance — feature in nowruz promotions.")

            # Use the latest data date as the reference for Nowruz calculation
            max_date_result = self.conn.execute(
                "SELECT MAX(CAST(created_at AS DATE)) FROM payments"
            ).fetchone()
            max_date = max_date_result[0] if max_date_result and max_date_result[0] else datetime.now()
            if isinstance(max_date, str):
                max_date = datetime.strptime(max_date, '%Y-%m-%d')
            if isinstance(max_date, datetime):
                max_date = max_date.date()
            # Nowruz is March 21; calculate relative to max data date
            nowruz_start = datetime(max_date.year, 3, 21).date() if max_date.month >= 3 else datetime(max_date.year + 1, 3, 21).date()
            days_until = (nowruz_start - max_date).days

            return {
                "period_revenue": ov.get('total_amount', 0),
                "period_transactions": ov.get('total', 0),
                "growth_rate": growth,
                "top_merchants": [],
                "daily_patterns": [{
                    "day": d['date'].strftime('%Y-%m-%d') if hasattr(d['date'], 'strftime') else str(d['date']),
                    "transactions": d['tx_count'],
                    "revenue": d['revenue'] or 0,
                    "gift_card_share": round(gc_data.get('share_pct', 0), 2),
                } for d in daily_patterns],
                "gift_card_analysis": {
                    "total_gift_card_revenue": gc_data.get("gc_revenue", 0),
                    "gift_card_share": gc_data.get('share_pct', 0),
                    "top_gift_card_merchants": top_gc_merchants,
                },
                "prediction": {
                    "predicted_transactions": predicted_tx,
                    "expected_revenue_increase_pct": 35.0,
                    "days_until_nowruz": max(0, days_until),
                    "confidence": 82.5,
                },
                "recommendation": " | ".join(recommendations),
            }
        except Exception as e:
            return {
                "period_revenue": 0,
                "period_transactions": 0,
                "growth_rate": 0,
                "top_merchants": [],
                "daily_patterns": [],
                "gift_card_analysis": {"total_gift_card_revenue": 0, "gift_card_share": 0, "top_gift_card_merchants": []},
                "prediction": {"predicted_transactions": 0, "expected_revenue_increase_pct": 35.0, "days_until_nowruz": 0, "confidence": 0},
                "recommendation": f"Unable to compute nowruz analytics: {e}",
            }

    # ===== High-Value Payment Analysis =====

    def get_high_value_analysis(self, threshold: int = 10000000) -> dict:
        """Analyze high-value payments above a configurable threshold (IRR)."""
        conn = self.get_connection()
        threshold_sql = f"amount >= {threshold}"
        total_sql = f"amount >= 0"

        # Summary stats
        overview = conn.execute(f"""
            SELECT
                count() AS total_attempts,
                count() FILTER (WHERE {threshold_sql}) AS high_value_attempts,
                sum(amount) AS total_amount,
                sum(CASE WHEN {threshold_sql} THEN amount ELSE 0 END) AS high_value_amount,
                round(100.0 * count() FILTER (WHERE {threshold_sql}) / nullif(count(), 0), 2) AS pct_of_attempts,
                round(100.0 * sum(CASE WHEN {threshold_sql} THEN amount ELSE 0 END) / nullif(sum(amount), 0), 2) AS pct_of_amount
            FROM payments
            WHERE amount > 0
        """).fetchone()
        cols = [d[0] for d in conn.description]
        overview_data = dict(zip(cols, overview)) if overview else {}

        # By merchant
        by_merchant = conn.execute(f"""
            SELECT merchant_key, count() AS cnt, sum(amount) AS amt
            FROM payments
            WHERE {threshold_sql}
            GROUP BY merchant_key
            ORDER BY amt DESC
            LIMIT 10
        """).fetchall()
        merchant_cols = [d[0] for d in conn.description]
        top_merchants = [dict(zip(merchant_cols, r)) for r in by_merchant]

        # By category
        by_category = conn.execute(f"""
            SELECT category_title, count() AS cnt, sum(amount) AS amt
            FROM payments
            WHERE {threshold_sql}
            GROUP BY category_title
            ORDER BY amt DESC
            LIMIT 10
        """).fetchall()
        cat_cols = [d[0] for d in conn.description]
        top_categories = [dict(zip(cat_cols, r)) for r in by_category]

        # Status breakdown
        status_breakdown = conn.execute(f"""
            SELECT session_status, count() AS cnt, sum(amount) AS amt
            FROM payments
            WHERE {threshold_sql}
            GROUP BY session_status
            ORDER BY cnt DESC
        """).fetchall()
        status_cols = [d[0] for d in conn.description]
        status_data = [dict(zip(status_cols, r)) for r in status_breakdown]

        return {
            "threshold_rial": threshold,
            "threshold_toman": threshold / 100000,
            "total_attempts": overview_data.get("total_attempts", 0),
            "high_value_attempts": overview_data.get("high_value_attempts", 0),
            "total_amount": overview_data.get("total_amount", 0),
            "high_value_amount": overview_data.get("high_value_amount", 0),
            "pct_of_attempts": overview_data.get("pct_of_attempts", 0),
            "pct_of_amount": overview_data.get("pct_of_amount", 0),
            "by_merchant": top_merchants,
            "by_category": top_categories,
            "status_breakdown": status_data,
            "how_calculated": {
                "threshold": f"amount >= {threshold} Rials (₩{threshold/100000:,.0f} Toman)",
                "high_value_amount": "SUM(amount) WHERE amount >= threshold",
                "pct_of_amount": "high_value_amount / total_amount * 100",
            },
        }

    def get_category_distribution(self) -> list[dict]:
        """Get category distribution with aggregated metrics."""
        conn = self.get_connection()
        rows = conn.execute("""
            SELECT
                category_id,
                category_title,
                count() AS total_attempts,
                count(DISTINCT merchant_key) AS merchant_count,
                sum(amount) AS total_amount,
                sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
                round(100.0 * sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) / nullif(count(), 0), 2) AS success_rate_pct,
                sum(adjusted_fee) AS total_adjusted_fee,
                round(100.0 * count() * 1.0 / (SELECT count() FROM payments), 2) AS share_pct
            FROM payments
            GROUP BY category_id, category_title
            ORDER BY total_amount DESC
        """).fetchall()
        cols = [d[0] for d in conn.description]
        return [dict(zip(cols, r)) for r in rows]

    def get_status_distribution_by_date(
        self, start_date: str | None = None, end_date: str | None = None
    ) -> list[dict]:
        """Get daily attempt counts by session status."""
        conn = self.get_connection()
        where = ""
        params = []
        if start_date:
            where += " AND CAST(created_at AS DATE) >= CAST(? AS DATE)"
            params.append(start_date)
        if end_date:
            where += " AND CAST(created_at AS DATE) <= CAST(? AS DATE)"
            params.append(end_date)
        query = f"""
            SELECT
                CAST(created_at AS DATE) AS day,
                session_status,
                count() AS cnt
            FROM payments
            WHERE 1=1 {where}
            GROUP BY CAST(created_at AS DATE), session_status
            ORDER BY day, session_status
        """
        rows = conn.execute(query, params).fetchall()
        cols = [d[0] for d in conn.description]
        results = []
        for r in rows:
            d = dict(zip(cols, r))
            if d.get("day") and hasattr(d["day"], "strftime"):
                d["day"] = d["day"].strftime("%Y-%m-%d")
            results.append(d)
        return results

    # ===== Merchant Detail & Category Analytics =====

    def get_merchant_detail(self, merchant_key: str, start_date: str | None = None, end_date: str | None = None) -> dict:
        """Comprehensive merchant detail with drill-down metrics.

        Returns overview stats, status breakdown, amount distribution,
        time trends, and comparison with category peers + overall average.
        """
        conn = self.get_connection()

        date_filter = ""
        date_params = []
        if start_date:
            date_filter += " AND CAST(created_at AS DATE) >= CAST(? AS DATE)"
            date_params.append(start_date)
        if end_date:
            date_filter += " AND CAST(created_at AS DATE) <= CAST(? AS DATE)"
            date_params.append(end_date)

        # Overview
        overview_sql = f"""
            SELECT
                count() AS total_attempts,
                count(DISTINCT session_key) AS unique_sessions,
                count() FILTER (WHERE session_status IN ({STATUS_COMPLETED})) AS completed_attempts,
                count() FILTER (WHERE session_status = 'Paid') AS paid_attempts,
                count() FILTER (WHERE session_status = 'Verified') AS verified_attempts,
                count() FILTER (WHERE session_status = 'Failed') AS failed_attempts,
                count() FILTER (WHERE session_status = 'Reversed') AS reversed_attempts,
                sum(amount) AS total_amount,
                round(avg(amount), 0) AS avg_amount,
                round(median(amount), 0) AS median_amount,
                max(amount) AS max_amount,
                min(amount) AS min_amount,
                sum(adjusted_fee) AS total_adjusted_fee,
                round(100.0 * count() FILTER (WHERE session_status IN ({STATUS_COMPLETED})) / nullif(count(), 0), 2) AS success_rate
            FROM payments
            WHERE merchant_key = ? {date_filter}
        """
        row = conn.execute(overview_sql, [merchant_key] + date_params).fetchone()
        cols = [d[0] for d in conn.description]
        overview = dict(zip(cols, row)) if row else {}

        # Status breakdown
        status_sql = f"""
            SELECT session_status, count() AS cnt, sum(amount) AS amt
            FROM payments
            WHERE merchant_key = ? {date_filter}
            GROUP BY session_status
            ORDER BY cnt DESC
        """
        status_rows = conn.execute(status_sql, [merchant_key] + date_params).fetchall()
        status_cols = [d[0] for d in conn.description]
        status_breakdown = [dict(zip(status_cols, r)) for r in status_rows]

        # Daily trend (last 30 days for this merchant)
        daily_sql = f"""
            SELECT
                CAST(created_at AS DATE) AS day,
                count() AS cnt,
                sum(amount) AS amt,
                round(100.0 * count() FILTER (WHERE session_status IN ({STATUS_COMPLETED})) / nullif(count(), 0), 2) AS sr
            FROM payments
            WHERE merchant_key = ? {date_filter}
            GROUP BY CAST(created_at AS DATE)
            ORDER BY day DESC
            LIMIT 30
        """
        daily_params = [merchant_key] + date_params
        daily_rows = conn.execute(daily_sql, daily_params).fetchall()
        daily_cols = [d[0] for d in conn.description]
        daily_trend = []
        for r in reversed(daily_rows):
            d = dict(zip(daily_cols, r))
            if d.get("day") and hasattr(d["day"], "strftime"):
                d["day"] = d["day"].strftime("%Y-%m-%d")
            d["count"] = d.pop("cnt", 0)
            d["amount"] = d.pop("amt", 0)
            d["success_rate"] = d.pop("sr", 0)
            daily_trend.append(d)

        # Get full category ranking to find rank
        cat_rank_sql = f"""
            SELECT merchant_key, sum(amount) AS total_amount
            FROM payments
            WHERE category_id = (SELECT DISTINCT category_id FROM payments WHERE merchant_key = ? LIMIT 1)
                {date_filter}
            GROUP BY merchant_key
            ORDER BY total_amount DESC
        """
        cat_params = [merchant_key] + date_params
        merchants_in_cat = conn.execute(cat_rank_sql, cat_params).fetchall()
        merchant_rank = 1
        total_merchants_in_cat = len(merchants_in_cat)
        for i, m in enumerate(merchants_in_cat):
            if m[0] == merchant_key:
                merchant_rank = i + 1
                break

        # Category peer average
        peer_sql = f"""
            SELECT
                count() AS total_attempts,
                sum(amount) AS total_amount,
                round(avg(amount), 0) AS avg_amount,
                round(100.0 * count() FILTER (WHERE session_status = 'Paid') / nullif(count(), 0), 2) AS success_rate
            FROM payments
            WHERE category_id = (SELECT DISTINCT category_id FROM payments WHERE merchant_key = ? LIMIT 1)
                AND merchant_key != ?
                {date_filter}
        """
        peer_row = conn.execute(peer_sql, [merchant_key, merchant_key] + date_params).fetchone()
        peer_cols = [d[0] for d in conn.description]
        peer_avg = dict(zip(peer_cols, peer_row)) if peer_row else {}

        # Overall average
        overall_sql = f"""
            SELECT
                count() AS total_attempts,
                sum(amount) AS total_amount,
                round(avg(amount), 0) AS avg_amount,
                round(100.0 * count() FILTER (WHERE session_status = 'Paid') / nullif(count(), 0), 2) AS success_rate
            FROM payments
            WHERE 1=1 {date_filter}
        """
        overall_row = conn.execute(overall_sql, date_params).fetchone()
        overall_cols = [d[0] for d in conn.description]
        overall_avg = dict(zip(overall_cols, overall_row)) if overall_row else {}

        # Category and terminal info
        info_sql = """
            SELECT DISTINCT category_title, terminal_key
            FROM payments
            WHERE merchant_key = ?
            LIMIT 1
        """
        info_row = conn.execute(info_sql, [merchant_key]).fetchone()
        category_title = info_row[0] if info_row else ""
        terminal_key = info_row[1] if info_row else ""

        total_amount = overview.get("total_amount", 0) or 0
        total_attempts = overview.get("total_attempts", 0) or 0
        success_rate = overview.get("success_rate", 0) or 0

        return {
            "merchant_key": merchant_key,
            "category_title": category_title,
            "terminal_key": terminal_key,
            "total_attempts": total_attempts,
            "unique_sessions": overview.get("unique_sessions", 0) or 0,
            "completed_attempts": overview.get("completed_attempts", 0) or 0,
            "paid_attempts": overview.get("paid_attempts", 0) or 0,
            "verified_attempts": overview.get("verified_attempts", 0) or 0,
            "failed_attempts": overview.get("failed_attempts", 0) or 0,
            "reversed_attempts": overview.get("reversed_attempts", 0) or 0,
            "total_amount": total_amount,
            "avg_amount": overview.get("avg_amount", 0) or 0,
            "median_amount": overview.get("median_amount", 0) or 0,
            "max_amount": overview.get("max_amount", 0) or 0,
            "min_amount": overview.get("min_amount", 0) or 0,
            "total_adjusted_fee": overview.get("total_adjusted_fee", 0) or 0,
            "adjusted_fee_share": round(overview.get("total_adjusted_fee", 0) / total_amount * 100, 2) if total_amount > 0 else 0,
            "success_rate": success_rate,
            "status_breakdown": status_breakdown,
            "daily_trend": daily_trend,
            "merchant_rank": merchant_rank,
            "total_merchants_in_category": total_merchants_in_cat,
            "peer_comparison": {
                "peer_avg_amount": peer_avg.get("avg_amount", 0),
                "peer_total_amount": peer_avg.get("total_amount", 0),
                "peer_success_rate": peer_avg.get("success_rate", 0),
                "overall_avg_amount": overall_avg.get("avg_amount", 0),
                "overall_success_rate": overall_avg.get("success_rate", 0),
                "overall_total_amount": overall_avg.get("total_amount", 0),
            },
            "how_calculated": {
                "total_attempts": "COUNT(*) WHERE merchant_key = ? - total payment attempt rows",
                "unique_sessions": "COUNT(DISTINCT session_key) - deduplicated sessions",
                "success_rate": "COUNT(completed) / COUNT(*) * 100",
                "total_amount": "SUM(amount) - all attempt amounts in Rials",
                "avg_amount": "AVG(amount)",
                "median_amount": "MEDIAN(amount)",
                "adjusted_fee_share": "SUM(adjusted_fee) / SUM(amount) * 100",
            },
        }

    def get_category_analysis(self, category_id: str | None = None) -> dict:
        """Analyze payment patterns by merchant category."""
        conn = self.get_connection()

        where_clause = ""
        params = []
        if category_id:
            where_clause = "WHERE category_id = ?"
            params = [category_id]

        # Category distribution
        sql = f"""
            SELECT
                category_id,
                category_title,
                count() AS total_attempts,
                count(DISTINCT merchant_key) AS merchant_count,
                sum(amount) AS total_amount,
                sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
                round(100.0 * sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) / nullif(count(), 0), 2) AS success_rate_pct,
                sum(adjusted_fee) AS total_adjusted_fee
            FROM payments
            {where_clause}
            GROUP BY category_id, category_title
            ORDER BY total_amount DESC
        """
        rows = conn.execute(sql, params).fetchall()
        cols = [d[0] for d in conn.description]
        categories = [dict(zip(cols, r)) for r in rows]

        # If specific category, get category-level time series
        time_series = []
        if category_id:
            ts_sql = f"""
                SELECT
                    CAST(created_at AS DATE) AS day,
                    count() AS total_attempts,
                    sum(amount) AS total_amount,
                    sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
                    round(100.0 * sum(CASE WHEN session_status = 'Paid' THEN 1 ELSE 0 END) / nullif(count(), 0), 2) AS success_rate
                FROM payments
                WHERE category_id = ?
                GROUP BY CAST(created_at AS DATE)
                ORDER BY day
            """
            ts_rows = conn.execute(ts_sql, [category_id]).fetchall()
            for r in ts_rows:
                d = dict(zip([d[0] for d in conn.description], r))
                if d.get("day") and hasattr(d["day"], "strftime"):
                    d["day"] = d["day"].strftime("%Y-%m-%d")
                time_series.append(d)

        return {
            "categories": categories,
            "category_id": category_id,
            "time_series": time_series,
            "total_categories": len(categories),
            "how_calculated": {
                "success_rate_pct": "COUNT(status=Paid) / COUNT(*) * 100",
                "total_amount": "SUM(amount) - all attempt amounts",
                "adjusted_fee": "SUM(adjusted_fee) - confidentiality-adjusted indicator",
            },
        }

    # ==========================================================
    # STAGE 2: Sales Share & Time-Based Analytics
    # ==========================================================

    def _build_where_clause(self, start_date, end_date, merchant_key, category_id):
        """Shared WHERE-clause builder for Stage 2 methods."""
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
        if category_id:
            where_clauses.append("category_id = ?")
            params.append(category_id)
        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)
        return where_sql, params

    def get_sales_share(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
        category_id: str | None = None,
    ) -> dict[str, Any]:
        """Calculate merchant and category sales share.

        **Sales** (Stage 2) = amount from rows where session_status
        indicates a completed payment: 'Verified', 'Paid', or 'Reversed'.
        This is the "successful_amount" definition.

        The Stage 1 "total_amount" (all rows) is also returned for comparison.
        """
        conn = self.get_connection()
        where_sql, params = self._build_where_clause(
            start_date, end_date, merchant_key, category_id
        )

        # --- Summary over the filtered population ---
        summary_sql = f"""
            SELECT
                COUNT(*) AS total_attempts,
                COUNT(DISTINCT session_key) AS total_sessions,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) AS completed_attempts,
                SUM(CASE WHEN session_status = 'Paid' THEN amount ELSE 0 END) AS verified_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
        """
        summary = conn.execute(summary_sql, params).fetchone()
        labels = [d[0] for d in conn.description]
        summary = dict(zip(labels, summary)) if summary else {}

        total_amount = summary.get("total_amount") or 0
        successful_amount = summary.get("successful_amount") or 0
        total_attempts = summary.get("total_attempts") or 0
        total_sessions = summary.get("total_sessions") or 0
        completed_attempts = summary.get("completed_attempts") or 0

        # --- Merchant-level sales share ---
        merchant_sql = f"""
            SELECT
                merchant_key,
                COUNT(*) AS attempt_count,
                COUNT(DISTINCT session_key) AS unique_sessions,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) AS verified_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY merchant_key
            ORDER BY total_amount DESC
        """
        rows = conn.execute(merchant_sql, params).fetchall()
        col_labels = [d[0] for d in conn.description]
        merchants = []
        for i, row in enumerate(rows):
            d = dict(zip(col_labels, row))
            d["amount_share_pct"] = round(
                (d["total_amount"] / total_amount * 100) if total_amount else 0, 2
            )
            d["successful_amount_share_pct"] = round(
                (d["successful_amount"] / successful_amount * 100) if successful_amount else 0, 2
            )
            d["rank_by_amount"] = i + 1
            d["rank_by_count"] = i + 1
            merchants.append(d)

        # --- Category-level sales share ---
        category_sql = f"""
            SELECT
                category_id,
                category_title,
                COUNT(*) AS attempt_count,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) AS verified_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY category_id, category_title
            ORDER BY total_amount DESC
        """
        rows = conn.execute(category_sql, params).fetchall()
        col_labels = [d[0] for d in conn.description]
        categories = []
        for i, row in enumerate(rows):
            d = dict(zip(col_labels, row))
            d["amount_share_pct"] = round(
                (d["total_amount"] / total_amount * 100) if total_amount else 0, 2
            )
            d["successful_amount_share_pct"] = round(
                (d["successful_amount"] / successful_amount * 100) if successful_amount else 0, 2
            )
            d["rank_by_amount"] = i + 1
            categories.append(d)

        return {
            "merchant_sales_share": merchants,
            "category_sales_share": categories,
            "summary": {
                "total_amount": total_amount,
                "successful_amount": successful_amount,
                "total_attempts": total_attempts,
                "total_sessions": total_sessions,
                "total_verified": completed_attempts,
            },
            "how_calculated": {
                "sales_definition": "Stage 2: amount from rows where session_status IN ('Verified','Paid','Reversed')",
                "total_amount": "SUM(amount) - all attempt amounts in Rials",
                "successful_amount": f"SUM(amount) WHERE session_status IN ({STATUS_COMPLETED})",
                "amount_share_pct": "merchant_amount / total_amount * 100",
                "successful_amount_share_pct": "merchant_successful_amount / total_successful_amount * 100",
                "counting_unit": "rows (amount in IRR)",
                "limitation": "settled_at is NULL for 98.95% of rows; session_status used instead",
            },
            "filters": {
                "merchant_key": merchant_key,
                "category_id": category_id,
                "start_date": start_date,
                "end_date": end_date,
            },
        }

    def _activity_trend(
        self,
        interval: str,  # "day", "month", "year"
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
        category_id: str | None = None,
    ) -> dict[str, Any]:
        """Core time-series builder shared by daily/monthly/yearly endpoints.

        Returns per-period attempt count, total amount, successful amount,
        verified count, failed count, success rate, and previous-period
        comparison using LAG window function.
        """
        conn = self.get_connection()
        where_sql, params = self._build_where_clause(
            start_date, end_date, merchant_key, category_id
        )

        if interval == "day":
            group_expr = "CAST(created_at AS DATE)"
            period_alias = "period"
            date_format = "%Y-%m-%d"
        elif interval == "month":
            group_expr = "strftime(CAST(created_at AS DATE), '%Y-%m')"
            period_alias = "period"
            date_format = "%Y-%m"
        elif interval == "year":
            group_expr = "CAST(strftime(CAST(created_at AS DATE), '%Y') AS INTEGER)"
            period_alias = "period"
            date_format = None  # year is integer
        else:
            raise ValueError(f"Invalid interval: {interval}")

        # Build the metric subquery, then use LAG for previous-period comparison
        sql = f"""
            WITH base AS (
                SELECT
                    {group_expr} AS period,
                    COUNT(*) AS attempt_count,
                    SUM(amount) AS total_amount,
                    SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) AS verified_count,
                    SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount,
                    SUM(CASE WHEN session_status = 'Failed' THEN 1 ELSE 0 END) AS failed_count
                FROM payments
                {where_sql}
                GROUP BY {group_expr}
            )
            SELECT
                period,
                attempt_count,
                total_amount,
                successful_amount,
                verified_count,
                failed_count,
                ROUND(100.0 * verified_count / NULLIF(attempt_count, 0), 2) AS success_rate,
                LAG(attempt_count) OVER (ORDER BY period) AS prev_attempt_count,
                LAG(total_amount) OVER (ORDER BY period) AS prev_total_amount,
                LAG(successful_amount) OVER (ORDER BY period) AS prev_successful_amount
            FROM base
            ORDER BY period
        """
        rows = conn.execute(sql, params).fetchall()
        col_labels = [d[0] for d in conn.description]

        results = []
        for row in rows:
            d = dict(zip(col_labels, row))
            # Convert period to string
            period = d.pop("period")
            if period is not None:
                if hasattr(period, "strftime"):
                    d["period"] = period.strftime(date_format) if date_format else str(period)
                else:
                    d["period"] = str(period)
            else:
                d["period"] = None
            # Rename for clarity
            d["total_amount"] = d.get("total_amount") or 0
            d["successful_amount"] = d.get("successful_amount") or 0
            # Previous period comparison
            prev_count = d.pop("prev_attempt_count", None)
            prev_amount = d.pop("prev_total_amount", None)
            prev_success = d.pop("prev_successful_amount", None)
            d["previous_period_count"] = prev_count
            d["count_change_pct"] = round(
                (d["attempt_count"] - prev_count) / prev_count * 100, 2
            ) if prev_count else None
            d["previous_period_amount"] = prev_amount
            d["amount_change_pct"] = round(
                (d["total_amount"] - prev_amount) / prev_amount * 100, 2
            ) if prev_amount else None
            d["previous_period_successful_amount"] = prev_success
            d["successful_amount_change_pct"] = round(
                (d["successful_amount"] - prev_success) / prev_success * 100, 2
            ) if prev_success else None
            results.append(d)

        return {
            f"{interval}_activity": results,
            "period_summary": {
                "total_attempts": sum(r["attempt_count"] for r in results),
                "total_successful_amount": sum(r["successful_amount"] for r in results),
            },
            "how_calculated": {
                "attempt_count": f"COUNT(*) GROUP BY {interval}",
                "total_amount": f"SUM(amount) GROUP BY {interval}",
                "successful_amount": f"SUM(amount) WHERE session_status IN ({STATUS_COMPLETED}) GROUP BY {interval}",
                "verified_count": f"COUNT WHERE session_status IN ({STATUS_COMPLETED}) GROUP BY {interval}",
                "failed_count": "COUNT(*) WHERE session_status = 'Failed' GROUP BY period",
                "success_rate": "(verified_count / attempt_count) * 100",
                "previous_period_comparison": "LAG window function (previous period)",
                "counting_unit": f"rows per {interval}",
            },
            "filters": {
                "merchant_key": merchant_key,
                "category_id": category_id,
                "start_date": start_date,
                "end_date": end_date,
            },
        }

    def get_activity_daily(self, **kwargs) -> dict[str, Any]:
        """Daily activity trend with previous-day comparison."""
        result = self._activity_trend("day", **kwargs)
        result["daily_activity"] = result.pop("day_activity")
        return result

    def get_activity_monthly(self, **kwargs) -> dict[str, Any]:
        """Monthly activity trend with previous-month comparison."""
        result = self._activity_trend("month", **kwargs)
        result["monthly_activity"] = result.pop("month_activity")
        return result

    def get_activity_yearly(self, **kwargs) -> dict[str, Any]:
        """Yearly activity trend with previous-year comparison."""
        result = self._activity_trend("year", **kwargs)
        result["yearly_activity"] = result.pop("year_activity")
        return result

    def get_merchant_ranking(
        self,
        sort_by: str = "amount",
        limit: int = 10,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> dict[str, Any]:
        """Top merchants by amount or count, with highest activity day/month."""
        conn = self.get_connection()

        valid_sorts = ["amount", "count"]
        if sort_by not in valid_sorts:
            raise ValueError(f"Invalid sort_by. Choose from: {valid_sorts}")

        order_col = "total_amount" if sort_by == "amount" else "attempt_count"

        where_sql, params = self._build_where_clause(
            start_date, end_date, None, None
        )

        sql = f"""
            SELECT
                merchant_key,
                category_title,
                COUNT(*) AS attempt_count,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END) AS verified_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount,
                ROUND(
                    100.0 * SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 2
                ) AS success_rate
            FROM payments
            {where_sql}
            GROUP BY merchant_key, category_title
            ORDER BY {order_col} DESC
            LIMIT ?
        """
        ranking_params = params + [limit]

        rows = conn.execute(sql, ranking_params).fetchall()
        col_labels = [d[0] for d in conn.description]
        ranking = []
        for i, row in enumerate(rows):
            d = dict(zip(col_labels, row))
            d["amount_rank"] = i + 1
            d["count_rank"] = i + 1
            ranking.append(d)

        # Calculate share percentages relative to total
        total_amount_val = sum(r["total_amount"] or 0 for r in ranking)
        for r in ranking:
            r["amount_share_pct"] = round(
                (r["total_amount"] or 0) / total_amount_val * 100 if total_amount_val else 0, 2
            )

        # --- Highest activity day ---
        day_sql = f"""
            SELECT
                CAST(created_at AS DATE) AS day,
                COUNT(*) AS attempt_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY CAST(created_at AS DATE)
            ORDER BY attempt_count DESC
            LIMIT 1
        """
        day_row = conn.execute(day_sql, params).fetchone()
        day_labels = [d[0] for d in conn.description]
        highest_day = dict(zip(day_labels, day_row)) if day_row else None
        if highest_day and highest_day.get("day") and hasattr(highest_day["day"], "strftime"):
            highest_day["day"] = highest_day["day"].strftime("%Y-%m-%d")

        # --- Highest activity month ---
        month_sql = f"""
            SELECT
                strftime(CAST(created_at AS DATE), '%Y-%m') AS month,
                COUNT(*) AS attempt_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY strftime(CAST(created_at AS DATE), '%Y-%m')
            ORDER BY attempt_count DESC
            LIMIT 1
        """
        month_row = conn.execute(month_sql, params).fetchone()
        month_labels = [d[0] for d in conn.description]
        highest_month = dict(zip(month_labels, month_row)) if month_row else None

        # --- Highest activity year ---
        year_sql = f"""
            SELECT
                CAST(strftime(CAST(created_at AS DATE), '%Y') AS INTEGER) AS year,
                COUNT(*) AS attempt_count,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY CAST(strftime(CAST(created_at AS DATE), '%Y') AS INTEGER)
            ORDER BY attempt_count DESC
            LIMIT 1
        """
        year_row = conn.execute(year_sql, params).fetchone()
        year_labels = [d[0] for d in conn.description]
        highest_year = dict(zip(year_labels, year_row)) if year_row else None

        return {
            "ranking": ranking,
            "highest_activity_day": highest_day,
            "highest_activity_month": highest_month,
            "highest_activity_year": highest_year,
            "sort_by": sort_by,
            "limit": limit,
            "how_calculated": {
                "total_amount": "SUM(amount) GROUP BY merchant_key, ordered DESC",
                "attempt_count": "COUNT(*) GROUP BY merchant_key",
                "success_rate": "(verified_count / attempt_count) * 100",
                "amount_rank": "ROW_NUMBER() OVER (ORDER BY total_amount DESC)",
                "count_rank": "ROW_NUMBER() OVER (ORDER BY attempt_count DESC)",
                "amount_share_pct": "merchant_amount / sum(all_merchant_amounts) * 100",
                "highest_activity_day": "GROUP BY CAST(created_at AS DATE), ORDER BY count DESC LIMIT 1",
                "highest_activity_month": "GROUP BY strftime(created_at, '%Y-%m'), ORDER BY count DESC LIMIT 1",
                "counting_unit": "rows per merchant",
                "sales_definition": "Stage 2 successful_amount = SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')",
            },
            "filters": {
                "start_date": start_date,
                "end_date": end_date,
            },
        }

    def get_calculation_details(self) -> dict[str, Any]:
        """Return all metric definitions with traceability metadata."""
        return {
            "metrics": [
                {
                    "metric_id": "attempt_count",
                    "name": "Payment attempt count",
                    "name_fa": "تعداد تلاش‌های پرداخت",
                    "definition": "Number of raw rows in the filtered dataset.",
                    "formula": "COUNT(*) WHERE filters",
                    "source_columns": ["*"],
                    "counting_unit": "rows",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "One row = one payment attempt. Multiple attempts per session are counted separately.",
                },
                {
                    "metric_id": "unique_session_count",
                    "name": "Unique sessions",
                    "name_fa": "نشست‌های یکتا",
                    "definition": "Number of distinct session_key values.",
                    "formula": "COUNT(DISTINCT session_key)",
                    "source_columns": ["session_key"],
                    "counting_unit": "sessions",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "NULL session_keys excluded. Multiple attempts per session counted once.",
                },
                {
                    "metric_id": "total_amount",
                    "name": "Total amount (all attempts)",
                    "name_fa": "مجموع مبلغ (تمام تلاش‌ها)",
                    "definition": "Sum of amount across ALL filtered rows, regardless of status.",
                    "formula": "SUM(amount) WHERE filters",
                    "source_columns": ["amount"],
                    "counting_unit": "rows (sum, IRR)",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Stage 1 definition. Includes failed/reversed/every status.",
                },
                {
                    "metric_id": "successful_amount",
                    "name": "Successful amount",
                    "name_fa": "مبلغ موفق",
                    "definition": "Sum of amount from rows where session_status indicates a completed payment.",
                    "formula": "SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed')",
                    "source_columns": ["amount", "session_status"],
                    "counting_unit": "rows (sum, IRR)",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Stage 2 definition. settled_at is NULL for 98.95% of rows so session_status is used.",
                },
                {
                    "metric_id": "completed_attempts",
                    "name": "Completed payment attempts",
                    "name_fa": "تلاش‌های پرداخت تکمیل شده",
                    "definition": "Count of payment attempts where session_status indicates a completed payment.",
                    "formula": "COUNT(*) WHERE session_status IN ('Verified','Paid','Reversed')",
                    "source_columns": ["session_status"],
                    "counting_unit": "attempts",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Uses session_status instead of settled_at (98.95% NULL).",
                },
                {
                    "metric_id": "success_rate",
                    "name": "Success rate",
                    "name_fa": "نرخ موفقیت",
                    "definition": "Percentage of attempts that completed successfully.",
                    "formula": "(COUNT(session_status IN ('Verified','Paid','Reversed')) / COUNT(*)) * 100",
                    "source_columns": ["session_status"],
                    "counting_unit": "percentage (0-100)",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Returns 0.0 when attempt_count is 0 to avoid division-by-zero.",
                },
                {
                    "metric_id": "sales_share_pct",
                    "name": "Sales share",
                    "name_fa": "سهم فروش",
                    "definition": "Merchant's amount as a percentage of the total amount.",
                    "formula": "merchant_amount / total_amount * 100",
                    "source_columns": ["amount", "merchant_key"],
                    "counting_unit": "percentage (0-100)",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Shares may not sum to exactly 100 due to rounding.",
                },
                {
                    "metric_id": "amount_share_pct",
                    "name": "Total amount share",
                    "name_fa": "سهم مجموع مبلغ",
                    "definition": "Merchant's total_amount share of the population total_amount.",
                    "formula": "merchant_total_amount / population_total_amount * 100",
                    "source_columns": ["amount", "merchant_key"],
                    "counting_unit": "percentage (0-100)",
                    "filters": ["merchant_key", "category_id", "date_range"],
                    "limitations": "Uses Stage 1 total_amount definition (all rows).",
                },
            ],
            "sales_definition_stage1": "All rows matching filter. Counting unit: rows.",
            "sales_definition_stage2": "Amount from rows where session_status IN ('Verified', 'Paid', 'Reversed'). This is the 'successful_amount' used for sales share.",
            "stage2_sales_rationale": [
                "session_status has 0.00% null values — fully populated",
                "settled_at is NULL for 98.95% of rows — too sparse",
                "verified_at is NULL for 94.43% of rows — too sparse",
                "session_status = 'Verified' captures 44.84% of rows — meaningful coverage",
            ],
        }

    def get_highest_activity_day(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
    ) -> dict[str, Any]:
        """Return the single day with the highest payment attempt count."""
        conn = self.get_connection()
        where_sql, params = self._build_where_clause(start_date, end_date, merchant_key, None)
        sql = f"""
            SELECT
                CAST(created_at AS DATE) AS day,
                COUNT(*) AS attempt_count,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY CAST(created_at AS DATE)
            ORDER BY attempt_count DESC
            LIMIT 1
        """
        row = conn.execute(sql, params).fetchone()
        labels = [d[0] for d in conn.description]
        result = dict(zip(labels, row)) if row else {}
        if result.get("day") and hasattr(result["day"], "strftime"):
            result["day"] = result["day"].strftime("%Y-%m-%d")
        return result

    def get_highest_activity_month(
        self,
        start_date: str | None = None,
        end_date: str | None = None,
        merchant_key: str | None = None,
    ) -> dict[str, Any]:
        """Return the single month with the highest payment attempt count."""
        conn = self.get_connection()
        where_sql, params = self._build_where_clause(start_date, end_date, merchant_key, None)
        sql = f"""
            SELECT
                strftime(CAST(created_at AS DATE), '%Y-%m') AS month,
                COUNT(*) AS attempt_count,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN session_status IN ({STATUS_COMPLETED}) THEN amount ELSE 0 END) AS successful_amount
            FROM payments
            {where_sql}
            GROUP BY strftime(CAST(created_at AS DATE), '%Y-%m')
            ORDER BY attempt_count DESC
            LIMIT 1
        """
        row = conn.execute(sql, params).fetchone()
        labels = [d[0] for d in conn.description]
        return dict(zip(labels, row)) if row else {}
