# API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
None — the API is open for development and analytics purposes.

---

## Endpoints

### 1. Health Check

```
GET /api/v1/health
```

**Description:** Returns the health status of the backend service.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "zarinpal-analytics-api"
}
```

**Response (503):** Service unhealthy (includes error detail).

---

### 2. Dataset Schema

```
GET /api/v1/schema
```

**Description:** Returns metadata about the dataset columns and types.

**Response (200):**
```json
{
  "columns": [
    {
      "name": "session_key",
      "type": "VARCHAR",
      "nullable": true
    },
    {
      "name": "amount",
      "type": "BIGINT",
      "nullable": false
    }
  ],
  "row_count": 10000,
  "source_file": "sample_data.csv"
}
```

---

### 3. Merchant List

```
GET /api/v1/merchants?category_id={category_id}&date_from={date_from}&date_to={date_to}
```

**Description:** Returns a list of merchants with summary metrics. Supports optional filtering by category and date range.

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `category_id` | query | integer | No | Filter by category ID |
| `date_from` | query | string (ISO) | No | Start date (inclusive) |
| `date_to` | query | string (ISO) | No | End date (inclusive) |

**Response (200):**
```json
{
  "merchants": [
    {
      "merchant_key": "m_001",
      "merchant_name": "Merchant 1",
      "total_amount": 500000000,
      "transaction_count": 1500,
      "verified_count": 1200,
      "success_rate": 80.0
    }
  ]
}
```

---

### 4. Overview Metrics

```
GET /api/v1/overview?merchant_key={merchant_key}&category_id={category_id}&date_from={date_from}&date_to={date_to}&group_by={group_by}
```

**Description:** Returns KPI metrics for a selected merchant, category, or the entire dataset.

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `merchant_key` | query | string | No | Filter by merchant key |
| `category_id` | query | integer | No | Filter by category ID |
| `date_from` | query | string (ISO) | No | Start date |
| `date_to` | query | string (ISO) | No | End date |
| `group_by` | query | string | No | Group by `merchant` or `category` |

**Response (200):**
```json
{
  "attempt_count": 5000,
  "unique_session_count": 3500,
  "verified_count": 4000,
  "settled_count": 3950,
  "failed_count": 1000,
  "success_rate": 80.0,
  "total_amount": 2500000000,
  "average_amount": 500000,
  "traceability": {
    "metrics": [
      {
        "metric_id": "attempt_count",
        "definition": "Payment attempt row count",
        "formula": "COUNT(rows)",
        "source_columns": [],
        "counting_unit": "rows",
        "filters": {...},
        "limitations": "A row is a payment attempt..."
      }
    ]
  }
}
```

---

### 5. Daily Trends

```
GET /api/v1/trends?merchant_key={merchant_key}&category_id={category_id}&date_from={date_from}&date_to={date_to}
```

**Description:** Returns daily payment activity and amount trends.

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `merchant_key` | query | string | No | Filter by merchant key |
| `category_id` | query | integer | No | Filter by category ID |
| `date_from` | query | string (ISO) | No | Start date |
| `date_to` | query | string (ISO) | No | End date |

**Response (200):**
```json
{
  "daily_trends": [
    {
      "date": "2024-01-01",
      "daily_count": 120,
      "daily_amount": 60000000,
      "daily_verified": 100,
      "daily_success_rate": 83.3
    }
  ]
}
```

---

### 6. Merchant Detail

```
GET /api/v1/merchants/{merchant_key}/detail?date_from={date_from}&date_to={date_to}
```

**Description:** Returns detailed metrics for a specific merchant.

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `merchant_key` | path | string | Yes | Merchant key |
| `date_from` | query | string (ISO) | No | Start date |
| `date_to` | query | string (ISO) | No | End date |

**Response (200):**
```json
{
  "merchant_key": "m_001",
  "merchant_name": "Merchant 1",
  "category_id": 1,
  "category_title": "Retail",
  "terminal_key": "t_001",
  "total_amount": 500000000,
  "transaction_count": 1500,
  "verified_count": 1200,
  "settled_count": 1190,
  "failed_count": 300,
  "success_rate": 80.0,
  "average_amount": 333333
}
```

---

## Error Responses

### 422 Unprocessable Entity
Returned when the date range is invalid (e.g., `date_from > date_to`).

```json
{
  "detail": "date_from cannot be later than date_to"
}
```

### 404 Not Found
Returned when a merchant key is not found.

```json
{
  "detail": "Merchant 'm_999' not found in dataset"
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs.

```json
{
  "detail": "Internal server error: ..."
}
```
