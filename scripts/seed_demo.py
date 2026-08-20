"""
Generate a sample ZarrinPal transaction dataset for local demo & testing.

Produces a CSV matching the exact challenge schema (payment-attempt level),
including a Nowruz seasonal pattern, multiple merchants/categories, the full
payment lifecycle, and realistic nulls for card/bank columns.

Usage:
    python scripts/seed_demo.py --rows 50000 --out data/zarrinpal_dataset.csv
"""

from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

CATEGORIES = [
    (1, "فروشگاه اینترنتی"),
    (2, "رستوران و کافه"),
    (3, "پوشاک"),
    (4, "لوازم الکترونیکی"),
    (5, "سوپرمارکت"),
]

STATUSES = ["Verified", "Paid", "InBank", "Failed", "Reversed"]
# Cards/banks only known when payment completes at the bank (Verified/Paid/Reversed).
COMPLETED = {"Verified", "Paid", "Reversed"}

BANKS = ["BANK-001", "BANK-002", "BANK-003", "BANK-004"]
PSPS = ["PSP-01", "PSP-02", "PSP-03"]


def nowruz_weight(day: datetime) -> float:
    """Seasonal multiplier: bump around Iranian New Year (late March), dip in summer."""
    m = day.month
    if m == 3:
        return 1.6  # Nowruz spike
    if m == 4:
        return 1.2
    if m in (7, 8):
        return 0.7  # summer lull
    return 1.0


def gen_rows(n: int, start: datetime, end: datetime) -> list[dict]:
    rows: list[dict] = []
    total_days = (end - start).days
    for _ in range(n):
        merchant_key = f"M{random.randint(1, 20):03d}"
        cat_id, cat_title = random.choice(CATEGORIES)

        created = start + timedelta(
            days=random.randint(0, total_days),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59),
        )
        # nowruz weighting: skip rows probabilistically to create seasonality
        if random.random() > nowruz_weight(created):
            continue

        session_key = f"S{random.randint(10_000_000, 99_999_999)}"
        session_status = random.choices(
            STATUSES, weights=[70, 8, 6, 12, 4], k=1
        )[0]
        n_attempts = random.randint(1, 3)
        try_statuses = [session_status] if session_status != "Verified" else ["Verified"] * n_attempts

        for i in range(1, n_attempts + 1):
            completed = session_status in COMPLETED
            amount = random.randint(10_000, 500_000_000)  # Rial
            adjusted_fee = int(amount * random.uniform(0.001, 0.03))
            row = {
                "session_key": session_key,
                "try_seq": i,
                "terminal_key": f"T{random.randint(1, 50):03d}",
                "merchant_key": merchant_key,
                "category_id": cat_id,
                "category_title": cat_title,
                "amount": amount,
                "adjusted_fee": adjusted_fee,
                "session_status": session_status,
                "try_status": try_statuses[i - 1] if i <= len(try_statuses) else "NoAttempt",
                "switch_response_code": f"{random.choice(PSPS)}:{random.randint(0, 99)}" if completed else None,
                "psp_code": random.choice(PSPS) if i > 0 else None,
                "issuer_bank_code": random.choice(BANKS) if completed else None,
                "payer_card_key": f"C{random.randint(100_000, 999_999)}" if completed else None,
                "verify_type": random.choice(["Automated", "Manual"]),
                "init_time_ms": random.randint(50, 2000),
                "verify_time_ms": random.randint(50, 2000) if session_status == "Verified" else None,
                "created_at": created.strftime("%Y-%m-%d %H:%M:%S"),
                "try_created_at": (created + timedelta(seconds=random.randint(1, 30))).strftime("%Y-%m-%d %H:%M:%S"),
                "verified_at": (created + timedelta(minutes=random.randint(1, 30))).strftime("%Y-%m-%d %H:%M:%S") if session_status == "Verified" else None,
                "settled_at": (created + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S") if session_status in ("Verified", "Paid") else None,
                "expire_in": (created + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
            }
            rows.append(row)
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate sample ZarrinPal dataset")
    parser.add_argument("--rows", type=int, default=50_000, help="target number of rows")
    parser.add_argument("--out", default="data/zarrinpal_dataset.csv", help="output CSV path")
    parser.add_argument("--seed", type=int, default=42, help="random seed")
    args = parser.parse_args()

    random.seed(args.seed)
    start = datetime(2025, 10, 1)
    end = datetime(2026, 8, 1)
    rows = gen_rows(args.rows, start, end)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(rows)
    df.to_csv(out, index=False, encoding="utf-8")
    print(f"Wrote {len(df):,} rows to {out}")
    print(f"Merchants: {df['merchant_key'].nunique()}, categories: {df['category_title'].nunique()}")
    print(f"Status distribution:\n{df['session_status'].value_counts().to_string()}")


if __name__ == "__main__":
    main()
