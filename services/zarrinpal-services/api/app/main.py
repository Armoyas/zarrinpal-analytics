"""
ZarrinPal Analytics Dashboard - Backend API
FastAPI application for merchant analytics
"""
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import health, merchants, analytics
from database import engine, Base
import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZarrinPal Analytics API",
    description="API for ZarrinPal merchant analytics dashboard",
    version="1.0.0",
    contact={
        "name": "ZarrinPal Analytics Team",
        "url": "https://github.com/Armoyas/zarrinpal-analytics",
    },
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(merchants.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global error handler for logging and debugging."""
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )