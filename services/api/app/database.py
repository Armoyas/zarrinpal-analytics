"""
Database layer for ZarinPal Analytical Dashboard API.
Stage 1: Core Merchant Overview — deterministic DuckDB queries.
All analytics are computed in the backend; frontend consumes only API responses.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import duckdb

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATA_FILE = os.environ.get("DATA_FILE", "data/sample_data.csv")
DUCKDB_PATH = os.environ.get("DUCKDB_PATH", "data/analytics.duckdb")
TABLE_NAME = "zp_data"

# ---------------------------------------------------------------------------
# Connection management
# ---------------------------------------------------------------------------

_db: Optional[duckdb.DuckDBPyConnection] = None


def get_db() -> duckdb.DuckDBPyConnection:
    """Return the DuckDB connection, initializing if needed."""
    global _db
    if _db is None:
        _db = duckdb.connect(DUCKDB_PATH)
        _ensure_table()
    return _db


def close_db() -> None:
    """Close the DuckDB connection."""
    global _db
    if _db is not None:
        _db.close()
        _db = None


def _rows_to_dicts(result: duckdb.DuckDBPyConnection) -> list[dict[str, Any]]:
    """Convert a DuckDB query result to a list of dicts using column names."""
    cols = [d[0] for d in result.description]
    return [dict(zip(cols, row)) for row in result.fetchall()]


def _ensure_table() -> None:
    """Load CSV data into DuckDB if the table is not already populated."""
    db = _db
    assert db is not None
    try:
        result = db.sql(f"SELECT COUNT(*) as cnt FROM {TABLE_NAME}").fetchone()
        if result is not None and result[0] > 0:
            return
    except Exception:
        pass
    # Always load fresh to reflect the current CSV
    db.sql(f"DROP TABLE IF EXISTS {TABLE_NAME}")
    db.sql(f"""
        CREATE TABLE {TABLE_NAME} AS
        SELECT * FROM read_csv_auto('{DATA_FILE}', header=true, sep=',', strict_mode=false)
    """)


# ---------------------------------------------------------------------------
# Query helpers
# ---------------------------------------------------------------------------

def _merchant_filter(merchant_key: Optional[str]) -> str:
    """Return SQL WHERE fragment for merchant filtering."""
    if merchant_key:
        return f"merchant_key = '{merchant_key}'"
    return "TRUE"


def _date_filter(start_date: Optional[str], end_date: Optional[str]) -> str:
    """Return SQL WHERE fragment for date-range filtering on created_at."""
    parts: list[str] = []
    if start_date:
        parts.append(f"CAST(created_at AS DATE) >= DATE '{start_date}'")
    if end_date:
        parts.append(f"CAST(created_at AS DATE) <= DATE '{end_date}'")
    return " AND ".join(parts) if parts else "TRUE"


def _full_filter(
    merchant_key: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
) -> str:
    """Combine merchant and date filters into a single WHERE clause."""
    merchant = _merchant_filter(merchant_key)
    dates = _date_filter(start_date, end_date)
    return f"WHERE {merchant} AND {dates}"


# ---------------------------------------------------------------------------
# Public query functions
# ---------------------------------------------------------------------------

def get_schema() -> list[dict[str, Any]]:
    """Return column schema with null counts and roles."""
    db = get_db()
    total = db.sql("SELECT COUNT(*) as cnt FROM zp_data").fetchone()[0]

    # Get column names and types via DESCRIBE
    cols = db.sql("DESCRIBE zp_data").fetchall()
    results: list[dict[str, Any]] = []

    roles = {
        "session_key": "session_id",
        "try_seq": "attempt_seq",
        "merchant_key": "merchant_id",
        "terminal_key": "terminal_id",
        "category_id": "category_id",
        "category_title": "category_name",
        "amount": "payment_amount",
        "adjusted_fee": "fee_proxy",
        "session_status": "session_outcome",
        "try_status": "attempt_outcome",
        "created_at": "primary_timestamp",
        "verified_at": "verification_timestamp",
        "settled_at": "settlement_timestamp",
    }

    for col in cols:
        name = col[0]  # column name is first field in DESCRIBE result
        col_type = col[1]  # column type is second field
        # Get null count
        null_count = db.sql(
            f'SELECT COUNT(*) FROM zp_data WHERE "{name}" IS NULL OR CAST("{name}" AS VARCHAR) = \'\''
        ).fetchone()[0]
        null_pct = round(null_count / total * 100, 2) if total > 0 else 0.0
        results.append({
            "name": name,
            "type": col_type,
            "null_count": null_count,
            "null_pct": null_pct,
            "role": roles.get(name, "data"),
        })

    return results


def get_row_count() -> int:
    """Return total row count."""
    db = get_db()
    return int(db.sql("SELECT COUNT(*) as cnt FROM zp_data").fetchone()[0])


def get_merchants(category_id: Optional[int] = None) -> list[dict[str, Any]]:
    """Return merchant list with aggregate stats."""
    db = get_db()
    where = "TRUE"
    if category_id is not None:
        where = f"category_id = {category_id}"

    query = f"""
        SELECT
            merchant_key,
            category_id,
            category_title,
            LIST(DISTINCT terminal_key) AS terminals,
            COUNT(*) AS row_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(CASE WHEN session_status = 'Verified' THEN 1 END) AS verified_count
        FROM zp_data
        WHERE {where}
        GROUP BY merchant_key, category_id, category_title
        ORDER BY total_amount DESC
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    results: list[dict[str, Any]] = []
    for row in rows:
        row_dict = dict(zip(cols, row))
        results.append({
            "merchant_key": row_dict["merchant_key"],
            "category_id": row_dict["category_id"],
            "category_title": row_dict["category_title"],
            "terminal_keys": list(row_dict["terminals"]),
            "row_count": row_dict["row_count"],
            "total_amount": row_dict["total_amount"],
            "verified_count": row_dict["verified_count"],
        })
    return results


