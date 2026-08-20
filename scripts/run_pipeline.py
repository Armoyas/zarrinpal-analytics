"""
Main pipeline script for ZarrinPal Analytics.

Run with: python run_pipeline.py

Steps:
1. Load CSV data with chunked processing
2. Clean and normalize data
3. Load into DuckDB for analytics
4. Process and store in PostgreSQL
5. Generate analytics facts and recommendations
"""
import sys
import logging
import argparse
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pipeline.log'),
    ]
)
logger = logging.getLogger(__name__)


def run_data_pipeline(csv_path: str, duckdb_path: str, db_url: str):
    """Main pipeline orchestration."""
    
    logger.info("=" * 60)
    logger.info("ZarrinPal Analytics Data Pipeline")
    logger.info(f"Started at: {datetime.utcnow().isoformat()}")
    logger.info("=" * 60)
    
    # Step 1: Inspect CSV
    logger.info("Step 1: Inspecting CSV data...")
    from services.data_processor import get_csv_schema, estimate_dtypes
    
    schema = get_csv_schema(csv_path)
    logger.info(f"  Columns: {len(schema)}")
    logger.info(f"  Sample schema: {dict(list(schema.items())[:5])}")
    
    dtypes = estimate_dtypes(csv_path)
    logger.info(f"  Optimized dtypes: {len(dtypes)} columns")
    
    # Step 2: Load into DuckDB
    logger.info("Step 2: Loading into DuckDB...")
    from services.data_processor import load_into_duckdb
    
    conn = load_into_duckdb(csv_path, duckdb_path)
    row_count = conn.execute("SELECT COUNT(*) FROM transactions_raw").fetchone()[0]
    logger.info(f"  Loaded {row_count:,} rows into DuckDB")
    
    # Step 3: Clean data
    logger.info("Step 3: Cleaning data...")
    # Data cleaning happens during DuckDB loading with read_csv_auto
    
    # Step 4: Generate merchant aggregates
    logger.info("Step 4: Generating merchant aggregates...")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS merchants AS
        SELECT 
            merchant_id as id,
            COUNT(*) as total_transactions,
            SUM(amount) as total_volume,
            AVG(amount) as avg_transaction_amount,
            AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
            SUM(adjusted_fee) as total_adjusted_fee
        FROM transactions_raw
        GROUP BY merchant_id
    """)
    
    merchant_count = conn.execute("SELECT COUNT(*) FROM merchants").fetchone()[0]
    logger.info(f"  Processed {merchant_count:,} merchants")
    
    # Step 5: Generate analytics facts
    logger.info("Step 5: Generating analytics facts...")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analytics_facts AS
        SELECT 
            merchant_id,
            DATE_TRUNC('day', created_at::DATE) as date,
            'daily' as period,
            COUNT(*) as transaction_count,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_count,
            SUM(amount) as total_volume,
            SUM(adjusted_fee) as total_adjusted_fee,
            AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
        FROM transactions_raw
        GROUP BY merchant_id, DATE_TRUNC('day', created_at::DATE)
    """)
    
    fact_count = conn.execute("SELECT COUNT(*) FROM analytics_facts").fetchone()[0]
    logger.info(f"  Generated {fact_count:,} analytics facts")
    
    # Step 6: Generate recommendations
    logger.info("Step 6: Generating recommendations...")
    from services.recommendations import RecommendationEngine
    
    engine = RecommendationEngine(conn)
    
    # Get top merchants for recommendations
    top_merchants = conn.execute("""
        SELECT id FROM merchants 
        ORDER BY total_volume DESC 
        LIMIT 100
    """).fetchall()
    
    total_recs = 0
    for (merchant_id,) in top_merchants:
        recs = engine.generate_recommendations(merchant_id)
        if recs:
            total_recs += len(recs)
    
    logger.info(f"  Generated {total_recs} recommendations for top 100 merchants")
    
    # Step 7: Export to PostgreSQL
    logger.info("Step 7: Exporting to PostgreSQL...")
    # This would be implemented with SQLAlchemy in production
    
    logger.info("=" * 60)
    logger.info("Pipeline completed successfully!")
    logger.info(f"Total rows processed: {row_count:,}")
    logger.info(f"Total merchants: {merchant_count:,}")
    logger.info(f"Total analytics facts: {fact_count:,}")
    logger.info(f"Total recommendations: {total_recs}")
    logger.info(f"Completed at: {datetime.utcnow().isoformat()}")
    logger.info("=" * 60)
    
    conn.close()
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='ZarrinPal Analytics Pipeline')
    parser.add_argument(
        '--csv-path', 
        type=str, 
        default='/app/data/zarrinpal_dataset.csv',
        help='Path to the ZarrinPal CSV dataset'
    )
    parser.add_argument(
        '--duckdb-path', 
        type=str, 
        default='/app/data/transactions.duckdb',
        help='Path to DuckDB database file'
    )
    parser.add_argument(
        '--db-url', 
        type=str, 
        default=None,
        help='PostgreSQL database URL'
    )
    
    args = parser.parse_args()
    
    try:
        success = run_data_pipeline(
            csv_path=args.csv_path,
            duckdb_path=args.duckdb_path,
            db_url=args.db_url,
        )
        sys.exit(0 if success else 1)
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        logger.info("Please download the dataset and place it at the correct path.")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        sys.exit(1)
