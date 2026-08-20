# Data Processing Pipeline

Ingest the ZarrinPal 480MB transaction CSV into DuckDB and build analytical views.

## Usage

```bash
pip install -r requirements.txt

# 1) Ingest CSV -> DuckDB (chunked, memory-bounded)
python ingest.py --csv /path/to/zarrinpal_dataset.csv --db zarrinpal.duckdb

# 2) Build analytical views
python process.py --db zarrinpal.duckdb
```

## Dataset notes

- Each row is a **payment attempt** (`try_seq`), not a unique session.
- `adjusted_fee` is scaled by a constant coefficient — **only relative
  comparisons are valid** (rankings, trends, fee-to-volume ratio).
- Amounts are in **Iranian Rials**.
- Nullable columns reflect the payment lifecycle (card/bank info only returns
  when the payment completes at the bank).
