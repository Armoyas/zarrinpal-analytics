# Data Dictionary — ZarrinPal Analytics

**Source file:** `smaple.csv`
**Rows:** 19,999
**Columns:** 22
**Currency:** Iranian rial (IRR)
**adjust_fee note:** The `adjusted_fee` column is confidentiality-scaled and must not be presented as the real
ZarinPal fee. Relative comparisons remain valid.

### `session_key`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 19506
- **Min:** 200
- **Max:** 2062743
- **Examples:** 1371823, 1303374, 23960, 1648036, 1992156

### `try_seq`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 23
- **Min:** 0
- **Max:** 22
- **Examples:** 1, 1, 1, 1, 0

### `terminal_key`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 29
- **Examples:** T318, T318, T318, T318, T318
- **Value counts:** T99: 5915, T196: 5020, T309: 3908, T59: 1804, T261: 1240, T97: 1156, T1: 208, T339: 202, T78: 91, T312: 78

### `merchant_key`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 29
- **Examples:** M145, M145, M145, M145, M145
- **Value counts:** M31: 5915, M43: 5020, M208: 3908, M250: 1804, M210: 1240, M37: 1156, M333: 208, M262: 202, M215: 91, M61: 78

### `category_id`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 5
- **Min:** 48160000
- **Max:** 82410000
- **Examples:** 48160002, 48160002, 48160002, 48160002, 48160002

### `category_title`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 5
- **Examples:** ارائه دهنده خدمات اینترنت, ارائه دهنده خدمات اینترنت, ارائه دهنده خدمات اینترنت, ارائه دهنده خدمات اینترنت, ارائه دهنده خدمات اینترنت
- **Value counts:** کیف و کفش فروشی: 6577, مراکز آموزشی مجازی: 6057, خدمات شبکه‌های کامپیوتری و اینترنت: 5807, ارائه دهنده خدمات اینترنت: 1296, فروشگاه لوازم آرایشی و بهداشتی: 262

### `amount`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 747
- **Min:** 1000
- **Max:** 901600000
- **Examples:** 6390000, 6390000, 3690000, 3799000, 12490000

### `adjusted_fee`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 706
- **Min:** 1920
- **Max:** 218400
- **Examples:** 56720, 56720, 35120, 35992, 105520

### `session_status`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 3
- **Examples:** Failed, Failed, Failed, Verified, Failed
- **Value counts:** Failed: 10231, Verified: 9502, Paid: 266

### `try_status`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 5
- **Examples:** Failed, InBank, InBank, Verified, NoAttempt
- **Value counts:** Verified: 9379, InBank: 8677, NoAttempt: 1488, Paid: 262, Failed: 193

### `switch_response_code`
- **Type:** string
- **Nulls:** 19,302 (96.51%)
- **Unique values:** 36
- **Examples:** PSP-05:55, PSP-03:56, PSP-03:56, PSP-03:56, PSP-03:59
- **Value counts:** PSP-05:12: 99, PSP-03:56: 95, PSP-03:51: 66, PSP-03:-3: 65, PSP-05:21: 63, PSP-05:15: 52, PSP-03:59: 49, PSP-05:-100: 32, PSP-03:54: 29, PSP-03:55: 26

### `psp_code`
- **Type:** string
- **Nulls:** 1,488 (7.44%)
- **Unique values:** 7
- **Examples:** PSP-05, PSP-05, PSP-05, PSP-05, PSP-02
- **Value counts:** PSP-03: 11973, PSP-05: 5853, PSP-07: 344, PSP-04: 184, PSP-01: 85, PSP-06: 44, PSP-02: 28

### `issuer_bank_code`
- **Type:** string
- **Nulls:** 10,358 (51.79%)
- **Unique values:** 27
- **Examples:** BANK-31, BANK-17, BANK-27, BANK-27, BANK-08
- **Value counts:** BANK-14: 2156, BANK-18: 1868, BANK-31: 1070, BANK-17: 564, BANK-12: 551, BANK-27: 504, BANK-29: 443, BANK-08: 372, BANK-25: 343, BANK-16: 328

