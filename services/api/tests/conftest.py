"""Test configuration for ZarrinPal Analytics API tests."""
import sys
from pathlib import Path

# Add the app directory to Python path for test imports
api_dir = Path(__file__).parent.parent
app_dir = api_dir / "app"
sys.path.insert(0, str(app_dir))
db_dir = api_dir / "app" / "db"
sys.path.insert(0, str(db_dir))
