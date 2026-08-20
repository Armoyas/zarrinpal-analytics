# Data Directory

> ⚠️ **هرگز فایل کامل CSV را commit نکنید** (حجم ~۴۸۰ مگابایت). این پوشه در `.gitignore` مستثنا شده است — فقط این `README.md` در مخزن می‌ماند.

## دریافت دیتاست

دیتاست رسمی چالش را از لینک چالش دانلود کنید و در اینجا قرار دهید:

```bash
# ساختار مورد انتظار
./data/zarrinpal_dataset.csv
```

## ساخت نمونه کوچک برای تست (بدون commit کل فایل)

```bash
mkdir -p data
head -n 15000 full_dataset.csv > data/sample_data.csv
```

یا با اسکریپت داخلی (داده مصنوعی با همان schema):

```bash
python scripts/seed_demo.py --rows 100000 --out data/zarrinpal_dataset.csv
```

## بررسی schema واقعی (قبل از اجرا)

قبل از اجرای کامل، هدر واقعی CSV را با ستون‌های مورد انتظار مقایسه کنید:

```bash
head -n 1 data/zarrinpal_dataset.csv
```

ستون‌های مورد انتظار (طبق مستندات چالش):

```
session_key, try_seq, terminal_key, merchant_key, category_id, category_title,
amount, adjusted_fee, session_status, try_status, switch_response_code,
psp_code, issuer_bank_code, payer_card_key, verify_type, init_time_ms,
verify_time_ms, created_at, try_created_at, verified_at, settled_at, expire_in
```

> اگر نام ستون‌ها متفاوت بود، `services/data-processing/ingest.py` را مطابق هدر واقعی اصلاح کنید.

---

## تحلیل‌های ممکن vs غیرممکن (با همین schema)

### ✅ قابل پیاده‌سازی
- رتبه‌بندی پذیرندگان، حجم/مبلغ/نرخ موفقیت/شکست
- تحلیل روند زمانی و فصلی (نوروز)
- مقایسه هم‌صنف (`category_id`)
- سهم `adjusted_fee` (فقط نسبی — کارمزد واقعی نیست)
- تشخیص ناهنجاری، سگمنت‌بندی پذیرندگان
- نرخ موفقیت/شکست در هر مرحله چرخه پرداخت

### ❌ نیازمند ستون‌هایی که در دیتاست وجود ندارند
- **fast-moving / slow-moving**: نیازمند ستون‌های محصول (`product_id`)، موجودی و فروش است — **وجود ندارد**؛ نباید فرض شود.
- **موجودی/گردش کالا و overstock**: نیازمند داده انبار — وجود ندارد.

### ⚠️ محدود
- **رفتار مشتری / خرید مجدد**: تنها شناسه کارت `payer_card_key` است که **درون هر پذیرنده** یکتاست (یک کارت نزد دو پذیرنده دو شناسه متفاوت). تحلیل خرید مجدد فقط *درون یک پذیرنده* و با این محدودیت ممکن است.

---

## قراردادهای داده

- **واحد پول**: ریال (تمام مبالغ).
- **سطح داده**: تلاش پرداخت (`try_seq`)، نه سشن یکتا.
- **`adjusted_fee`**: با ضریب ثابت تعدیل شده — **فقط مقایسه نسبی** معتبر است.
- **nullها**: ستون‌های کارت/بانک فقط در تراکنش تکمیل‌شده پر می‌شوند.
- **شناسه‌ها مستعار** هستند.