def get_overview_metrics(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Compute all overview metrics for a given merchant and date range."""
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)

    # --- Payment-attempt row count ---
    row_count = int(db.sql(f"SELECT COUNT(*) FROM zp_data {filt}").fetchone()[0])

    # --- Unique session count ---
    unique_sessions = int(
        db.sql(f"SELECT COUNT(DISTINCT session_key) FROM zp_data {filt}").fetchone()[0]
    )

    # --- Verified count ---
    verified_count = int(
        db.sql(
            f"SELECT COUNT(*) FROM zp_data {filt} AND session_status = 'Verified'"
        ).fetchone()[0]
    )

    # --- Settled count ---
    settled_count = int(
        db.sql(
            f"SELECT COUNT(*) FROM zp_data {filt} AND settled_at IS NOT NULL"
        ).fetchone()[0]
    )

    # --- Failed count ---
    failed_count = int(
        db.sql(
            f"SELECT COUNT(*) FROM zp_data {filt} AND session_status = 'Failed'"
        ).fetchone()[0]
    )

    # --- Total amount ---
    total_amount = int(
        db.sql(f"SELECT COALESCE(SUM(amount), 0) FROM zp_data {filt}").fetchone()[0]
    )

    # --- Average amount ---
    avg_row = db.sql(f"SELECT AVG(amount) FROM zp_data {filt}").fetchone()
    avg_amount = round(float(avg_row[0]), 2) if avg_row[0] is not None else 0.0

    # --- Success rate ---
    success_rate = round(verified_count / row_count * 100, 2) if row_count > 0 else 0.0

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    metrics: list[dict[str, Any]] = [
        {
            "metric_id": "payment_attempts",
            "label": "تعداد تلاش‌های پرداخت",
            "value": row_count,
            "definition": "تعداد کل ردیف‌های (سعی‌ها/اَتریب) در دیتاست",
            "formula": "COUNT(*)",
            "source_columns": ["session_key", "try_seq"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": None,
        },
        {
            "metric_id": "unique_sessions",
            "label": "سشن‌های منحصر به فرد",
            "value": unique_sessions,
            "definition": "تعداد session_key یکتا (هر session یک یا چند attempt می‌تواند داشته باشد)",
            "formula": "COUNT(DISTINCT session_key)",
            "source_columns": ["session_key"],
            "counting_unit": "session",
            "filters": filters,
            "limitations": None,
        },
        {
            "metric_id": "verified_count",
            "label": "پرداخت‌های تأیید شده",
            "value": verified_count,
            "definition": "تعداد ردیف‌هایی که session_status = 'Verified'",
            "formula": "COUNT(*) WHERE session_status = 'Verified'",
            "source_columns": ["session_status"],
            "counting_unit": "verified_session",
            "filters": filters,
            "limitations": None,
        },
        {
            "metric_id": "settled_count",
            "label": "پرداخت‌های تسویه شده",
            "value": settled_count,
            "definition": "تعداد ردیف‌هایی که settled_at پر است",
            "formula": "COUNT(*) WHERE settled_at IS NOT NULL",
            "source_columns": ["settled_at"],
            "counting_unit": "settled_session",
            "filters": filters,
            "limitations": "settled_at is ~99% null; only 1.05% of rows have settlement data",
        },
        {
            "metric_id": "failed_count",
            "label": "شکست‌های پرداخت",
            "value": failed_count,
            "definition": "تعداد ردیف‌هایی که session_status = 'Failed'",
            "formula": "COUNT(*) WHERE session_status = 'Failed'",
            "source_columns": ["session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": None,
        },
        {
            "metric_id": "success_rate",
            "label": "نرخ موفقیت",
            "value": success_rate,
            "definition": "نسبت پرداخت‌های تأیید شده به کل تلاش‌ها",
            "formula": "COUNT(Verified) / COUNT(*) * 100",
            "source_columns": ["session_status"],
            "counting_unit": "verified_session",
            "filters": filters,
            "limitations": "Success rate is based on session_status = 'Verified' relative to total attempt rows",
        },
        {
            "metric_id": "total_amount",
            "label": "مجموع مبلغ",
            "value": total_amount,
            "definition": "مجموع تمام مبالغ به ریال",
            "formula": "SUM(amount)",
            "source_columns": ["amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": None,
        },
        {
            "metric_id": "avg_amount",
            "label": "متوسط مبلغ",
            "value": avg_amount,
            "definition": "متوسط مبلغ پرداختی به ریال",
            "formula": "AVG(amount)",
            "source_columns": ["amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": None,
        },
    ]

    return metrics


def get_daily_trends(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Return daily aggregation data for trend charts."""
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)

    query = f"""
        SELECT
            CAST(created_at AS DATE) AS date,
            COUNT(*) AS attempts,
            COALESCE(SUM(amount), 0) AS amount,
            COUNT(DISTINCT session_key) AS sessions,
            COUNT(CASE WHEN session_status = 'Verified' THEN 1 END) AS verified,
            COUNT(CASE WHEN session_status = 'Failed' THEN 1 END) AS failed
        FROM zp_data
        {filt}
        GROUP BY CAST(created_at AS DATE)
        ORDER BY date
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    results: list[dict[str, Any]] = []
    for row in rows:
        row_dict = dict(zip(cols, row))
        results.append({
            "date": str(row_dict["date"]),
            "attempts": row_dict["attempts"],
            "amount": row_dict["amount"],
            "sessions": row_dict["sessions"],
            "verified": row_dict["verified"],
            "failed": row_dict["failed"],
        })
    return results


# ---------------------------------------------------------------------------
# Stage 2 — Sales Share & Time-Based Analytics
# ---------------------------------------------------------------------------

# Sales definition for Stage 2:
# "Sales" = amount from rows where session_status IN ('Verified', 'Paid', 'Reversed')
# These represent completed/successful payment outcomes.
# This is a COUNTING unit of 'row' but the business meaning is 'successful amount'.
SALES_STATUSES = "'Verified', 'Paid', 'Reversed'"


def _successful_filter() -> str:
    """Return SQL fragment for successful payment statuses."""
    return f"session_status IN ({SALES_STATUSES})"


def _activity_trend(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    interval: str = "day",
) -> list[dict[str, Any]]:
    """Return time-series aggregation for a given interval (day/month/year).

    Uses created_at for grouping. Returns one entry per time bucket with:
      - time_period (str): bucket label
      - attempts (int): COUNT(*)
      - amount (int): SUM(amount)
      - successful_amount (int): SUM(amount) for verified payments
      - success_rate (float): successful/attempts * 100
    """
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)

    if interval == "day":
        group_expr = "CAST(created_at AS DATE)"
        alias = "date"
    elif interval == "month":
        group_expr = "strftime(CAST(created_at AS TIMESTAMP), '%Y-%m')"
        alias = "month"
    elif interval == "year":
        group_expr = "strftime(CAST(created_at AS TIMESTAMP), '%Y')"
        alias = "year"
    else:
        raise ValueError(f"Unknown interval: {interval}")

    query = f"""
        SELECT
            {group_expr} AS time_period,
            COUNT(*) AS attempts,
            COALESCE(SUM(amount), 0) AS amount,
            COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS successful_amount,
            ROUND(COALESCE(COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END), 0) * 100.0 / COUNT(*), 2) AS success_rate
        FROM zp_data
        {filt}
        GROUP BY {group_expr}
        ORDER BY time_period
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    results: list[dict[str, Any]] = []
    for row in rows:
        row_dict = dict(zip(cols, row))
        row_dict["time_period"] = str(row_dict["time_period"])
        results.append(row_dict)
    return results


