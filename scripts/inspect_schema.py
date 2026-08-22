#!/usr/bin/env python3
"""
inspect_schema.py — Reproducible schema inspection for ZarrinPal analytical dashboard.

Scans a CSV file and produces a schema summary (JSON) and a data dictionary (Markdown).
This script is the single source of truth for dataset schema documentation.

Usage:
    python scripts/inspect_schema.py --csv data/sample_data.csv --output docs/data-dictionary.md
    python scripts/inspect_schema.py --csv data/sample_data.csv --json docs/schema-summary.json
"""

import argparse
import json
import os
import sys
from datetime import datetime
from typing import Any

import pandas as pd


def infer_column_role(col_name: str) -> str:
    """Infer a semantic role for each column based on its name."""
    roles = {
        "session_key": "Session identifier",
        "try_seq": "Attempt identifier",
        "terminal_key": "Payment terminal",
        "merchant_key": "Merchant identifier",
        "category_id": "Merchant category code",
        "category_title": "Human-readable category",
        "amount": "Payment amount",
        "adjusted_fee": "Fee proxy (confidentiality-scaled)",
        "session_status": "Session outcome",
        "try_status": "Attempt outcome",
        "switch_response_code": "Diagnostic field",
        "psp_code": "Diagnostic field",
        "issuer_bank_code": "Diagnostic field",
        "payer_card_key": "Payer identifier (sparse)",
        "verify_type": "Verification type",
        "init_time_ms": "Performance metric",
        "verify_time_ms": "Performance metric",
        "created_at": "Primary timestamp",
        "try_created_at": "Attempt timestamp",
        "verified_at": "Verification timestamp",
        "settled_at": "Settlement timestamp",
        "expire_in": "Session expiry",
    }
    return roles.get(col_name, "Uncategorized")


def inspect_csv(csv_path: str) -> dict[str, Any]:
    """Inspect a CSV file and return schema summary."""
    df = pd.read_csv(csv_path, dtype=str, low_memory=False)

    columns = []
    for col in df.columns:
        null_count = int(df[col].isna().sum())
        unique_count = int(df[col].nunique(dropna=True))
        null_pct = round((null_count / len(df)) * 100, 4)

        # Determine inferred dtype
        sample_vals = df[col].dropna().head(5).tolist()

        # Try numeric inference
        dtype = "string"
        if sample_vals:
            try:
                pd.to_numeric(df[col].dropna().head(100))
                dtype = "integer" if pd.to_numeric(df[col].dropna().head(100)).apply(lambda x: x == int(x)).all() else "float"
            except (ValueError, TypeError):
                dtype = "string"

        col_info = {
            "name": col,
            "dtype": dtype,
            "null_count": null_count,
            "null_percentage": null_pct,
            "unique_count": unique_count,
            "sample_values": sample_vals[:5],
            "role": infer_column_role(col),
        }
        columns.append(col_info)

    summary = {
        "file": os.path.basename(csv_path),
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": columns,
        "inspected_at": datetime.now().isoformat(),
    }
    return summary


def generate_markdown(summary: dict[str, Any]) -> str:
    """Generate Markdown data dictionary from schema summary."""
    lines = []
    lines.append("# Data Dictionary")
    lines.append("")
    lines.append(f"**Source file:** `{summary['file']}`")
    lines.append(f"**Rows:** {summary['row_count']}")
    lines.append(f"**Columns:** {summary['column_count']}")
    lines.append(f"**Currency:** Iranian rial (IRR)")
    lines.append("")
    lines.append("**Adjusted-fee note:** The `adjusted_fee` column is confidentiality-adjusted and must NOT be presented as the real ZarinPal fee.")
    lines.append("")
    lines.append("---")
    lines.append("")

    for col in summary["columns"]:
        lines.append(f"### `{col['name']}`")
        lines.append(f"- **Type:** {col['dtype']}")
        lines.append(f"- **Nulls:** {col['null_count']} ({col['null_percentage']}%)")
        lines.append(f"- **Unique values:** {col['unique_count']}")
        lines.append(f"- **Role:** {col['role']}")
        lines.append(f"- **Sample values:** {col['sample_values']}")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Inspect CSV schema for ZarinPal dashboard")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--output", help="Output Markdown file path")
    parser.add_argument("--json", help="Output JSON summary file path")
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"Error: CSV file not found: {args.csv}", file=sys.stderr)
        sys.exit(1)

    summary = inspect_csv(args.csv)

    if args.json:
        with open(args.json, "w") as f:
            json.dump(summary, f, indent=2)
        print(f"JSON summary written to {args.json}")

    if args.output:
        md = generate_markdown(summary)
        with open(args.output, "w") as f:
            f.write(md)
        print(f"Markdown data dictionary written to {args.output}")

    # Always print to stdout
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()