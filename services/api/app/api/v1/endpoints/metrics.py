"""API route for metric definitions and traceability.

Exposes the "How calculated?" metadata for every metric, so the frontend
can display tooltips and provenance information.
"""

from fastapi import APIRouter
from typing import Any

router = APIRouter()

METRIC_DEFINITIONS: dict[str, Any] = {
    "total_attempts": {
        "name": "Total Payment Attempts",
        "business_meaning": "Number of payment attempt rows in the dataset",
        "formula": "COUNT(*) FROM payments",
        "required_columns": [],
        "edge_cases": "Empty dataset → 0",
        "limitations": "Rows are attempts, not unique sessions",
    },
    "success_rate": {
        "name": "Success Rate",
        "business_meaning": "Percentage of payment attempts that were successful",
        "formula": "((paid_attempts + verified_attempts) / total_attempts) * 100",
        "required_columns": ["session_status", "amount"],
        "edge_cases": "total_attempts = 0 → null",
        "limitations": "Includes Paid which is not yet merchant-verified",
    },
    "failure_rate": {
        "name": "Failure Rate",
        "business_meaning": "Percentage of payment attempts that failed",
        "formula": "(failed_attempts / total_attempts) * 100",
        "required_columns": ["session_status"],
        "edge_cases": "total_attempts = 0 → null",
        "limitations": "NoAttempt means the session never reached the bank stage",
    },
    "total_amount": {
        "name": "Total Payment Amount",
        "business_meaning": "Sum of all payment attempt amounts",
        "formula": "SUM(amount) FROM payments",
        "required_columns": ["amount"],
        "edge_cases": "Empty dataset → 0",
        "limitations": "Includes amounts from failed attempts",
    },
    "adjusted_fee_total": {
        "name": "Adjusted Fee Total",
        "business_meaning": "Sum of adjusted_fee across all attempts",
        "formula": "SUM(adjusted_fee) FROM payments",
        "required_columns": ["adjusted_fee"],
        "edge_cases": "Empty dataset → 0",
        "limitations": "adjusted_fee is NOT the real ZarinPal fee - it is confidentiality-scaled by a constant factor. Only relative comparisons are valid.",
    },
}


@router.get("/metrics/definitions")
async def metrics_definitions():
    """Return metric definitions with formulas and traceability info."""
    return METRIC_DEFINITIONS
