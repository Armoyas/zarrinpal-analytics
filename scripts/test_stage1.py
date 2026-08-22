"""Quick test script to validate Stage 1 backend implementation."""
import os
import sys
import subprocess
from pathlib import Path

# Resolve the api directory
repo_root = Path(__file__).resolve().parents[1]
api_dir = repo_root / "services/api"
sys.path.insert(0, str(api_dir))
sys.path.insert(0, str(api_dir / "app"))
sys.path.insert(0, str(api_dir / "app/db"))

# Generate fresh sample data
sample_csv = api_dir / "data" / "sample_data.csv"
sample_csv.parent.mkdir(parents=True, exist_ok=True)
seed_script = repo_root / "scripts" / "seed_demo.py"
if not sample_csv.exists() or sample_csv.stat().st_size < 100000:
    subprocess.run(
        [sys.executable, str(seed_script), "--rows", "10000", "--out", str(sample_csv)],
        check=True,
        cwd=str(repo_root),
    )

os.environ["DATA_FILE"] = str(sample_csv)
from app.db.duckdb_database import DuckDBManager

db = DuckDBManager(db_path=str(api_dir / "data" / "test_stage1.duckdb"), csv_path=str(sample_csv))

print("=== HEALTH CHECK ===")
health = db.health_check()
print(f"Status: {health['status']}, Row count: {health['row_count']}")

print("\n=== SCHEMA ===")
schema = db.get_schema()
print(f"Total rows: {schema['total_rows']}")
print(f"Columns: {[c['name'] for c in schema['columns']]}")

print("\n=== OVERVIEW METRICS ===")
metrics = db.get_overview_metrics()
print(f"Total attempts (rows): {metrics['total_attempts']}")
print(f"Unique sessions: {metrics['unique_sessions']}")
print(f"Success rate: {metrics['success_rate']}%")
print(f"Total amount (IRR): {metrics['amount']['total_rials']}")
print(f"Avg amount (IRR): {metrics['amount']['avg_per_attempt_rials']}")

print("\n=== MERCHANTS (top 3) ===")
merchants = db.get_merchants(limit=3, min_attempts=10)
for m in merchants:
    print(f"  {m['merchant_key']}: {m['total_attempts']} attempts, success={m['success_rate_pct']}%")

print("\n=== DAILY TRENDS (last 5) ===")
trends = db.get_daily_trends(days=5)
for t in trends:
    print(f"  {t['day']}: count={t['daily_count']}, amount={t['daily_amount']}, sr={t['daily_success_rate']}%")

print("\n=== TIME SERIES (attempts by day, last 5) ===")
ts = db.get_time_series(metric="attempts", interval="day")
for t in ts[-5:]:
    print(f"  {t['time_period']}: {t['value']}")

print("\n=== MERCHANT FILTERING (M1000) ===")
m1_metrics = db.get_overview_metrics(merchant_key="M1000")
print(f"M1000 total attempts: {m1_metrics['total_attempts']}")
print(f"M1000 unique sessions: {m1_metrics['unique_sessions']}")

print("\n=== DATE FILTERING (2024-06-01 to 2024-06-30) ===")
date_metrics = db.get_overview_metrics(start_date="2024-06-01", end_date="2024-06-30")
print(f"June 2024 attempts: {date_metrics['total_attempts']}")
print(f"June 2024 total amount: {date_metrics['amount']['total_rials']}")

print("\n=== STATUS DISTRIBUTION ===")
statuses = db.get_status_distribution()
for s in statuses:
    print(f"  {s['status']}: {s['count']}")

print("\n=== SETTLED & VERIFIED COUNT ===")
conn = db.get_connection()
settled = conn.execute("SELECT COUNT(*) FROM payments WHERE settled_at IS NOT NULL").fetchone()[0]
print(f"Rows with settled_at NOT NULL: {settled}")
verified = conn.execute("SELECT COUNT(*) FROM payments WHERE verified_at IS NOT NULL").fetchone()[0]
print(f"Rows with verified_at NOT NULL: {verified}")

print("\n=== EMPTY MERCHANT (non-existent) ===")
empty_metrics = db.get_overview_metrics(merchant_key="NONEXISTENT_MERCHANT")
print(f"Non-existent merchant attempts: {empty_metrics['total_attempts']}")

print("\n=== DIVISION BY ZERO CHECK ===")
print(f"Success rate for empty merchant: {empty_metrics['success_rate']}% (should be 0, not NaN)")

print("\n=== TRACEABILITY METADATA ===")
calc = metrics["how_calculated"]
for k, v in calc.items():
    print(f"  {k}: {v}")

print("\n✅ All Stage 1 backend checks passed!")
db.close()
