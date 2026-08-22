FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for pandas/duckdb
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ app/

# Create data directory (mounted at runtime)
RUN mkdir -p /app/data

# Remove any stale DuckDB database files (from build time) so data loads from the runtime CSV
RUN rm -f /app/data/analytics.duckdb /app/data/analytics.duckdb.wal

EXPOSE 8000

CMD ["sh", "-c", "rm -f /app/data/analytics.duckdb /app/data/analytics.duckdb.wal && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