### `payer_card_key`
- **Type:** string
- **Nulls:** 10,358 (51.79%)
- **Unique values:** 7865
- **Examples:** CARD-181237, CARD-145374, CARD-188168, CARD-148656, CARD-192289
- **Value counts:** CARD-195918: 22, CARD-112072: 21, CARD-163501: 18, CARD-182818: 18, CARD-231451: 15, CARD-322291: 15, CARD-67424: 14, CARD-9194: 14, CARD-280133: 12, CARD-126747: 12

### `verify_type`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 2
- **Examples:** Automated, Automated, Automated, Automated, Automated
- **Value counts:** Automated: 18730, Manual: 1269

### `init_time_ms`
- **Type:** float
- **Nulls:** 1,784 (8.92%)
- **Unique values:** 406
- **Min:** 53.0
- **Max:** 32156.0
- **Examples:** 86.0, 175.0, 201.0, 82.0, 100.0

### `verify_time_ms`
- **Type:** float
- **Nulls:** 10,360 (51.80%)
- **Unique values:** 323
- **Min:** 51.0
- **Max:** 11006.0
- **Examples:** 79.0, 159.0, 139.0, 83.0, 102.0

### `created_at`
- **Type:** datetime
- **Nulls:** 0 (0.00%)
- **Unique values:** 18987
- **Examples:** 2026-01-02 11:52:56, 2026-01-02 14:25:23, 2026-01-02 21:54:18, 2026-01-03 10:58:55, 2026-01-24 01:26:14

### `try_created_at`
- **Type:** datetime
- **Nulls:** 1,488 (7.44%)
- **Unique values:** 17997
- **Examples:** 2026-01-02 11:52:56, 2026-01-02 14:25:24, 2026-01-02 21:54:18, 2026-01-03 10:58:55, 2026-01-24 01:30:55

### `verified_at`
- **Type:** datetime
- **Nulls:** 10,497 (52.49%)
- **Unique values:** 9279
- **Examples:** 2026-01-03 11:00:37, 2026-01-24 12:07:02, 2026-01-25 12:10:17, 2026-01-08 20:13:16, 2026-01-01 14:12:29

### `settled_at`
- **Type:** datetime
- **Nulls:** 10,231 (51.16%)
- **Unique values:** 9546
- **Examples:** 2026-01-03 11:00:35, 2026-01-24 12:07:00, 2026-01-25 12:10:16, 2026-01-08 20:13:13, 2026-01-01 14:12:27

### `expire_in`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 18976
- **Examples:** 2026-01-02 12:22:56, 2026-01-02 14:55:23, 2026-01-02 22:24:18, 2026-01-03 11:28:55, 2026-01-24 01:56:14
- **Value counts:** 2026-01-24 02:01:44: 22, 2026-01-23 01:06:17: 22, 2026-01-02 18:41:02: 15, 2026-01-24 02:27:01: 14, 2026-01-23 01:21:35: 13, 2026-01-24 01:55:18: 13, 2026-01-24 01:56:33: 13, 2026-01-23 01:00:55: 12, 2026-01-23 01:08:21: 12, 2026-01-23 01:16:20: 12

## Column Analysis

- **Numeric columns:** session_key, try_seq, category_id, amount, adjusted_fee, init_time_ms, verify_time_ms
- **Datetime columns:** created_at, try_created_at, verified_at, settled_at
- **Categorical/text columns:** terminal_key, merchant_key, category_title, session_status, try_status, switch_response_code, psp_code, issuer_bank_code, payer_card_key, verify_type, expire_in

## Key Findings

- **Date column:** `created_at` (ISO 8601 datetime)
- **Merchant identifier:** `merchant_key`
- **Amount column:** `amount` (Rials)
- **Status column:** `session_status` with values: Failed, Verified, Paid
- **adjusted_fee:** Scaled value — relative comparisons only
- **No reliable `customer_id` column found**
- **No reliable `product_id` column found**
