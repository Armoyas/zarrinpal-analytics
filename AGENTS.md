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
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · shadcn/ui · Tailwind CSS v3 · Recharts |
| Backend | FastAPI · SQLAlchemy · Pydantic v2 |
| Data | DuckDB (تحلیل سریع) → PostgreSQL (ماندگاری) · Pandas |
| Deploy | Docker Compose · Metabase (اختیاری) · Redis (اختیاری) |

---

## Project Structure

```
services/
├── api/                      # FastAPI backend
│   └── app/
│       ├── main.py           # ورودی + اتصال روترها
│       ├── config.py         # تنظیمات مبتنی بر env
│       ├── database.py       # SQLAlchemy + PostgreSQL
│       ├── models/           # Merchant, Transaction, AnalyticsFact, Recommendation
│       ├── schemas/          # مدل‌های Pydantic
│       ├── routers/          # health, merchants, analytics
│       └── services/         # analytics_engine, data_processor, recommendations
├── data-processing/          # پایپ‌لاین مستقل
│   ├── ingest.py             # CSV چانکی → DuckDB
│   └── process.py            # نماهای تحلیلی (SQL صریح)
frontend/
├── app/                      # layout (RTL + Vazirmatn), page, globals.css
├── components/
│   ├── dashboard/            # ۸ پنل داشبورد
│   ├── layout/               # Header, Sidebar, DashboardLayout
│   └── ui/                   # shadcn primitives
└── lib/                      # api client + format utils
scripts/                      # run_pipeline.py, seed_demo.py
docs/                         # setup.md, demo-script.md
specs/                        # constitution, planning, tasks, spec (SDD)
```

---

## Build & Development Commands

```bash
# Backend
cd services/api && pip install -r requirements.txt
uvicorn app.main:app --reload            # http://localhost:8000

# Frontend
cd frontend && npm install && npm run dev   # http://localhost:3000
npm run build

# Data pipeline
cd services/data-processing && pip install -r requirements.txt
python ingest.py --csv ../../data/zarrinpal_dataset.csv
python process.py

# Sample data
python scripts/seed_demo.py --rows 100000 --out data/zarrinpal_dataset.csv

# Full stack
docker compose up -d --build
```

---

## Environment Configuration

`.env.example` (ریشه) → کپی به `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=zarrinpal_secret
DATABASE_URL=postgresql://postgres:zarrinpal_secret@postgres:5432/zarrinpal
DATA_FILE=/app/data/zarrinpal_dataset.csv
DUCKDB_PATH=/app/data/transactions.duckdb
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

- **سطح تحلیل**: سشن (dedupe با `session_key`)، نه تلاش، برای متریک‌های تجمیعی.
- **مقایسه نسبی**: همیشه برای `adjusted_fee` (هرگز مطلق).
- **ردیابی‌پذیری**: هر نما یک `SELECT` صریح در `process.py` دارد؛ endpoint `/provenance` و پنل UI آن را نمایش می‌دهد.
- **تحلیل فصلی**: نوروز (اسفند/فروردین) — قبل/حین/بعد.
- **مقایسه هم‌صنفی**: میانه / صدک ۹۰ / درصد رتبه درون `category_id`.
- **مدیریت null**: ستون‌های کارت/بانک فقط در وضعیت تکمیل‌شده (Verified/Paid/Reversed) پر می‌شوند.

---

## Code Conventions

### Python (FastAPI)
- Pydantic v2 (`model_config`، نه `Config` کلاس قدیمی)
- تایپ‌هینت صریح برای توابع عمومی
- SQL صریح (نه ORM مبهم) برای نماهای تحلیلی — برای ردیابی‌پذیری

### TypeScript / React
- کامپوننت‌ها با `function ComponentName() {}`
- props با interface نام `{ComponentName}Props`
- `'use client'` فقط وقتی لازم است
- `cn()` از `@/lib/utils` برای merge کلاس‌ها
- فرمت اعداد فارسی: `Intl.NumberFormat('fa-IR')` — در `lib/utils.ts`

---

## Common Development Tasks

### افزودن endpoint جدید
1. منطق در `services/api/app/services/`
2. روتر در `services/api/app/routers/`
3. ثبت در `main.py`
4. تابع در `frontend/lib/api.ts` + کامپوننت در `frontend/components/dashboard/`

### افزودن نمای تحلیلی جدید
1. تابع SQL در `services/data-processing/process.py`
2. endpoint در `analytics.py`
3. پنل در `frontend/components/dashboard/` + ثبت provenance

### بازتولید داده
```bash
python scripts/seed_demo.py --rows 100000
```

---

## Troubleshooting

- **حافظه در ingest**: با `chunksize=10000` و dtype بهینه کنترل می‌شود.
- **null در ستون‌های کارت/بانک**: عادی است — فقط در تراکنش تکمیل‌شده پر می‌شود.
- **build فرانت**: `output: 'standalone'` در `next.config.js` فعال است (برای Docker).
- **اتصال API**: فرانت `/api/*` را به بک‌اند پروکسی می‌کند (`NEXT_PUBLIC_API_URL`).
