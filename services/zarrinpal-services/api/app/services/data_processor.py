"""
CSV Ingestion Service - Chunked loading for large datasets
"""
import pandas as pd
import duckdb
import logging
from pathlib import Path
from typing import Iterator, Dict, Any

logger = logging.getLogger(__name__)


def get_csv_schema(filepath: str) -> Dict[str, Any]:
    """Inspect CSV file and return column types."""
    # Read first few rows to infer schema
    df = pd.read_csv(filepath, nrows=1000)
    return {col: str(df[col].dtype) for col in df.columns}


def load_csv_chunked(
    filepath: str,
    chunksize: int = 10000,
    dtype_overrides: Dict[str, Any] = None,
) -> Iterator[pd.DataFrame]:
    """
    Load CSV in chunks for memory efficiency.
    
    Args:
        filepath: Path to CSV file
        chunksize: Number of rows per chunk
        dtype_overrides: Optional dtype specifications for columns
    
    Yields:
        pandas.DataFrame chunks
    """
    chunk_iter = pd.read_csv(
        filepath,
        chunksize=chunksize,
        dtype=dtype_overrides,
        low_memory=False,
    )
    
    for i, chunk in enumerate(chunk_iter):
        logger.info(f"Loaded chunk {i} with {len(chunk)} rows")
        yield chunk


def load_into_duckdb(csv_path: str, duckdb_path: str) -> duckdb.DuckDBPyConnection:
    """
    Load CSV data into DuckDB for efficient querying.
    
    DuckDB can handle large CSV files efficiently and provides
    SQL interface for complex analytics.
    """
    conn = duckdb.connect(duckdb_path)
    
    # Use DuckDB's native CSV reader
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS transactions_raw AS 
        SELECT * FROM read_csv_auto('{csv_path}')
    """)
    
    # Get row count
    row_count = conn.execute("SELECT COUNT(*) FROM transactions_raw").fetchone()[0]
    logger.info(f"Loaded {row_count} rows into DuckDB")
    
    return conn


def clean_transaction_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and normalize transaction data.
    
    Handles:
    - Null values
    - Data type conversions
    - Currency normalization
    - Status standardization
    """
    # Standardize status values
    if 'status' in df.columns:
        df['status'] = df['status'].str.lower().str.strip()
    
    # Fill null amounts with 0
    if 'amount' in df.columns:
        df['amount'] = df['amount'].fillna(0)
    
    # Fill null adjusted_fee with 0
    if 'adjusted_fee' in df.columns:
        df['adjusted_fee'] = df['adjusted_fee'].fillna(0)
    
    # Parse dates if present
    date_cols = [col for col in df.columns if 'date' in col.lower() or 'created' in col.lower()]
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    return df


def estimate_dtypes(csv_path: str, sample_rows: int = 5000) -> Dict[str, Any]:
    """
    Analyze CSV sample to optimize dtypes for memory efficiency.
    """
    df = pd.read_csv(csv_path, nrows=sample_rows)
    
    dtype_map = {}
    for col in df.columns:
        col_data = df[col]
        if col_data.dtype == 'object':
            # Check if it's actually categorical
            unique_ratio = col_data.nunique() / len(col_data)
            if unique_ratio < 0.5:
                dtype_map[col] = 'category'
        elif col_data.dtype in ['int64', 'float64']:
            # Downcast numeric types
            if col_data.min() >= 0:
                if col_data.max() < 255:
                    dtype_map[col] = 'uint8'
                elif col_data.max() < 65535:
                    dtype_map[col] = 'uint16'
                elif col_data.max() < 4294967295:
                    dtype_map[col] = 'uint32'
    
    return dtype_map
