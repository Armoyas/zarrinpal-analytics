"""Main FastAPI application for ZarrinPal Analytics API.

Uses DuckDB for data access - no PostgreSQL or ORM required.
All queries use the REAL CSV schema confirmed by schema inspection.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.v1.endpoints import router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Analytics API for ZarrinPal merchants",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_prefix)
