#!/bin/bash
# Deployment fix script: rebuild containers with latest code
# Usage: bash scripts/deploy_fix.sh
set -e

echo "=== ZarrinPal Analytics - Rebuild with data loading fix ==="

# 1. Remove stale containers
echo "1. Stopping and removing old containers..."
docker compose down -v 2>/dev/null || docker-compose down -v 2>/dev/null
echo "   Done."

# 2. Remove stale DuckDB files from data volume
echo "2. Removing stale database files..."
rm -f data/analytics.duckdb data/analytics.duckdb.wal data/analytics.duckdb-shm
echo "   Done."

# 3. Verify real data file exists
if [ -f data/sample_data.csv ]; then
    ROWS=$(wc -l < data/sample_data.csv)
    SIZE=$(du -h data/sample_data.csv | cut -f1)
    echo "3. Data file found: $ROWS rows, $SIZE"
else
    echo "   ERROR: data/sample_data.csv not found!"
    echo "   Copy your real data: cp /path/to/real_data.csv data/sample_data.csv"
    exit 1
fi

# 4. Rebuild with --no-cache
echo "4. Rebuilding containers (no cache)..."
docker compose build --no-cache
echo "   Done."

# 5. Start containers
echo "5. Starting containers..."
docker compose up -d
echo "   Done."

# 6. Wait for startup
echo "6. Waiting for services to start..."
sleep 5

# 7. Check health
echo "7. Checking API health..."
for i in $(seq 1 12); do
    if curl -s http://localhost:8000/api/v1/health | grep -qi "ok\|status"; then
        echo "   API is healthy!"
        curl -s http://localhost:8000/api/v1/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/api/v1/health
        echo ""
        echo "=== SUCCESS: Data should now be loaded! ==="
        exit 0
    fi
    echo "   Waiting... ($i)"
    sleep 5
done

echo "   ERROR: API did not become healthy. Check logs:"
echo "   docker compose logs api"
exit 1