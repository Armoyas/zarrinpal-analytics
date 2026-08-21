# AGENTS.md — AI Coding Agent Reference

این فایل مرجع ضروری برای ایجنت‌های کدنویسی است که روی این پروژه کار می‌کنند. جزئیات، قراردادها و قواعد خاص پروژه را مشخص می‌کند.

---

## Project Overview

**ZarrinPal Analytics Dashboard** — داشبورد تحلیلی برای پذیرندگان درگاه پرداخت زرین‌پال.

- **چالش**: تحلیل دیتاست تراکنش ~۴۸۰ مگابایتی (Elcamp 1405)
- **هدف**: بینش‌های قابل اقدام + ردیابی‌پذیر برای پذیرنده غیرتکنیکال
- **معیارها**: اقدام‌پذیری (۹۰)، ردیابی‌پذیری (۷۵)، عمق تحلیلی (۶۰)، UX (۴۵)، کیفیت فنی (۳۰)

---

## Technology Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14/16 (App Router) · React 18/19 · TypeScript · shadcn/ui (50+ components) · Tailwind CSS v4 · TanStack Query v5 · Recharts · Vazirmatn (RTL) |
| Backend | FastAPI · DuckDB (direct CSV querying) · Pydantic v2 |
| Data | DuckDB (CSV direct read, no intermediate PostgreSQL) |
| Deploy | Docker Compose (simple, no Metabase/Redis needed) |

---

## Project Structure

```
services/
├── api/                      # FastAPI backend
│   └── app/
│       ├── main.py           # Entry point + router registration
│       ├── config.py         # Settings based on env
│       ├── db/duckdb_database.py  # DuckDB connection management
│       ├── api/v1/endpoints/        # health, schema, overview, merchants, trend
│       └── services/                # analytics_engine, data_processor
├── data-processing/          # Independent pipeline (optional)
│   └── process.py            # Analytical SQL views (explicit queries)
frontend/
├── app/                      # layout (RTL + Vazirmatn), page, globals.css
├── components/
│   ├── dashboard/            # Dashboard panels
│   ├── layout/               # Header, Sidebar, DashboardLayout
│   └── ui/                   # shadcn primitives
└── lib/                      # API client + format utils
scripts/                      # seed_demo.py, inspect_schema.py
docs/                         # setup.md, demo-script.md, PROJECT_HANDOFF.md
docs/                         # data-dictionary.md, schema-summary.json
specs/                        # SDD specifications
```

---

## Build & Development Commands

```bash
# Backend
cd services/api && pip install -r requirements.txt
python ../scripts/seed_demo.py --rows 10000 --out data/sample_data.csv
uvicorn app.main:app --reload            # http://localhost:8000

# Frontend
cd frontend && npm install && npm run dev   # http://localhost:3000

# Tests
cd services/api && pytest -v

# Generate sample data
python scripts/seed_demo.py --rows 100000 --out data/sample_data.csv

# Schema inspection
python scripts/inspect_schema.py --csv data/sample_data.csv --output docs/data-dictionary.md

# Full stack (Docker)
docker compose up -d --build
```

---

## Environment Configuration

`.env.example` (root) → copy to `.env`:

