"""Application configuration for ZarrinPal Analytics API.

Uses environment variables with sensible defaults for local development.
"""

from pydantic_settings import BaseSettings, ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    # App
    app_name: str = "ZarrinPal Analytics API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Data
    data_file: str = "data/sample_data.csv"
    duckdb_path: str = "data/analytics.duckdb"

    # API
    api_prefix: str = "/api/v1"
    api_port: int = 8000


@lru_cache()
def get_settings() -> Settings:
    return Settings()
