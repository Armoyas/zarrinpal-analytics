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
 #    ب) تولید داده نمونه برای دمو:
 pip install pandas
 python scripts/seed_demo.py --rows 100000 --out data/zarrinpal_dataset.csv

# 4) اجرا
 docker compose up -d --build
```

## سرویس‌ها

| سرویس | آدرس | توضیح |
|---|---|---|
| داشبورد (فرانت‌اند) | http://localhost:3000 | رابط فارسی/RTL برای پذیرنده |
| API بک‌اند | http://localhost:8000 | مستندات خودکار: `/docs` |
| PostgreSQL | localhost:5432 | ذخیره نتایج پردازش |
| Metabase (اختیاری) | http://localhost:3001 | ردیابی/شفاف‌سازی تحلیلی |
| Redis (اختیاری) | localhost:6379 | کش |

## اجرای بدون Docker (توسعه)

```bash
# بک‌اند
cd services/api && pip install -r requirements.txt
uvicorn app.main:app --reload

# فرانت‌اند
cd frontend && npm install && npm run dev

# پایپ‌لاین داده
cd services/data-processing && pip install -r requirements.txt
python ingest.py --csv ../../data/zarrinpal_dataset.csv
python process.py
```

## نکات داده

- هر ردیف یک **تلاش پرداخت** است، نه سشن یکتا.
- `adjusted_fee` با ضریب ثابت تعدیل شده — **فقط مقایسه نسبی** معتبر است.
- واحد مبالغ **ریال** است.
- ستون‌های کارت/بانک فقط وقتی پرداخت در بانک تکمیل شود پر می‌شوند.
