"""Test configuration for ZarrinPal Analytics API tests.

Generates fresh sample data for each test session using seed_demo.py,
matching the CI workflow. This ensures tests are self-contained and
don't depend on pre-existing CSV files.
"""
import subprocess
import sys
from pathlib import Path

# Add the app directory to Python path for test imports
api_dir = Path(__file__).parent.parent
app_dir = api_dir / "app"
sys.path.insert(0, str(app_dir))
db_dir = api_dir / "app" / "db"
sys.path.insert(0, str(db_dir))

# Generate fresh test data (same as CI workflow does)
sample_csv = api_dir / "data" / "sample_data.csv"
sample_csv.parent.mkdir(parents=True, exist_ok=True)
seed_script = Path(__file__).resolve().parents[3] / "scripts" / "seed_demo.py"
if not sample_csv.exists() or sample_csv.stat().st_size < 100000:
    subprocess.run(
        [sys.executable, str(seed_script), "--rows", "10000", "--out", str(sample_csv)],
        check=True,
        cwd=str(Path(__file__).resolve().parents[4]),
    )
