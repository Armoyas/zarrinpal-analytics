"""
Recommendation Engine - AI-powered insights for merchants

Note: adjusted_fee in the dataset is obfuscated with a hidden
coefficient. All fee recommendations are based on RELATIVE
comparisons, not absolute fee calculations.
"""
import pandas as pd
import duckdb
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RecommendationType(str, Enum):
    FEE_OPTIMIZATION = "fee_optimization"
    CHECKOUT_IMPROVEMENT = "checkout_improvement"
    SEASONAL_STRATEGY = "seasonal_strategy"
    FRAUD_ALERT = "fraud_alert"
    PEER_BEHAVIOR = "peer_behavior"


class RecommendationEngine:
    """
    Generates actionable, data-driven recommendations for merchants.
    
    Each recommendation includes:
    - Clear action item
    - Supporting data references
    - Confidence score
    - Expected impact
    
    IMPORTANT: All fee-related recommendations use adjusted_fee
    which is obfuscated. Only relative comparisons are valid.
    """
    
    def __init__(self, duckdb_conn):
        self.conn = duckdb_conn
    
    def generate_recommendations(
        self,
        merchant_id: str,
        include_types: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations for a merchant.
        """
        recommendations = []
        
        # 1. Fee optimization recommendation (relative only)
        fee_rec = self._fee_optimization_check(merchant_id)
        if fee_rec:
            recommendations.append(fee_rec)
        
        # 2. Success rate improvement
        success_rec = self._success_rate_check(merchant_id)
        if success_rec:
            recommendations.append(success_rec)
        
        # 3. Seasonal strategy (Nowruz)
        seasonal_rec = self._seasonal_strategy_check(merchant_id)
        if seasonal_rec:
            recommendations.append(seasonal_rec)
        
        # 4. Peer behavior insights
        peer_recs = self._peer_behavior_check(merch_id=merchant_id)
        recommendations.extend(peer_recs)
        
        # 5. Fraud/anomaly alerts
        anomaly_recs = self._anomaly_check(merchant_id)
        recommendations.extend(anomaly_recs)
        
        # Filter by type if specified
        if include_types:
            recommendations = [
                r for r in recommendations 
                if r['type'] in include_types
            ]
        
        return recommendations
    
    def _fee_optimization_check(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        """
        Check if merchant's fee ratio is above category average.
        NOTE: Uses adjusted_fee which is obfuscated.
        """
        query = """
            WITH merchant_fee AS (
                SELECT 
                    m.id as merchant_id,
                    m.category,
                    SUM(t.adjusted_fee) as total_fee,
                    SUM(t.amount) as total_volume,
                    SUM(t.adjusted_fee) / NULLIF(SUM(t.amount), 0) as fee_ratio
                FROM transactions t
                JOIN merchants m ON t.merchant_id = m.id
                WHERE t.merchant_id = ?
                GROUP BY m.id, m.category
            ),
            category_avg AS (
                SELECT 
                    AVG(fee_ratio) as avg_fee_ratio,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fee_ratio) as median_fee_ratio
                FROM (
                    SELECT 
                        SUM(t.adjusted_fee) / NULLIF(SUM(t.amount), 0) as fee_ratio
                    FROM transactions t
                    JOIN merchants m ON t.merchant_id = m.id
                    WHERE m.category = (SELECT category FROM merchant_fee LIMIT 1)
                    GROUP BY m.id
                ) cat_merchants
            )
            SELECT 
                mf.fee_ratio,
                ca.avg_fee_ratio,
                ca.median_fee_ratio,
                mf.fee_ratio - ca.avg_fee_ratio as excess_ratio
            FROM merchant_fee mf, category_avg ca
        """
        
        try:
            result = self.conn.execute(query, [merchant_id]).fetchone()
            if result and result[0]:
                fee_ratio, avg_ratio, median, excess = result
                
                if fee_ratio > avg_ratio * 1.1:  # 10% above average
                    return {
                        "type": "fee_optimization",
                        "title": "Fee Ratio Above Category Average",
                        "description": (
                            f"Your adjusted fee ratio ({fee_ratio*100:.2f}%) is "
                            f"{excess*100:.2f}% above your category average "
                            f"({avg_ratio*100:.2f}%). "
                            f"Note: These are relative comparisons only - adjusted_fee "
                            f"is obfuscated per ZarrinPal policy."
                        ),
                        "priority": "medium",
                        "action_url": "/recommendations/fee-optimization",
                        "data_reference": {
                            "source": "transactions, merchants tables",
                            "calculation": "sum(adjusted_fee)/sum(amount) per merchant vs category average",
                            "merchant_ratio": fee_ratio,
                            "category_average": avg_ratio,
                            "note": "adjusted_fee is NOT the real fee - relative comparisons only",
                        },
                    }
        except Exception as e:
            logger.warning(f"Fee optimization check failed: {e}")
        
        return None
    
    def _success_rate_check(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        """Check if merchant's success rate needs improvement."""
        query = """
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
                AVG(amount) as avg_transaction,
                AVG(CASE WHEN status = 'failed' THEN 1.0 ELSE 0.0 END) as failure_rate
            FROM transactions
            WHERE merchant_id = ?
              AND created_at >= NOW() - INTERVAL '30 days'
        """
        
        try:
            result = self.conn.execute(query, [merchant_id]).fetchone()
            if result:
                total, successful, avg_txn, failure_rate = result
                success_rate = successful / total if total > 0 else 0
                
                if success_rate < 0.90 or failure_rate > 0.05:
                    recommendations = []
                    
                    if success_rate < 0.90:
                        recommendations.append(
                            f"Your success rate ({success_rate*100:.1f}%) is below "
                            f"the recommended 90% threshold. Consider optimizing "
                            f"your checkout flow and payment method routing."
                        )
                    
                    if failure_rate > 0.05:
                        recommendations.append(
                            f"{failure_rate*100:.1f}% of transactions are failing. "
                            f"Review error patterns and retry logic."
                        )
                    
                    if recommendations:
                        return {
                            "type": "checkout_improvement",
                            "title": "Checkout Performance Needs Attention",
                            "description": " ".join(recommendations),
                            "priority": "high" if failure_rate > 0.10 else "medium",
                            "action_url": "/recommendations/checkout",
                            "data_reference": {
                                "source": "transactions table",
                                "calculation": "success/failed counts over 30 days",
                                "success_rate": success_rate,
                                "failure_rate": failure_rate,
                            },
                        }
        except Exception as e:
            logger.warning(f"Success rate check failed: {e}")
        
        return None
    
    def _seasonal_strategy_check(self, merchant_id: str) -> Optional[Dict[str, Any]]:
        """Check for seasonal patterns and provide strategy recommendations."""
        query = """
            SELECT 
                EXTRACT(MONTH FROM created_at) as month,
                EXTRACT(DAY FROM created_at) as day,
                COUNT(*) as transaction_count,
                SUM(amount) as total_volume
            FROM transactions
            WHERE merchant_id = ?
              AND created_at >= NOW() - INTERVAL '1 year'
            GROUP BY month, day
            ORDER BY month, day
        """
        
        try:
            results = self.conn.execute(query, [merchant_id]).fetchall()
            
            if not results:
                return None
            
            # Simple analysis: compare Nowruz period vs rest of year
            nowruz_periods = [(3, 20), (3, 21), (3, 22), (3, 23), (3, 24), (3, 25), (3, 26),
                             (3, 27), (3, 28), (3, 29), (3, 30), (3, 31),
                             (4, 1), (4, 2)]
            
            nowruz_data = [r for r in results if (r[0], r[1]) in nowruz_periods]
            rest_data = [r for r in results if (r[0], r[1]) not in nowruz_periods]
            
            nowruz_volume = sum(r[3] for r in nowruz_data)
            rest_volume = sum(r[3] for r in rest_data)
            nowruz_count = sum(r[2] for r in nowruz_data)
            rest_count = sum(r[2] for r in rest_data)
            
            nowruz_avg = nowruz_volume / nowruz_count if nowruz_count > 0 else 0
            rest_avg = rest_volume / rest_count if rest_count > 0 else 0
            
            if nowruz_avg > rest_avg * 1.5:
                increase_pct = ((nowruz_avg / rest_avg - 1) * 100) if rest_avg > 0 else 0
                return {
                    "type": "seasonal_strategy",
                    "title": "Nowruz Sales Opportunity",
                    "description": (
                        f"Your Nowruz period (Mar 20 - Apr 2) shows "
                        f"{increase_pct:.0f}% higher average transaction value "
                        f"compared to the rest of the year. Prepare "
                        f"inventory and capacity for this peak season."
                    ),
                    "priority": "high",
                    "action_url": "/recommendations/seasonal",
                    "data_reference": {
                        "source": "transactions table (1-year history)",
                        "calculation": "Average transaction value during Nowruz vs rest of year",
                        "nowruz_avg": nowruz_avg,
                        "rest_of_year_avg": rest_avg,
                    },
                }
        except Exception as e:
            logger.warning(f"Seasonal analysis failed: {e}")
        
        return None
    
    def _peer_behavior_check(self, merchant_id: str) -> List[Dict[str, Any]]:
        """Find actionable insights from peer merchant behaviors."""
        recommendations = []
        
        query = """
            WITH merchant_stats AS (
                SELECT 
                    m.id,
                    m.category,
                    COUNT(t.id) as total_transactions,
                    AVG(t.amount) as avg_transaction,
                    AVG(CASE WHEN t.status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
                    MODE() WITHIN GROUP (ORDER BY t.payment_method) as top_method
                FROM transactions t
                JOIN merchants m ON t.merchant_id = m.id
                WHERE t.created_at >= NOW() - INTERVAL '30 days'
                GROUP BY m.id, m.category
            ),
            target AS (
                SELECT * FROM merchant_stats WHERE id = ?
            ),
            peers AS (
                SELECT * FROM merchant_stats 
                WHERE category = (SELECT category FROM target)
                  AND id != (SELECT id FROM target)
            )
            SELECT 
                p.id as peer_id,
                p.avg_transaction as peer_avg_txn,
                p.success_rate as peer_success_rate,
                t.avg_transaction as my_avg_txn,
                t.success_rate as my_success_rate
            FROM peers p, target t
            WHERE p.avg_transaction > t.avg_transaction * 1.5
            LIMIT 5
        """
        
        try:
            results = self.conn.execute(query, [merchant_id]).fetchall()
            
            if results and len(results) > 0:
                top_peer = results[0]
                recommendations.append({
                    "type": "peer_behavior",
                    "title": "Learn from Top Performing Peers",
                    "description": (
                        f"Peer merchant in your category achieves "
                        f"{float(top_peer[1]):.0f} average transaction value "
                        f"vs your {float(top_peer[3]):.0f}. "
                        f"Study their checkout flow and product pricing strategy."
                    ),
                    "priority": "medium",
                    "action_url": "/recommendations/peer-insights",
                    "data_reference": {
                        "source": "transactions, merchants tables",
                        "calculation": "Peer merchant avg transaction comparison",
                        "peer_avg_txn": float(top_peer[1]),
                        "peer_success_rate": float(top_peer[2]),
                        "my_avg_txn": float(top_peer[3]),
                        "my_success_rate": float(top_peer[4]),
                    },
                })
        except Exception as e:
            logger.warning(f"Peer behavior analysis failed: {e}")
        
        return recommendations
    
    def _anomaly_check(self, merchant_id: str) -> List[Dict[str, Any]]:
        """Detect anomalous patterns that may indicate issues."""
        recommendations = []
        
        query = """
            SELECT 
                DATE_TRUNC('day', created_at) as day,
                COUNT(*) as daily_volume,
                AVG(CASE WHEN status = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
                AVG(amount) as avg_amount
            FROM transactions
            WHERE merchant_id = ?
              AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY day DESC
            LIMIT 30
        """
        
        try:
            results = self.conn.execute(query, [merchant_id]).fetchall()
            
            if len(results) < 10:
                return recommendations
            
            volumes = [r[1] for r in results]
            mean_volume = sum(volumes) / len(volumes)
            std_volume = (sum((v - mean_volume) ** 2 for v in volumes) / len(volumes)) ** 0.5
            
            for row in results:
                if std_volume > 0 and abs(row[1] - mean_volume) > 2 * std_volume:
                    direction = "spike" if row[1] > mean_volume else "drop"
                    recommendations.append({
                        "type": "fraud_alert",
                        "title": f"Unusual {direction.title()} in Transaction Volume",
                        "description": (
                            f"On {row[0]}, transaction volume was {row[1]} "
                            f"({direction} from average of {mean_volume:.0f}). "
                            f"Review transactions for potential issues."
                        ),
                        "priority": "high" if direction == "spike" else "medium",
                        "action_url": "/recommendations/anomalies",
                        "data_reference": {
                            "source": "transactions table (30-day history)",
                            "calculation": f"2-standard-deviation anomaly detection on daily volume",
                            "observed_value": int(row[1]),
                            "expected_range": f"{mean_volume - 2*std_volume:.0f} to {mean_volume + 2*std_volume:.0f}",
                        },
                    })
        except Exception as e:
            logger.warning(f"Anomaly detection failed: {e}")
        
        return recommendations
