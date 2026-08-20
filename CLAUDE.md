# CLAUDE.md

مرجع سریع برای Claude Code و ابزارهای سازگار. جزئیات کامل در [AGENTS.md](AGENTS.md) است.

## قواعد کلیدی

1. **دیتاست**: هر ردیف یک تلاش پرداخت است؛ `adjusted_fee` فقط برای مقایسه نسبی.
2. **واحد پول**: ریال.
3. **ردیابی‌پذیری**: هر عدد باید از یک SQL صریح در `services/data-processing/process.py` مشتق شود.
4. **فرانت**: RTL فارسی، فونت Vazirmatn، کامپوننت‌های shadcn/ui.
5. **SDD**: قبل از کد، spec/plan/tasks را به‌روز کنید (پوشه `specs/`).

## اجرا

```bash
docker compose up -d --build          # کل استک
cd services/api && uvicorn app.main:app --reload   # بک‌اند
cd frontend && npm run dev            # فرانت
python scripts/seed_demo.py --rows 100000          # داده نمونه
```
