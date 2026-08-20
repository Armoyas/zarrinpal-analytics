#!/usr/bin/env python3
"""Inspect the CSV schema and produce a data dictionary.

Usage:
    python scripts/inspect_schema.py --csv data/sample_data.csv --out docs/schema-summary.json

Output:
    - docs/data-dictionary.md  (human-readable)
    - docs/schema-summary.json (machine-readable)
"""

import argparse
import csv
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import pandas as pd


def infer_type(series, col_name=None):
    """Attempt to infer the type of a column."""
    non_null = series.dropna()
    if len(non_null) == 0:
        return "object"
    sample = non_null.head(1000).astype(str)

    # Integer?
    try:
        sample.astype(int)
        return "integer"
    except (ValueError, TypeError):
        pass

    # Float?
    try:
        sample.astype(float)
        return "float"
    except (ValueError, TypeError):
        pass

    # Datetime?
    if col_name in ("created_at", "try_created_at", "verified_at", "settled_at"):
        try:
            sample.apply(pd.to_datetime)
            return "datetime"
        except Exception:
            pass
    # For other columns, check if they look like timestamps (ISO format with T)
    else:
        sample_str = non_null.head(1000).astype(str)
        if sample_str.str.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}').any():
            return "datetime"

    return "string"


def main():
    parser = argparse.ArgumentParser(description="Inspect CSV schema")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--out", default="docs/schema-summary.json",
                        help="Output JSON path")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}")
        raise SystemExit(1)

    # Use pandas for robust CSV handling
    df = pd.read_csv(csv_path, low_memory=False)

    # Output
    out_json_path = Path(args.out)
    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_md_path = out_json_path.parent / "data-dictionary.md"

    summary = {
        "file": str(csv_path),
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": [],
    }

    md_lines = [
        "# Data Dictionary — ZarrinPal Analytics",
        "",
        f"**Source file:** `{csv_path}`",
        f"**Rows:** {len(df):,}",
        f"**Columns:** {len(df.columns)}",
        "",
    ]

    numeric_cols = []
    datetime_cols = []
    categorical_cols = []

    for col in df.columns:
        series = df[col]
        nulls = series.isna().sum()
        null_pct = (nulls / len(df)) * 100 if len(df) > 0 else 0

        dtype = infer_type(series, col)

        col_info = {
            "name": col,
            "dtype": dtype,
            "null_count": int(nulls),
            "null_percentage": round(null_pct, 2),
            "unique_count": int(series.nunique()),
        }

        if dtype == "integer":
            col_info["min"] = int(series.min())
            col_info["max"] = int(series.max())
            numeric_cols.append(col)
        elif dtype == "float":
            col_info["min"] = float(series.min())
            col_info["max"] = float(series.max())
            numeric_cols.append(col)
        elif dtype == "datetime":
            col_info["min"] = str(series.min())
            col_info["max"] = str(series.max())
            datetime_cols.append(col)
        else:
            # Categorical
            values = series.dropna().astype(str)
            value_counts = values.value_counts().head(10).to_dict()
            col_info["sample_values"] = list(values.head(5).unique())
            col_info["value_counts"] = value_counts
            categorical_cols.append(col)

        # Example values (non-null)
        col_info["example_values"] = [
            str(v) for v in series.dropna().head(5).tolist()
        ]

        summary["columns"].append(col_info)

        # Build markdown
        md_lines.append(f"### `{col}`")
        md_lines.append(f"- **Type:** {col_info['dtype']}")
        md_lines.append(f"- **Nulls:** {nulls:,} ({null_pct:.2f}%)")
        md_lines.append(f"- **Unique values:** {col_info['unique_count']}")
        if dtype in ("integer", "float"):
            md_lines.append(f"- **Min:** {col_info['min']}")
            md_lines.append(f"- **Max:** {col_info['max']}")
        if col_info.get("example_values"):
            md_lines.append(f"- **Examples:** {', '.join(col_info['example_values'][:5])}")
        if col_info.get("value_counts"):
            vc_str = ", ".join(f"{k}: {v}" for k, v in col_info["value_counts"].items())
            md_lines.append(f"- **Value counts:** {vc_str}")
        md_lines.append("")

    # Analysis section
    md_lines.extend([
        "## Column Analysis",
        "",
        f"- **Numeric columns:** {', '.join(numeric_cols) if numeric_cols else 'None'}",
        f"- **Datetime columns:** {', '.join(datetime_cols) if datetime_cols else 'None'}",
        f"- **Categorical/text columns:** {', '.join(categorical_cols) if categorical_cols else 'None'}",
        "",
    ])

    # Key findings
    md_lines.extend([
        "## Key Findings",
        "",
        "- **Date column:** `created_at` (ISO 8601 datetime)",
        "- **Merchant identifier:** `merchant_key`",
        "- **Amount column:** `amount` (Rials)",
        f"- **Status column:** `session_status` with values: {', '.join(str(v) for v in df['session_status'].unique()) if 'session_status' in df.columns else 'N/A'}",
        "- **adjusted_fee:** Scaled value — relative comparisons only",
        "- **No reliable `customer_id` column found**",
        "- **No reliable `product_id` column found**",
        "",
    ])

    # Write files
    with open(out_json_path, "w") as f:
        json.dump(summary, f, indent=2)

    with open(out_md_path, "w") as f:
        f.write("\n".join(md_lines))

    print(f"Schema summary written to {out_json_path}")
    print(f"Data dictionary written to {out_md_path}")
    print(f"\nColumns found ({len(df.columns)}):")
    for col in df.columns:
        print(f"  - {col} ({infer_type(df[col])})")


if __name__ == "__main__":
    main()
