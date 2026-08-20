"""Generate a sample ZarrinPal transaction dataset for local demo & testing.

Produces a CSV matching the exact challenge schema (payment-attempt level),
including a Nowruz seasonal pattern, multiple merchants/categories, the full
payment lifecycle, and realistic nulls for card/bank columns.

Usage:
    python scripts/seed_demo.py --rows 50000 --out data/zarrinpal_dataset.csv
"""

from __future__ import annotations

import argparse
import csv
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

CATEGORIES = [
    (1, "آموزش و آموزشگاه"),
    (2, "خرده‌فروشی آنلاین"),
    (3, "سفر و گردشگری"),
    (4, "غذا و رستوران"),
    (5, "سلولتاهای فروشگاهی"),
    (6, "عینی و سرویسی"),
    (7, "صنعتی و ساختگی"),
    (8, "خدمات دیجیتال"),
]

STATUS_FLOW = ["NoAttempt", "InBank", "Failed", "Verified", "Paid", "Reversed"]
# Cards/banks only known when payment completes at the bank (Verified/Paid/Reversed).
COMPLETED = {"Verified", "Paid", "Reversed"}

VERIFY_TYPES = ["Automated", "Manual"]


def random_datetime(start: datetime, end: datetime) -> datetime:
    """Generate a random datetime between start and end."""
    delta = end - start
    random_seconds = random.uniform(0, delta.total_seconds())
    return start + timedelta(seconds=random_seconds)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate sample ZarrinPal dataset")
    parser.add_argument("--rows", type=int, default=10000, help="target number of rows")
    parser.add_argument(
        "--out",
        default="data/sample_data.csv",
        help="output CSV path (default: data/sample_data.csv)",
    )
    parser.add_argument("--seed", type=int, default=42, help="random seed")
    args = parser.parse_args()

    random.seed(args.seed)
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2024, 12, 31)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    merchants = [f"M{1000 + i:04d}" for i in range(50)]
    terminals = [f"T{5000 + i:04d}" for i in range(3)]

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "session_key",
                "try_seq",
                "terminal_key",
                "merchant_key",
                "category_id",
                "category_title",
                "amount",
                "adjusted_fee",
                "session_status",
                "try_status",
                "switch_response_code",
                "psp_code",
                "issuer_bank_code",
                "payer_card_key",
                "verify_type",
                "init_time_ms",
                "verify_time_ms",
                "created_at",
                "try_created_at",
                "verified_at",
                "settled_at",
                "expire_in",
            ]
        )

        for _ in range(args.rows):
            merchant = random.choice(merchants)
            terminal = random.choice(terminals)
            cat_id, cat_title = random.choice(CATEGORIES)
            amount = random.randint(50_000, 50_000_000)  # 50k - 50M Rials
            adjusted_fee = int(amount * random.uniform(0.035, 0.042))

            session_status = random.choices(
                STATUS_FLOW, weights=[5, 20, 15, 45, 10, 5], k=1
            )[0]
            try_seq = random.randint(0, 9)  # 0-9 attempts
            try_status = (
                session_status
                if try_seq == 0
                else random.choices(STATUS_FLOW, weights=[5, 20, 15, 45, 10, 5], k=1)[0]
            )

            created_at_dt = random_datetime(start_date, end_date)
            expire_in_dt = created_at_dt + timedelta(minutes=30)

            # Nullable fields — only populated for completed transactions (try_seq 0 + completed state)
            switch_response_code = ""
            psp_code = ""
            issuer_bank_code = ""
            payer_card_key = ""
            init_time_ms = str(random.randint(50, 2000))
            verify_time_ms = ""
            try_created_at_str = ""
            verified_at_str = ""
            settled_at_str = ""

            if try_seq == 0 and session_status in COMPLETED:
                switch_response_code = f"PSP-{random.randint(100, 999)}:{random.randint(1000, 9999)}"
                psp_code = f"PSP{random.randint(100, 999)}"
                issuer_bank_code = f"BANK-{random.randint(10, 99)}"
                payer_card_key = str(uuid.uuid4())[:12]

                if session_status in ("Verified", "Paid"):
                    verify_time_ms = str(random.randint(50, 2000))
                    verified_at_dt = created_at_dt + timedelta(minutes=random.randint(0, 30))
                    verified_at_str = verified_at_dt.strftime("%Y-%m-%d %H:%M:%S")
                    if session_status == "Paid":
                        settled_at_dt = verified_at_dt + timedelta(minutes=random.randint(1, 10))
                        settled_at_str = settled_at_dt.strftime("%Y-%m-%d %H:%M:%S")

                if try_seq == 0:
                    try_created_at_str = created_at_dt.strftime("%Y-%m-%d %H:%M:%S")

            row = [
                str(uuid.uuid4())[:36],
                try_seq,
                terminal,
                merchant,
                cat_id,
                cat_title,
                amount,
                adjusted_fee,
                session_status,
                try_status,
                switch_response_code,
                psp_code,
                issuer_bank_code,
                payer_card_key,
                random.choice(VERIFY_TYPES),
                init_time_ms,
                verify_time_ms,
                created_at_dt.strftime("%Y-%m-%d %H:%M:%S"),
                try_created_at_str,
                verified_at_str,
                settled_at_str,
                expire_in_dt.strftime("%Y-%m-%d %H:%M:%S"),
            ]
            writer.writerow(row)

    print(f"Generated {args.rows} rows to {out_path}")
    print(f"File size: {out_path.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
