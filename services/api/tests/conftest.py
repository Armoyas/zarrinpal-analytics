"""Test configuration and fixtures for Stage 1 tests."""

import os
import sys
from pathlib import Path

# Ensure the api app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "app"))
