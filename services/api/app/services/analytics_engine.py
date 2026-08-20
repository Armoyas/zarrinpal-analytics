"""
Analytics Engine - Merchant performance and market analysis
"""
import pandas as pd
import duckdb
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ZarrinPalAnalyticsEngine:
    """
    Analytics engine for ZarrinPal transaction data.
    
    Provides multi-stage analytical reasoning including:
    - Merchant performance ranking
    - Peer comparison analysis
    - Seasonal/trend detection
    - Anomaly detection
    """
    
    def __init__(self, duckdb_path: str):
        self.duckdb_path = duckdb_path
        self.conn = duckdb.connect(duckdb_path)
    
    def get_merchant_rankings(
        self,
        metric: str = "total_volume",
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Rank merchants by a specific metric.
        
        Note: adjusted_fee is obfuscated - only relative comparisons valid.
        """
        valid_metrics = ["total_volume", "total_transactions", "success_rate"]
        if metric not in valid_metrics:
            raise ValueError(f"Invalid metric. Choose from: {valid_metrics}")
        
        query = f"""
            SELECT 
                merchant_id,
                COUNT(*) as total_transactions,
                SUM(amount) as total_volume,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM transactions_raw
            GROUP BY merchant_id
            ORDER BY {metric} DESC
            LIMIT {limit}
        """
        
        results = self.conn.execute(query).df()
        
        # Add rankings
        results['rank'] = range(1, len(results) + 1)
        
        return results.to_dict('records')
    
    def analyze_merchant_performance(
        self,
        merchant_id: str,
        period_days: int = 30,
    ) -> Dict[str, Any]:
        """
        Detailed performance analysis for a specific merchant.
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)
        
        query = """
            SELECT 
                merchant_id,
                COUNT(*) as transaction_count,
                SUM(amount) as total_volume,
                AVG(amount) as avg_transaction,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
                SUM(adjusted_fee) as total_adjusted_fee,
                AVG(adjusted_fee) as avg_adjusted_fee
            FROM transactions_raw
            WHERE merchant_id = ?
              AND created_at >= ?
              AND created_at <= ?
            GROUP BY merchant_id
        """
        
        result = self.conn.execute(
            query, [merchant_id, start_date, end_date]
        ).df()
        
        if result.empty:
            return {"error": "No data found for merchant in period"}
        
        merchant_data = result.iloc[0].to_dict()
        
        # Peer comparison
        merchant_category = self._get_merchant_category(merchant_id)
        peer_metrics = self._get_category_benchmarks(merchant_category)
        
        # Trend analysis
        trend = self._calculate_trend(merchant_id, period_days)
        
        return {
            "merchant_id": merchant_id,
            "metrics": merchant_data,
            "peer_comparison": peer_metrics,
            "trend": trend,
            "data_provenance": {
                "source": "transactions_raw table (via DuckDB)",
                "calculation": "Aggregated over period_days",
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat(),
            },
        }
    
    def analyze_nowruz_impact(
        self,
        merchant_id: Optional[str] = None,
        year: int = 2024,
    ) -> Dict[str, Any]:
        """
        Analyze Nowruz (Persian New Year) impact on transaction patterns.
        
        Nowruz typically: March 20 - April 2
        """
        nowruz_start = datetime(year, 3, 20)
        pre_start = nowruz_start - timedelta(days=14)
        pre_end = nowruz_start - timedelta(days=1)
        post_start = nowruz_start + timedelta(days=14)
        post_end = nowruz_start + timedelta(days=28)
        
        conditions = ""
        params = [pre_start, pre_end]
        if merchant_id:
            conditions = f"AND merchant_id = '{merchant_id}'"
        
        pre_query = f"""
            SELECT 
                COUNT(*) as transactions,
                SUM(amount) as volume,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM transactions_raw
            WHERE created_at >= ? AND created_at <= ? {conditions}
        """
        
        holiday_query = f"""
            SELECT 
                COUNT(*) as transactions,
                SUM(amount) as volume,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM transactions_raw
            WHERE created_at >= ? AND created_at <= ? {conditions}
        """
        
        # Note: This is simplified - real implementation needs parameterized queries
        # with proper date parameters for each period
        
        return {
            "nowruz_year": year,
            "pre_period": {"start": pre_start.isoformat(), "end": pre_end.isoformat()},
            "holiday_period": {"start": nowruz_start.isoformat(), "end": (nowruz_start + timedelta(days=13)).isoformat()},
            "post_period": {"start": post_start.isoformat(), "end": post_end.isoformat()},
            "note": "Detailed metrics require parameterized queries",
        }
    
    def detect_anomalies(self, merchant_id: str) -> List[Dict[str, Any]]:
        """
        Detect anomalies in merchant transaction patterns.
        
        Uses statistical methods to identify unusual patterns
        that may indicate fraud or system issues.
        """
        # Get merchant's historical data
        query = """
            SELECT 
                DATE_TRUNC('hour', created_at) as hour,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM transactions_raw
            WHERE merchant_id = ?
            GROUP BY DATE_TRUNC('hour', created_at)
            ORDER BY hour
        """
        
        hourly_data = self.conn.execute(query, [merchant_id]).df()
        
        anomalies = []
        
        # Detect spikes in transaction count (3+ std devs)
        if len(hourly_data) > 0:
            mean_count = hourly_data['transaction_count'].mean()
            std_count = hourly_data['transaction_count'].std()
            
            for _, row in hourly_data.iterrows():
                if std_count > 0 and abs(row['transaction_count'] - mean_count) > 3 * std_count:
                    anomalies.append({
                        "timestamp": row['hour'].isoformat() if hasattr(row['hour'], 'isoformat') else str(row['hour']),
                        "type": "transaction_spike",
                        "value": int(row['transaction_count']),
                        "expected_range": f"{mean_count - 3*std_count:.0f} to {mean_count + 3*std_count:.0f}",
                        "description": "Unusual number of transactions for this hour",
                    })
        
        return anomalies
    
    def _get_merchant_category(self, merchant_id: str) -> Optional[str]:
        """Get merchant category from transactions."""
        query = """
            SELECT DISTINCT category 
            FROM merchants 
            WHERE id = ?
        """
        try:
            result = self.conn.execute(query, [merchant_id]).fetchone()
            return result[0] if result else None
        except Exception:
            return None
    
    def _get_category_benchmarks(self, category: Optional[str]) -> Dict[str, Any]:
        """Get benchmark metrics for a merchant category."""
        conditions = f"AND m.category = '{category}'" if category else ""
        
        query = f"""
            SELECT 
                COUNT(DISTINCT m.id) as merchant_count,
                SUM(m.total_transactions) as total_transactions,
                AVG(m.success_rate) as avg_success_rate,
                AVG(m.total_volume) as avg_volume,
                AVG(m.total_adjusted_fee / NULLIF(m.total_volume, 0)) as avg_fee_share
            FROM merchants m
            WHERE 1=1 {conditions}
        """
        
        try:
            result = self.conn.execute(query).fetchone()
            return {
                "merchant_count": result[0],
                "total_transactions": result[1],
                "avg_success_rate": result[2],
                "avg_volume": result[3],
                "avg_fee_share": result[4],
            }
        except Exception:
            return {}
    
    def _calculate_trend(self, merchant_id: str, period_days: int) -> Dict[str, Any]:
        """Calculate trend metrics for a merchant over a period."""
        end_date = datetime.now()
        mid_date = end_date - timedelta(days=period_days // 2)
        start_date = end_date - timedelta(days=period_days)
        
        query = """
            SELECT 
                CASE 
                    WHEN created_at < ? THEN 'first_half'
                    ELSE 'second_half'
                END as period,
                COUNT(*) as transaction_count,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate
            FROM transactions_raw
            WHERE merchant_id = ?
              AND created_at >= ?
              AND created_at <= ?
            GROUP BY period
        """
        
        try:
            result = self.conn.execute(query, [mid_date, merchant_id, start_date, end_date]).df()
            
            if len(result) == 2:
                first_half = result[result['period'] == 'first_half'].iloc[0]
                second_half = result[result['period'] == 'second_half'].iloc[0]
                
                volume_change = ((second_half['transaction_count'] - first_half['transaction_count']) 
                                 / first_half['transaction_count'] * 100) if first_half['transaction_count'] > 0 else 0
                success_change = ((second_half['success_rate'] - first_half['success_rate']) * 100) if first_half['success_rate'] else 0
                
                return {
                    "volume_change_pct": volume_change,
                    "success_rate_change_pct": success_change,
                    "trend_direction": "up" if volume_change > 5 else ("down" if volume_change < -5 else "stable"),
                }
        except Exception:
            pass
        
        return {"volume_change_pct": 0, "success_rate_change_pct": 0, "trend_direction": "unknown"}
    
    def close(self):
        """Close the DuckDB connection."""
        if self.conn:
            self.conn.close()