```env
DATA_FILE=data/sample_data.csv
DUCKDB_PATH=/app/data/analytics.duckdb
DEBUG=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Data Model — Dataset Schema (مهم)

هر ردیف یک **تلاش پرداخت** (`try_seq`) است، نه سشن یکتا. ستون‌های سطح سشن در هر تلاشِ همان سشن تکرار می‌شوند.

| Column | Type | Notes |
|---|---|---|
| `session_key` | id | شناسه مستعار سشن |
| `try_seq` | int | شماره تلاش (۱+)؛ `0` یعنی بدون تلاش |
| `terminal_key` / `merchant_key` | id | درگاه / صاحب حساب (یک پذیرنده چند درگاه) |
| `category_id` / `category_title` | int / text | صنف کسب‌وکار |
| `amount` | int | مبلغ به **ریال** |
| `adjusted_fee` | int | کارمزد تعدیل‌شده (ضریب ثابت) — **فقط مقایسه نسبی** |
| `session_status` / `try_status` | text | چرخه: Verified/Paid/InBank/Failed/Reversed/NoAttempt |
| `switch_response_code` | text | `PSP-xx:code` (nullable) |
| `psp_code` / `issuer_bank_code` / `payer_card_key` | text | nullable — فقط وقتی پرداخت در بانک تکمیل شود |
| `verify_type` | text | Automated / Manual |
| `init_time_ms` / `verify_time_ms` | int | مدت پاسخ API درگاه (میلی‌ثانیه)، nullable |
| `created_at` / `try_created_at` / `verified_at` / `settled_at` / `expire_in` | datetime | nullable بسته به مرحله |

### قواعد کسب‌وکار (Business Rules)

1. **`adjusted_fee` ≠ کارمزد واقعی** — با ضریب ثابت تعدیل شده. فقط روابط نسبی (رتبه، روند، سهم کارمزد از درآمد) معتبر است. هرگز به‌عنوان کارمزد واقعی معرفی نشود.
2. **واحد پول**: ریال.
3. **`payer_card_key` درون هر پذیرنده یکتاست** — یک کارت نزد دو پذیرنده دو شناسه متفاوت دارد.
4. **شناسه‌ها مستعار** هستند — به هیچ هویت واقعی اشاره نمی‌کنند.
5. ستون‌های میلی‌ثانیه‌ای مدت پاسخ API هستند، نه زمان تعامل کاربر.

---

## Analytics Methodology

- **سطح تحلیل**: تلاش پرداخت، نه سشن، برای متریک‌های سشن-سطحی (aggregate).
- **مقایسه نسبی**: همواره برای `adjusted_fee` (هرگز مطلق).
- **ردیابی‌پذیری**: هر متریک یک `SELECT` صریح در DuckDB دارد؛ endpoint `/schema` و `/overview` متادیتای محاسبه را نمایش می‌دهد.
- **مدیریت null**: ستون‌های کارت/بانک فقط در وضعیت تکمیل‌شده (Verified/Paid/Reversed) پر می‌شوند.
- **موفقیت تعریف می‌شود**: `session_status IN ('Verified', 'Paid', 'Reversed')`

---

## Code Conventions

### Python (FastAPI)
- Pydantic v2 (`model_config`، نه `Config` کلاس قدیمی)
- تایپ‌هینت صریح برای توابع عمومی
- SQL صریح (نه ORM مبهم) برای نماهای تحلیلی — برای ردیابی‌پذیری
- هر متریک شامل `calculation` (فرمول) و `limitation` (محدودیت) در پاسخ API

### TypeScript / React
- کامپوننت‌ها با `function ComponentName() {}`
- props با interface نام `{ComponentName}Props`
- `'use client'` فقط وقتی لازم است
- `cn()` از `@/lib/utils` برای merge کلاس‌ها
- فرمت اعداد فارسی: `Intl.NumberFormat('fa-IR')` — در `lib/utils.ts`
- RTL: `dir="rtl"` در layout، فونت Vazirmatn

---

## Common Development Tasks

### افزودن endpoint جدید
1. منطق در `services/api/app/db/duckdb_database.py` (متد `get_*`) یا `services/api/app/services/`
2. روتر در `services/api/app/api/v1/endpoints/` — فایل `nowruz.py` (تحلیلات نوروز)، `insights.py` (هوش مصنوعی)، `metrics.py`، یا به `__init__.py` اضافه کنید
3. در `insights.py` ثبت کنید: `router.include_router(insights_router, tags=["insights"])`
4. تست در `services/api/tests/`
5. تابع در `frontend/lib/api-client.ts` + کامپوننت در `frontend/components/dashboard/` یا `frontend/app/ai-dashboard/`

### روش‌های تحلیل هوش مصنوعی در DuckDBManager
- `get_spending_patterns()` — تحلیل الگوهای هزینه
- `get_risk_alerts(limit)` — هشدارهای خطر پذیرندگان
- `get_predictive_forecast(days)` — پیش‌بینی حجم تراکنش
- `get_anomaly_detection(limit)` — تشخیص انحراف ناهنجار
- `get_merchant_performance(merchant_key)` — پروفایل عملکرد هوشمند پذیرنده
- `get_nowruz_analytics()` — تحلیلات ضیافت نوروز با AI
- `get_nowruz_forecast()` — پیش‌بینی درآمد نوروز

### افزودن تحلیل هوش مصنوعی / نوروز
1. تابع در `services/api/app/db/duckdb_database.py` (ماتد `get_*` جدید)
2. endpoint در `services/api/app/api/v1/endpoints/insights.py` یا `.nowruz.py` — سپس در `__init__.py` ثبت کنید
3. تابع API در `frontend/lib/api-client.ts` + کامپوننت در `frontend/app/ai-dashboard/`
4. متادیتای محاسبه در پاسخ API (`calculation` + `limitation`)

### بازتولید داده
```bash
python scripts/seed_demo.py --rows 100000
```

---

## Troubleshooting

- **حافظه**: از DuckDB با dtype بهینه کنترل می‌شود؛ برای دیتاست کامل از `chunksize` استفاده کنید.
- **null در ستون‌های کارت/بانک**: عادی است — فقط در تراکنش تکمیل‌شده پر می‌شود.
- **build فرانت**: `output: 'standalone'` در `next.config.js` فعال است (برای Docker).
- **اتصال API**: فرانت `/api/*` را به بک‌اند پروکسی می‌کند (`NEXT_PUBLIC_API_URL`).
- **mcpgit MCP**: از `Bearer <github_token>` برای GitHub API استفاده کنید.
