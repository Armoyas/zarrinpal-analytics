"""
API route handlers for health checks.
"""
from datetime import datetime
from fastapi import APIRouter
from schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """API health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow(),
    )


@router.get("/health/detailed")
async def detailed_health():
    """Detailed health check with component status."""
    from database import engine
    from sqlalchemy import text
    
    db_healthy = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "version": "1.0.0",
        "timestamp": datetime.utcnow(),
        "components": {
            "database": "ok" if db_healthy else "error",
            "api": "ok",
        },
    }
