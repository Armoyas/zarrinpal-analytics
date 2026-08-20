"""
ZarrinPal processing pipeline — build analytical views from the DuckDB table.

Every view is expressed as an explicit SQL query so each dashboard number can
be traced back to its source (see the provenance endpoint / UI panel).
"""

from __future__ import annotations

import duckdb


def merchant_summary(con: duckdb.DuckDBPyConnection) -> duckdb.DuckDBPyRelation:
    """Per-merchant aggregate metrics (session level, deduplicated by session_key)."""
    return con.execute(
        """
        WITH sessions AS (
            SELECT DISTINCT
                session_key,
                merchant_key,
                category_id,
                category_title,
                amount,
                adjusted_fee,
                session_status
            FROM transactions
        )
        SELECT
            merchant_key,
            category_title,
            COUNT(*)                              AS txn_count,
            SUM(amount)                           AS total_amount,
            SUM(adjusted_fee)                     AS total_adjusted_fee,
            SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END) AS success_count,
            ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END)
                  / NULLIF(COUNT(*), 0), 2)      AS success_rate,
            ROUND(100.0 * SUM(adjusted_fee) / NULLIF(SUM(amount), 0), 4) AS fee_ratio
        FROM sessions
        GROUP BY merchant_key, category_title
        ORDER BY total_amount DESC
        """
    )


def daily_trends(con: duckdb.DuckDBPyConnection, days: int = 90) -> duckdb.DuckDBPyRelation:
    """Daily volume / count / success-rate trend."""
    return con.execute(
        f"""
        WITH sessions AS (
            SELECT DISTINCT
                session_key, amount, adjusted_fee, session_status,
                CAST(created_at AS DATE) AS day
            FROM transactions
        )
        SELECT
            day,
            SUM(amount) AS amount,
            COUNT(*)    AS count,
            ROUND(100.0 * SUM(CASE WHEN session_status = 'Verified' THEN 1 ELSE 0 END)
                  / NULLIF(COUNT(*), 0), 2) AS success_rate
        FROM sessions
        WHERE day >= (SELECT MAX(CAST(created_at AS DATE)) - INTERVAL {days} DAY FROM transactions)
        GROUP BY day
        ORDER BY day
        """
    )


def nowruz_analysis(con: duckdb.DuckDBPyConnection) -> duckdb.DuckDBPyRelation:
    """Compare session volume before / during / after Nowruz holidays.

    Uses March as the Nowruz window (Iranian New Year, ~Mar 20).
    """
    return con.execute(
        """
        WITH sessions AS (
            SELECT DISTINCT session_key, amount, CAST(created_at AS DATE) AS day
            FROM transactions
        )
        SELECT
            CASE
                WHEN month(day) = 1 THEN 'during'
                WHEN month(day) < 1  THEN 'before'
                ELSE 'after'
            END AS period,
            SUM(amount) AS volume,
            COUNT(*)    AS sessions
        FROM sessions
        WHERE day BETWEEN '2026-03-01' AND '2026-04-30'
        GROUP BY period
        ORDER BY period
        """
    )


def peer_comparison(con: duckdb.DuckDBPyConnection, merchant_key: str) -> duckdb.DuckDBPyRelation:
    """Merchant vs peers in the same category (median / p90 / percentile)."""
    return con.execute(
        """
        WITH sessions AS (
            SELECT DISTINCT session_key, merchant_key, category_id, amount
            FROM transactions
        ),
        merchant_total AS (
            SELECT merchant_key, category_id, SUM(amount) AS total
            FROM sessions GROUP BY merchant_key, category_id
        ),
        cat AS (
            SELECT category_id FROM merchant_total
            WHERE merchant_key = ?
        ),
        cat_totals AS (
            SELECT mt.total, mt.merchant_key
            FROM merchant_total mt
            WHERE mt.category_id = (SELECT category_id FROM cat)
        )
        SELECT
            (SELECT total FROM cat_totals WHERE merchant_key = ?)     AS merchant_amount,
            MEDIAN(total) OVER ()                                      AS peer_median,
            QUANTILE_CONT(total, 0.90) OVER ()                         AS peer_p90,
            100.0 * (SELECT COUNT(*) FROM cat_totals c2
                     WHERE c2.total <= (SELECT total FROM cat_totals WHERE merchant_key = ?))
                  / NULLIF((SELECT COUNT(*) FROM cat_totals), 0)      AS percentile
        FROM cat_totals
        LIMIT 1
        """,
        [merchant_key, merchant_key, merchant_key],
    )


def build_all_views(con: duckdb.DuckDBPyConnection) -> None:
    """Materialize analytical views for the API layer."""
    con.execute("CREATE OR REPLACE VIEW v_merchant_summary AS "
                + _view_sql(merchant_summary))


def _view_sql(rel: duckdb.DuckDBPyRelation) -> str:
    """Extract the SQL of a relation (best effort) for view creation."""
    return str(rel)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Build ZarrinPal analytical views")
    parser.add_argument("--db", default="zarrinpal.duckdb", help="DuckDB file")
    args = parser.parse_args()

    con = duckdb.connect(args.db)
    print(merchant_summary(con).df().head(10).to_string(index=False))
    con.close()
