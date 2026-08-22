#!/usr/bin/env python3
"""
validate_dataset.py — Data validation for ZarinPal analytical dashboard.

Checks the dataset against data quality rules and prints a validation report.

Usage:
    python scripts/validate_dataset.py --csv data/sample_data.csv
"""

import argparse
import sys

import pandas as pd


REQUIRED_COLUMNS = [
    "session_key", "try_seq", "terminal_key", "merchant_key",
    "category_id", "category_title", "amount", "adjusted_fee",
    "session_status", "try_status", "switch_response_code",
    "psp_code", "issuer_bank_code", "payer_card_key",
    "verify_type", "init_time_ms", "verify_time_ms",
    "created_at", "try_created_at", "verified_at", "settled_at", "expire_in",
]

EXPECTED_STATUSES = {"Verified", "InBank", "Failed", "Paid", "NoAttempt", "Reversed"}


def validate(csv_path: str) -> bool:
    """Validate the dataset. Returns True if all checks pass."""
    errors = []
    warnings = []
    info = []

    try:
        df = pd.read_csv(csv_path, dtype=str, low_memory=False)
    except FileNotFoundError:
        print(f"ERROR: File not found: {csv_path}", file=sys.stderr)
        return False

    info.append(f"Rows: {len(df)}, Columns: {len(df.columns)}")

    # Check 1: Required columns
    missing_cols = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
    else:
        info.append("All 22 required columns present.")

    # Check 2: Null amounts
    if "amount" in df.columns:
        null_amounts = df["amount"].isna().sum()
        zero_amounts = (pd.to_numeric(df["amount"], errors="coerce") == 0).sum()
        neg_amounts = (pd.to_numeric(df["amount"], errors="coerce") < 0).sum()
        if null_amounts > 0:
            errors.append(f"Null amounts found: {null_amounts}")
        if zero_amounts > 0:
            errors.append(f"Zero amounts found: {zero_amounts}")
        if neg_amounts > 0:
            errors.append(f"Negative amounts found: {neg_amounts}")
        if null_amounts == 0 and zero_amounts == 0 and neg_amounts == 0:
            info.append("amount: no nulls, zeros, or negatives — VALID")

    # Check 3: Null adjusted_fee
    if "adjusted_fee" in df.columns:
        null_fees = df["adjusted_fee"].isna().sum()
        if null_fees > 0:
            warnings.append(f"Null adjusted_fee values: {null_fees}")
        else:
            info.append("adjusted_fee: no nulls — VALID")

    # Check 4: session_status and try_status values
    for status_col in ["session_status", "try_status"]:
        if status_col in df.columns:
            unique_vals = set(df[status_col].dropna().unique())
            unexpected = unique_vals - EXPECTED_STATUSES
            if unexpected:
                warnings.append(f"{status_col} has unexpected values: {unexpected}")
            else:
                info.append(f"{status_col}: all values in expected set {EXPECTED_STATUSES}")

    # Check 5: Duplicate session_keys
    if "session_key" in df.columns:
        dup_count = df["session_key"].duplicated().sum()
        if dup_count > 0:
            info.append(f"Duplicate session_keys found: {dup_count} (may indicate multiple attempts per session)")
        else:
            info.append("No duplicate session_keys in this sample")

    # Check 6: Merchant/terminal relationship
    if "merchant_key" in df.columns and "terminal_key" in df.columns:
        n_merchants = df["merchant_key"].nunique()
        n_terminals = df["terminal_key"].nunique()
        info.append(f"Unique merchants: {n_merchants}, Unique terminals: {n_terminals}")

    # Check 7: payer_card_key sparsity
    if "payer_card_key" in df.columns:
        null_pct = (df["payer_card_key"].isna().sum() / len(df)) * 100
        if null_pct > 50:
            warnings.append(f"payer_card_key is {null_pct:.1f}% null — repeat-behavior analysis NOT reliable")
        else:
            info.append("payer_card_key sparsity below 50% threshold")

    # Check 8: settled_at availability
    if "settled_at" in df.columns:
        null_pct = (df["settled_at"].isna().sum() / len(df)) * 100
        if null_pct > 90:
            warnings.append(f"settled_at is {null_pct:.1f}% null — settlement analysis limited")
        else:
            info.append("settled_at availability acceptable")

    # Print report
    print("=" * 60)
    print("DATASET VALIDATION REPORT")
    print("=" * 60)
    print(f"\nFile: {csv_path}")
    print(f"\n--- Info ---")
    for msg in info:
        print(f"  ✓ {msg}")
    if warnings:
        print(f"\n--- Warnings ---")
        for msg in warnings:
            print(f"  ⚠ {msg}")
    if errors:
        print(f"\n--- Errors ---")
        for msg in errors:
            print(f"  ✗ {msg}")
    print("\n" + "=" * 60)
    print(f"RESULT: {'PASS' if not errors else 'FAIL'}")
    print("=" * 60)
    return len(errors) == 0


def main():
    parser = argparse.ArgumentParser(description="Validate ZarrinPal dataset")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    args = parser.parse_args()

    success = validate(args.csv)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()