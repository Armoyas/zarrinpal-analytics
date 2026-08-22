"""
Minimal FastAPI backend for ZarinPal Analytical Dashboard.
Stage 0: Only health endpoint and DuckDB connection management.
"""

import os
from contextlib import asynccontextmanager

import duckdb
from fastapi import FastAPI
from fastapi.responses import JSONResponse


# --- Environment ---
DATA_FILE = os.environ.get("DATA_FILE", "data/sample_data.csv")
DUCKDB_PATH = os.environ.get("DUCKDB_PATH", "/app/data/analytics.duckdb")


# --- State ---
_db: duckdb.DuckDBPyConnection | None = None


def get_db():
    """Return the DuckDB connection, initializing if needed."""
    global _db
    if _db is None:
        _db = duckdb.connect(DUCKDB_PATH)
        # Ensure data table exists
        _ensure_table()
    return _db


def _ensure_table():
    """Load CSV data into DuckDB if table not already loaded."""
    db = _db
    try:
        result = db.sql("SELECT COUNT(*) as cnt FROM zp_data").fetchone()
        if result is not None and result[0] > 0:
            return  # Already loaded
    except duckdb.ConversionException:
        pass

    csv_path = os.environ.get("CSV_PATH", DATA_FILE)
    db.sql(f"""
        CREATE TABLE IF NOT EXISTS zp_data AS
        SELECT * FROM read_csv('{csv_path}', header=true, sep=',')
    """)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Initialize DB on startup
    get_db()
    yield
    # Cleanup on shutdown
    global _db
    if _db is not None:
        _db.close()
        _db = None


app = FastAPI(
    title="ZarinPal Analytical Dashboard API",
    description="Backend API for ZarinPal merchant analytics dashboard. Stage 0: foundation endpoint only.",
    version="0.0.1",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "stage": "0-foundation"}


@app.get("/api/v1/info")
async def info():
    """Return basic project info and data availability."""
    try:
        db = get_db()
        row_count = db.sql("SELECT COUNT(*) as cnt FROM zp_data").fetchone()[0]
        col_count = len(db.sql("PRAGMA table_info(zp_data)").fetchall())
        return {
            "project": "zarinpal-analytical-dashboard",
            "stage": "0-foundation",
            "data_rows": row_count,
            "data_columns": col_count,
            "currency": "IRR",
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Database not initialized", "detail": str(e)},
        )
