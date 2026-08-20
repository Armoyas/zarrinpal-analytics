# راهنمای اجرا (Setup Guide)

داشبورد تحلیلی زرین‌پال — اجرای سریع با Docker Compose.

## پیش‌نیازها

- Docker + Docker Compose (نسخه 2+)
- حداقل ۴ گیگابایت رم (به دلیل حجم دیتاست)

## اجرای سریع

```bash
# 1) کلون
git clone https://github.com/Armoyas/zarrinpal-analytics.git
cd zarrinpal-analytics

# 2) فایل محیطی
cp .env.example .env

# 3) دیتاست (یکی از دو روش)
#    الف) دانلود دیتاست رسمی چالش و قرار دادن در ./data/zarrinpal_dataset.csv
#    ب) تولید داده نمونه برای دمو (بدون Docker):
python scripts/seed_demo.py --rows 100000 --out data/sample_data.csv

# 4) اجرا
docker compose up -d --build
```

## سرویس‌ها

| سرویس | آدرس | توضیح |
|---|---|---|
| داشبورد (فرانت‌اند) | http://localhost:3000 | رابط فارسی/RTL برای پذیرنده |
| API بک‌اند | http://localhost:8000 | مستندات خودکار: `/docs` |

> **نکته:** این نسخه از Phase 0 فقط از DuckDB استفاده می‌کند.
> نسخه‌های آینده ممکن است Metabase یا Redis اضافه کنند.

## اجرا بدون Docker (توسعه)

```bash
# داده نمونه
python scripts/seed_demo.py --rows 10000 --out data/sample_data.csv

# بک‌اند
cd services/api && pip install -r requirements.txt
uvicorn app.main:app --reload

# فرانت‌اند
cd frontend && npm install && npm run dev

# تست
cd services/api && pytest -v
```

## نکات داده

- هر ردیف یک **تلاش پرداخت** است، نه سشن یکتا.
- `adjusted_fee` با ضریب ثابت تعدیل شده — **فقط مقایسه نسبی** معتبر است.
- واحد مبالغ **ریال** است.
- ستون‌های کارت/بانک فقط وقتی پرداخت در بانک تکمیل شود پر می‌شوند.
- **موفقیت تعریف شده:** `session_status IN ('Verified', 'Paid', 'Reversed')`