def get_daily_activity(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return daily payment count trend (Stage 2).

    Counting unit: row (payment attempt)
    """
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)
    data = _activity_trend(merchant_key, start_date, end_date, interval="day")
    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "merchant_key": merchant_key or "ALL",
        "time_range": {
            "start": start_date or "1300-01-01",
            "end": end_date or "1450-12-30",
        },
        "daily_activity": data,
        "traceability": {
            "metric_id": "daily_payment_count",
            "definition": "Daily count of payment attempt rows, with successful-amount and success-rate trend.",
            "formula": "GROUP BY CAST(created_at AS DATE) → COUNT(*), SUM(amount), SUM(CASE WHEN session_status IN ('Verified','Paid','Reversed') THEN amount ELSE 0 END), success_rate",
            "source_columns": ["created_at", "session_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "Based on created_at only. settled_at is ~99% null.",
        },
    }


def get_monthly_activity(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return monthly payment count trend (Stage 2).

    Counting unit: row (payment attempt)
    """
    db = get_db()
    data = _activity_trend(merchant_key, start_date, end_date, interval="month")
    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "merchant_key": merchant_key or "ALL",
        "monthly_activity": data,
        "traceability": {
            "metric_id": "monthly_payment_count",
            "definition": "Monthly count of payment attempt rows, with amount trend and success rate.",
            "formula": "GROUP BY strftime(CAST(created_at AS TIMESTAMP), '%Y-%m') → COUNT(*), SUM(amount), success_rate",
            "source_columns": ["created_at", "session_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "Based on created_at. Monthly buckets derive from created_at timestamp.",
        },
    }


def get_yearly_activity(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return yearly payment count trend (Stage 2).

    Counting unit: row (payment attempt)
    """
    db = get_db()
    data = _activity_trend(merchant_key, start_date, end_date, interval="year")
    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "merchant_key": merchant_key or "ALL",
        "yearly_activity": data,
        "traceability": {
            "metric_id": "yearly_payment_count",
            "definition": "Yearly count of payment attempt rows, with amount and success rate.",
            "formula": "GROUP BY strftime(CAST(created_at AS TIMESTAMP), '%Y') → COUNT(*), SUM(amount), success_rate",
            "source_columns": ["created_at", "session_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "Based on created_at year extraction.",
        },
    }


def get_merchant_ranking(
    by: str = "amount",
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Rank merchants by amount or count (Stage 2).

    Counting unit depends on 'by':
      - by='amount': row (sum of amount)
      - by='count': row (COUNT(*))
    """
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)
    if by == "count":
        metric = "COUNT(*)"
        label_key = "attempt_count"
    else:
        metric = "COALESCE(SUM(amount), 0)"
        label_key = "total_amount"

    query = f"""
        SELECT
            merchant_key,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(*) AS attempt_count,
            COUNT(CASE WHEN session_status = 'Verified' THEN 1 END) AS verified_count,
            ROUND(COALESCE(COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END), 0) * 100.0 / COUNT(*), 2) AS success_rate
        FROM zp_data
        {filt}
        GROUP BY merchant_key
        ORDER BY {metric} DESC
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    rankings = [dict(zip(cols, row)) for row in rows]

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "ranking_by": by,
        "total_merchants": len(rankings),
        "rankings": rankings,
        "traceability": {
            "metric_id": f"merchant_ranking_{by}",
            "definition": f"Merchant ranking by {by}. Amount uses SUM(amount) across all rows; count uses COUNT(*).",
            "formula": f"GROUP BY merchant_key → {metric} ORDER BY {metric} DESC",
            "source_columns": ["merchant_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "All amounts in IRR. Success rate based on session_status IN ('Verified','Paid','Reversed').",
        },
    }


def get_highest_activity_day(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return the day with the highest activity (Stage 2)."""
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)
    query = f"""
        SELECT
            CAST(created_at AS DATE) AS activity_day,
            COUNT(*) AS attempt_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(DISTINCT session_key) AS unique_sessions,
            COUNT(CASE WHEN session_status = 'Verified' THEN 1 END) AS verified_count
        FROM zp_data
        {filt}
        GROUP BY CAST(created_at AS DATE)
        ORDER BY attempt_count DESC, total_amount DESC
        LIMIT 1
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    row = result.fetchall()
    if row:
        peak = dict(zip(cols, row[0]))
    else:
        peak = {"activity_day": None, "attempt_count": 0, "total_amount": 0,
                "unique_sessions": 0, "verified_count": 0}

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "peak_day": peak,
        "traceability": {
            "metric_id": "highest_activity_day",
            "definition": "Day with the highest number of payment attempt rows.",
            "formula": "GROUP BY CAST(created_at AS DATE) → ORDER BY COUNT(*) DESC → LIMIT 1",
            "source_columns": ["created_at", "session_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "Ties broken by total_amount descending.",
        },
    }


def get_highest_activity_month(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return the month with the highest activity (Stage 2)."""
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)
    query = f"""
        SELECT
            strftime(CAST(created_at AS TIMESTAMP), '%Y-%m') AS activity_month,
            COUNT(*) AS attempt_count,
            COALESCE(SUM(amount), 0) AS total_amount,
            COUNT(DISTINCT session_key) AS unique_sessions
        FROM zp_data
        {filt}
        GROUP BY strftime(CAST(created_at AS TIMESTAMP), '%Y-%m')
        ORDER BY attempt_count DESC, total_amount DESC
        LIMIT 1
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    row = result.fetchall()
    if row:
        peak = dict(zip(cols, row[0]))
    else:
        peak = {"activity_month": None, "attempt_count": 0, "total_amount": 0,
                "unique_sessions": 0}

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "peak_month": peak,
        "traceability": {
            "metric_id": "highest_activity_month",
            "definition": "Month with the highest number of payment attempt rows.",
            "formula": "GROUP BY strftime(created_at, '%Y-%m') → ORDER BY COUNT(*) DESC → LIMIT 1",
            "source_columns": ["created_at", "session_key", "amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "Ties broken by total_amount descending.",
        },
    }


def get_sales_share(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: str = "merchant",
) -> dict[str, Any]:
    """Return sales (successful-amount) share by merchant or category (Stage 2).

    Sales definition: SUM(amount) WHERE session_status IN ('Verified', 'Paid', 'Reversed')
    This is DIFFERENT from Stage 1 total_amount (which sums all rows).

    Counting unit: row (successful payment attempts)
    """
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)
    group_col = "merchant_key" if group_by == "merchant" else "category_title"

    # Sub-query: successful amount per group
    share_query = f"""
        WITH filtered AS (
            SELECT * FROM zp_data {filt}
        ),
        group_sales AS (
            SELECT
                {group_col} AS group_key,
                COUNT(*) AS attempt_count,
                COALESCE(SUM(amount), 0) AS total_amount,
                COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS sales_amount,
                COUNT(CASE WHEN session_status = 'Verified' THEN 1 END) AS verified_count,
                COUNT(CASE WHEN session_status = 'Failed' THEN 1 END) AS failed_count,
                ROUND(COALESCE(COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END), 0) * 100.0 / COUNT(*), 2) AS success_rate
            FROM filtered
            GROUP BY {group_col}
        ),
        totals AS (
            SELECT COALESCE(SUM(sales_amount), 0) AS total_sales, COALESCE(SUM(total_amount), 0) AS grand_total
            FROM group_sales
        )
        SELECT
            gs.group_key,
            gs.attempt_count,
            gs.total_amount,
            gs.sales_amount,
            ROUND(gs.sales_amount * 100.0 / NULLIF(t.total_sales, 0), 2) AS sales_share_pct,
            gs.verified_count,
            gs.failed_count,
            gs.success_rate,
            t.total_sales
        FROM group_sales gs CROSS JOIN totals t
        ORDER BY gs.sales_amount DESC
    """
    result = db.sql(share_query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    shares = [dict(zip(cols, row)) for row in rows]

    # Also compute aggregate-level sales
    agg_query = f"""
        SELECT
            COUNT(*) AS total_attempts,
            COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS total_sales_amount,
            COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END) AS total_successful,
            ROUND(COALESCE(COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END), 0) * 100.0 / COUNT(*), 2) AS aggregate_success_rate
        FROM zp_data {filt}
    """
    agg_result = db.sql(agg_query)
    agg_cols = [d[0] for d in agg_result.description]
    agg_row = agg_result.fetchall()
    aggregate = dict(zip(agg_cols, agg_row[0])) if agg_row else {}

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "group_by": group_by,
        f"{group_by}_shares": shares,
        "aggregate": aggregate,
        "traceability": {
            "metric_id": "sales_share",
            "definition": "Sales share by " + group_by + ". 'Sales' = SUM(amount) WHERE session_status IN ('Verified','Paid','Reversed') — completed payments only.",
            "formula": f"sales_amount / total_sales * 100, where sales_amount = SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END) GROUP BY {group_col}",
            "source_columns": ["merchant_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "adjusted_fee is NOT used here. Sales is NOT total amount (Stage 1 total_amount includes failed rows). 'Sales' excludes failed attempts.",
        },
    }


def get_previous_period_comparison(
    merchant_key: Optional[str] = None,
) -> dict[str, Any]:
    """Compare current period vs previous period metrics (Stage 2).

    Compares the most recent N days vs the N days immediately before.
    Default N = 30 days.
    """
    db = get_db()
    merchant_filter = _merchant_filter(merchant_key)
    n = 30
    query = f"""
        WITH date_bounds AS (
            SELECT
                MAX(CAST(created_at AS DATE)) AS max_date,
                MAX(CAST(created_at AS DATE)) - INTERVAL '{n} days' AS period_start
            FROM zp_data WHERE {merchant_filter}
        ),
        current_period AS (
            SELECT
                COUNT(*) AS current_attempts,
                COALESCE(SUM(amount), 0) AS current_amount,
                COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS current_sales,
                COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END) AS current_successful
            FROM zp_data, date_bounds
            WHERE {merchant_filter}
                AND CAST(created_at AS DATE) > date_bounds.max_date - INTERVAL '{n} days'
                AND CAST(created_at AS DATE) <= date_bounds.max_date
        ),
        previous_period AS (
            SELECT
                COUNT(*) AS prev_attempts,
                COALESCE(SUM(amount), 0) AS prev_amount,
                COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS prev_sales,
                COUNT(CASE WHEN session_status IN ({SALES_STATUSES}) THEN 1 END) AS prev_successful
            FROM zp_data, date_bounds
            WHERE {merchant_filter}
                AND CAST(created_at AS DATE) > date_bounds.max_date - INTERVAL '{n * 2} days'
                AND CAST(created_at AS DATE) <= date_bounds.max_date - INTERVAL '{n} days'
        )
        SELECT
            cp.current_attempts,
            cp.current_amount,
            cp.current_sales,
            cp.current_successful,
            pp.prev_attempts,
            pp.prev_amount,
            pp.prev_sales,
            pp.prev_successful,
            ROUND((cp.current_attempts - pp.prev_attempts) * 100.0 / NULLIF(pp.prev_attempts, 0), 2) AS attempt_change_pct,
            ROUND((cp.current_amount - pp.prev_amount) * 100.0 / NULLIF(pp.prev_amount, 0), 2) AS amount_change_pct,
            ROUND((cp.current_sales - pp.prev_sales) * 100.0 / NULLIF(pp.prev_sales, 0), 2) AS sales_change_pct
        FROM current_period cp CROSS JOIN previous_period pp
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    comp = dict(zip(cols, rows[0])) if rows else {}

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key

    return {
        "period_days": n,
        "comparison": comp,
        "traceability": {
            "metric_id": "previous_period_comparison",
            "definition": "Compares last 30 days vs the 30 days before that for a merchant (or all).",
            "formula": "current_period_metrics vs previous_period_metrics, change_pct = (current - previous) / previous * 100",
            "source_columns": ["created_at", "merchant_key", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": "30-day window relative to the latest date in the dataset. Requires sufficient data depth.",
        },
    }


# ---------------------------------------------------------------------------
# Stage 3 — Adjusted-Fee Analysis
# ---------------------------------------------------------------------------

# ⚠️ CRITICAL BUSINESS RULE — DO NOT REMOVE ⚠️
# adjusted_fee is a CONFIDENTIALITY-ADJUSTED FEE INDICATOR, NOT the actual
# ZarinPal fee. It was derived using a constant scaling factor and cannot
# represent real pricing. It must NEVER be labeled as the actual fee.
# Relative comparisons within the dataset may remain valid.
ADJUSTED_FEE_LABEL_EN = "Confidentiality-adjusted fee indicator"
ADJUSTED_FEE_LABEL_FA = "شاخص کارمزد تعدیلشده برای مقایسه نسبی"
ADJUSTED_FEE_LIMITATION = (
    "adjusted_fee is a confidentiality-adjusted indicator, NOT the actual "
    "ZarinPal fee. Absolute values are not real pricing. Relative comparisons "
    "within the dataset may remain valid."
)


def get_adjusted_fee_metrics(
    merchant_key: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return adjusted-fee indicator aggregate metrics (Stage 3).

    The adjusted_fee column is a CONFIDENTIALITY-ADJUSTED FEE INDICATOR,
    not the actual ZarinPal fee. All outputs are clearly labeled.
    """
    db = get_db()
    filt = _full_filter(merchant_key, start_date, end_date)

    query = f"""
        SELECT
            COUNT(*) AS row_count,
            COALESCE(SUM(adjusted_fee), 0) AS total_adjusted_fee,
            ROUND(AVG(adjusted_fee), 2) AS avg_adjusted_fee,
            COALESCE(MIN(adjusted_fee), 0) AS min_adjusted_fee,
            COALESCE(MAX(adjusted_fee), 0) AS max_adjusted_fee,
            COALESCE(SUM(amount), 0) AS total_amount,
            COALESCE(SUM(CASE WHEN session_status IN ({SALES_STATUSES}) THEN amount ELSE 0 END), 0) AS sales_amount,
            ROUND(COALESCE(SUM(adjusted_fee), 0) * 100.0 / NULLIF(SUM(amount), 0), 4) AS fee_share_of_amount_pct
        FROM zp_data
        {filt}
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    metrics = dict(zip(cols, rows[0])) if rows else {}

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "label_en": ADJUSTED_FEE_LABEL_EN,
        "label_fa": ADJUSTED_FEE_LABEL_FA,
        "metrics": metrics,
        "traceability": {
            "metric_id": "adjusted_fee_indicators",
            "definition": (
                ADJUSTED_FEE_LABEL_EN + " — sum, average, min, max, "
                "and share of amount. NOT the actual ZarinPal fee."
            ),
            "formula": (
                f"SUM(adjusted_fee), AVG(adjusted_fee), "
                f"fee_share_of_amount_pct = SUM(adjusted_fee) / SUM(amount) * 100"
            ),
            "source_columns": ["adjusted_fee", "amount", "session_status"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": ADJUSTED_FEE_LIMITATION,
        },
    }


def get_adjusted_fee_trend(
    merchant_key: Optional[str] = None,
    interval: str = "month",
) -> dict[str, Any]:
    """Return adjusted-fee indicator trend over time (Stage 3)."""
    db = get_db()
    filt = _full_filter(merchant_key)

    if interval == "day":
        group_expr = "CAST(created_at AS DATE)"
    elif interval == "month":
        group_expr = "strftime(CAST(created_at AS TIMESTAMP), '%Y-%m')"
    elif interval == "year":
        group_expr = "strftime(CAST(created_at AS TIMESTAMP), '%Y')"
    else:
        raise ValueError(f"Unknown interval: {interval}")

    query = f"""
        SELECT
            {group_expr} AS time_period,
            COUNT(*) AS attempts,
            ROUND(AVG(adjusted_fee), 2) AS avg_adjusted_fee,
            COALESCE(SUM(adjusted_fee), 0) AS total_adjusted_fee,
            ROUND(COALESCE(SUM(adjusted_fee), 0) * 100.0 / NULLIF(SUM(amount), 0), 4) AS fee_share_of_amount_pct
        FROM zp_data
        {filt}
        GROUP BY {group_expr}
        ORDER BY time_period
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    trend = [dict(zip(cols, row)) for row in rows]
    for t in trend:
        t["time_period"] = str(t["time_period"])

    filters: dict[str, Any] = {}
    if merchant_key:
        filters["merchant_key"] = merchant_key

    return {
        "label_en": ADJUSTED_FEE_LABEL_EN,
        "label_fa": ADJUSTED_FEE_LABEL_FA,
        "interval": interval,
        "trend": trend,
        "traceability": {
            "metric_id": "adjusted_fee_trend",
            "definition": ADJUSTED_FEE_LABEL_EN + " trend over " + interval + ".",
            "formula": f"GROUP BY {group_expr} → AVG(adjusted_fee), SUM(adjusted_fee), fee_share = SUM(adjusted_fee)/SUM(amount)*100",
            "source_columns": ["created_at", "adjusted_fee", "amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": ADJUSTED_FEE_LIMITATION,
        },
    }


def get_adjusted_fee_by_merchant(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return adjusted-fee indicator by merchant (Stage 3)."""
    db = get_db()
    dates = _date_filter(start_date, end_date)

    query = f"""
        SELECT
            merchant_key,
            COUNT(*) AS row_count,
            COALESCE(SUM(adjusted_fee), 0) AS total_adjusted_fee,
            ROUND(AVG(adjusted_fee), 2) AS avg_adjusted_fee,
            COALESCE(SUM(amount), 0) AS total_amount,
            ROUND(COALESCE(SUM(adjusted_fee), 0) * 100.0 / NULLIF(SUM(amount), 0), 4) AS fee_share_of_amount_pct
        FROM zp_data
        WHERE {dates}
        GROUP BY merchant_key
        ORDER BY total_adjusted_fee DESC
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    by_merchant = [dict(zip(cols, row)) for row in rows]

    filters: dict[str, Any] = {}
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "label_en": ADJUSTED_FEE_LABEL_EN,
        "label_fa": ADJUSTED_FEE_LABEL_FA,
        "by_merchant": by_merchant,
        "traceability": {
            "metric_id": "adjusted_fee_by_merchant",
            "definition": ADJUSTED_FEE_LABEL_EN + " aggregated per merchant.",
            "formula": "GROUP BY merchant_key → SUM(adjusted_fee), AVG(adjusted_fee), fee_share = SUM(adjusted_fee)/SUM(amount)*100",
            "source_columns": ["merchant_key", "adjusted_fee", "amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": ADJUSTED_FEE_LIMITATION,
        },
    }


def get_adjusted_fee_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> dict[str, Any]:
    """Return adjusted-fee indicator by category (Stage 3)."""
    db = get_db()
    dates = _date_filter(start_date, end_date)

    query = f"""
        SELECT
            category_title,
            COUNT(*) AS row_count,
            COALESCE(SUM(adjusted_fee), 0) AS total_adjusted_fee,
            ROUND(AVG(adjusted_fee), 2) AS avg_adjusted_fee,
            COALESCE(SUM(amount), 0) AS total_amount,
            ROUND(COALESCE(SUM(adjusted_fee), 0) * 100.0 / NULLIF(SUM(amount), 0), 4) AS fee_share_of_amount_pct
        FROM zp_data
        WHERE {dates}
        GROUP BY category_title
        ORDER BY total_adjusted_fee DESC
    """
    result = db.sql(query)
    cols = [d[0] for d in result.description]
    rows = result.fetchall()
    by_category = [dict(zip(cols, row)) for row in rows]

    filters: dict[str, Any] = {}
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date

    return {
        "label_en": ADJUSTED_FEE_LABEL_EN,
        "label_fa": ADJUSTED_FEE_LABEL_FA,
        "by_category": by_category,
        "traceability": {
            "metric_id": "adjusted_fee_by_category",
            "definition": ADJUSTED_FEE_LABEL_EN + " aggregated per category.",
            "formula": "GROUP BY category_title → SUM(adjusted_fee), AVG(adjusted_fee), fee_share = SUM(adjusted_fee)/SUM(amount)*100",
            "source_columns": ["category_title", "adjusted_fee", "amount"],
            "counting_unit": "row",
            "filters": filters,
            "limitations": ADJUSTED_FEE_LIMITATION,
        },
    }
