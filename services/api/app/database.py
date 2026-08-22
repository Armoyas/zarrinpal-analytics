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
        SELECT * FROM read_csv('{DATA_FILE}', header=true, sep=',')
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
