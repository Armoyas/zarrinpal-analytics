FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY services/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY services/api/app/ ./app/
COPY data/ ./data/

# Expose port
EXPOSE 8000

# Run the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
