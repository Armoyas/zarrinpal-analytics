"""
ZarrinPal CSV ingestion service.

Loads the ~480MB transaction dataset (payment-attempt level) into DuckDB
with bounded memory usage and explicit null handling.

Dataset notes (per challenge):
- Each row is a *payment attempt* (try_seq), NOT a unique session.
  Session-level columns (amount, merchant, category...) repeat across attempts.
- `adjusted_fee` is a scaled fee (constant coefficient applied to all rows) —
  it is NOT the real fee. Only *relative* comparisons are valid.
- Amounts are in Iranian Rials.
- Nullable columns: switch_response_code, psp_code, issuer_bank_code,
  payer_card_key, init_time_ms, verify_time_ms, try_created_at, verified_at, settled_at.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator

import duckdb
import pandas as pd

# Optimized dtypes to reduce memory footprint on a 480MB CSV.
# Nullable integer columns use Int64 to preserve missing values.
DTYPES: dict[str, str] = {
    "session_key": "string",
    "try_seq": "Int64",
    "terminal_key": "string",
    "merchant_key": "string",
    "category_id": "Int64",
    "category_title": "string",
    "amount": "Int64",
    "adjusted_fee": "Int64",
    "session_status": "string",
    "try_status": "string",
    "switch_response_code": "string",
    "psp_code": "string",
    "issuer_bank_code": "string",
    "payer_card_key": "string",
    "verify_type": "string",
    "init_time_ms": "Int64",
    "verify_time_ms": "Int64",
    "created_at": "string",
    "try_created_at": "string",
    "verified_at": "string",
    "settled_at": "string",
    "expire_in": "string",
}

# Datetime columns parsed during ingestion (format YYYY-MM-DD HH:MM:SS).
DATETIME_COLS = ["created_at", "try_created_at", "verified_at", "settled_at", "expire_in"]

# Columns that legitimately contain nulls depending on payment lifecycle stage.
NULLABLE_COLS = [
    "switch_response_code",
    "psp_code",
    "issuer_bank_code",
    "payer_card_key",
    "init_time_ms",
    "verify_time_ms",
    "try_created_at",
    "verified_at",
    "settled_at",
]

CHUNK_SIZE = 10_000


def read_csv_chunks(csv_path: str | Path) -> Iterator[pd.DataFrame]:
    """Yield the CSV in fixed-size chunks, coercing dtypes and parsing datetimes."""
    for chunk in pd.read_csv(
        csv_path,
        dtype=DTYPES,
        parse_dates=DATETIME_COLS,
        chunksize=CHUNK_SIZE,
        low_memory=False,
    ):
        yield chunk


def report_data_quality(con: duckdb.DuckDBPyConnection, table: str = "transactions") -> dict:
    """Return per-column null counts + row total. Used for the traceability UI."""
    nulls = {}
    for col in NULLABLE_COLS:
        cnt = con.execute(
            f'SELECT COUNT(*) - COUNT("{col}") AS nulls FROM {table}'
        ).fetchone()[0]
        nulls[col] = int(cnt)
    total = con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    return {"total_rows": int(total), "null_counts": nulls}


def ingest_to_duckdb(
    csv_path: str | Path,
    db_path: str | Path = "zarrinpal.duckdb",
    table: str = "transactions",
) -> tuple[duckdb.DuckDBPyConnection, dict]:
    """
    Ingest the CSV into a DuckDB table (append per chunk).

    Returns the open connection and a data-quality report.
    """
    con = duckdb.connect(str(db_path))
    first = True
    for chunk in read_csv_chunks(csv_path):
        if first:
            con.register("df_chunk", chunk)
            con.execute(f"CREATE TABLE {table} AS SELECT * FROM df_chunk")
            con.unregister("df_chunk")
            first = False
        else:
            con.register("df_chunk", chunk)
            con.execute(f"INSERT INTO {table} SELECT * FROM df_chunk")
            con.unregister("df_chunk")

    quality = report_data_quality(con, table)
    return con, quality


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ingest ZarrinPal CSV into DuckDB")
    parser.add_argument("--csv", required=True, help="path to the dataset CSV")
    parser.add_argument("--db", default="zarrinpal.duckdb", help="output DuckDB file")
    args = parser.parse_args()

    con, quality = ingest_to_duckdb(args.csv, args.db)
    print(f"Ingested {quality['total_rows']:,} rows into {args.db}")
    print("Null counts by column:")
    for col, cnt in quality["null_counts"].items():
        print(f"  {col}: {cnt:,}")
    con.close()
