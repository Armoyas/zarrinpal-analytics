# Data Dictionary — ZarrinPal Analytics

**Source file:** `data/sample_data.csv`
**Rows:** 10,000
**Columns:** 22

### `session_key`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 10000
- **Examples:** 53d90291-1561-490d-b42f-eaceca483de1, 67f9323f-8648-4024-8385-3f9f7bad7ce5, 877cb84e-86e7-47df-b252-6f92106bee03, 00eece11-b7d2-47fb-8282-75220b2bab8c, d002707c-7614-49e9-9358-51062057a480
- **Value counts:** 53d90291-1561-490d-b42f-eaceca483de1: 1, 67f9323f-8648-4024-8385-3f9f7bad7ce5: 1, 877cb84e-86e7-47df-b252-6f92106bee03: 1, 00eece11-b7d2-47fb-8282-75220b2bab8c: 1, d002707c-7614-49e9-9358-51062057a480: 1, ec032e84-5433-42f2-821a-11a3f101fcd2: 1, d36075fc-9732-4e70-b7cc-422562abc8e5: 1, 59492315-02b1-441b-9e2e-ca041d87e8ea: 1, 854b9635-2397-4a5c-af21-83d3746eba1b: 1, b1976bee-eb81-4320-af6d-de47234dae64: 1

### `try_seq`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 10
- **Min:** 0
- **Max:** 9
- **Examples:** 0, 2, 2, 5, 4

### `terminal_key`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 3
- **Examples:** T5001, T5002, T5001, T5001, T5000
- **Value counts:** T5002: 3391, T5000: 3319, T5001: 3290

### `merchant_key`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 50
- **Examples:** M1005, M1006, M1016, M1003, M1033
- **Value counts:** M1002: 232, M1005: 225, M1044: 223, M1017: 222, M1032: 222, M1028: 221, M1003: 220, M1020: 215, M1048: 213, M1034: 212

### `category_id`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 8
- **Min:** 1
- **Max:** 8
- **Examples:** 3, 5, 1, 3, 3

### `category_title`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 8
- **Examples:** سفر و گردشگری, سلولتاهای فروشگاهی, آموزش و آموزشگاه, سفر و گردشگری, سفر و گردشگری
- **Value counts:** سفر و گردشگری: 1281, خرده‌فروشی آنلاین: 1264, خدمات دیجیتال: 1256, سلولتاهای فروشگاهی: 1252, عینی و سرویسی: 1246, غذا و رستوران: 1237, آموزش و آموزشگاه: 1236, صنعتی و ساختگی: 1228

### `amount`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 10000
- **Min:** 55587
- **Max:** 49979034
- **Examples:** 5980763, 43287648, 2789345, 49393219, 46673292

### `adjusted_fee`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 9984
- **Min:** 2044
- **Max:** 2098219
- **Examples:** 212620, 1637996, 104406, 1821284, 1761643

### `session_status`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 6
- **Examples:** Paid, Verified, Failed, Paid, InBank
- **Value counts:** Verified: 4552, InBank: 2022, Failed: 1424, Paid: 1011, Reversed: 515, NoAttempt: 476

### `try_status`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 6
- **Examples:** Paid, Verified, Verified, Verified, Paid
- **Value counts:** Verified: 4442, InBank: 2025, Failed: 1566, Paid: 941, NoAttempt: 532, Reversed: 494

### `switch_response_code`
- **Type:** string
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 612
- **Examples:** PSP-711:2678, PSP-721:2219, PSP-293:1407, PSP-382:8328, PSP-200:1381
- **Value counts:** PSP-711:2678: 1, PSP-721:2219: 1, PSP-293:1407: 1, PSP-382:8328: 1, PSP-200:1381: 1, PSP-534:4637: 1, PSP-463:8682: 1, PSP-152:6821: 1, PSP-887:9582: 1, PSP-184:2928: 1

### `psp_code`
- **Type:** string
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 439
- **Examples:** PSP584, PSP798, PSP288, PSP216, PSP453
- **Value counts:** PSP669: 5, PSP958: 4, PSP446: 4, PSP453: 3, PSP140: 3, PSP317: 3, PSP882: 3, PSP364: 3, PSP875: 3, PSP961: 3

### `issuer_bank_code`
- **Type:** string
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 90
- **Examples:** BANK56, BANK32, BANK95, BANK55, BANK12
- **Value counts:** BANK43: 19, BANK13: 16, BANK55: 14, BANK66: 12, BANK68: 11, BANK72: 11, BANK22: 10, BANK38: 10, BANK93: 10, BANK44: 10

### `payer_card_key`
- **Type:** string
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 612
- **Examples:** 65a8503b-54e, 73b6c187-8d9, a173b8c6-f2f, f68138d1-a5e, 67330a34-b42
- **Value counts:** 65a8503b-54e: 1, 73b6c187-8d9: 1, a173b8c6-f2f: 1, f68138d1-a5e: 1, 67330a34-b42: 1, 4b8b07e9-504: 1, cc99248f-5b2: 1, 8114bda5-3d2: 1, 88375076-f76: 1, 7bf136bb-964: 1

### `verify_type`
- **Type:** string
- **Nulls:** 0 (0.00%)
- **Unique values:** 2
- **Examples:** Manual, Manual, Manual, Manual, Manual
- **Value counts:** Manual: 5023, Automated: 4977

### `init_time_ms`
- **Type:** float
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 534
- **Min:** 52.0
- **Max:** 1992.0
- **Examples:** 1377.0, 1448.0, 1644.0, 602.0, 342.0

### `verify_time_ms`
- **Type:** float
- **Nulls:** 9,441 (94.41%)
- **Unique values:** 482
- **Min:** 53.0
- **Max:** 2000.0
- **Examples:** 491.0, 467.0, 347.0, 920.0, 295.0

### `created_at`
- **Type:** datetime
- **Nulls:** 0 (0.00%)
- **Unique values:** 10000
- **Examples:** 2024-12-11T13:07:31.374569, 2024-05-28T20:23:08.140046, 2024-06-28T07:07:06.962604, 2024-08-28T23:11:41.001731, 2024-09-29T01:56:27.678717

### `try_created_at`
- **Type:** datetime
- **Nulls:** 9,388 (93.88%)
- **Unique values:** 612
- **Examples:** 2024-12-11T13:07:31.374569, 2024-08-27T11:15:47.345485, 2024-03-03T19:05:14.131061, 2024-02-27T05:14:49.517079, 2024-07-28T01:43:50.799312

### `verified_at`
- **Type:** datetime
- **Nulls:** 9,441 (94.41%)
- **Unique values:** 559
- **Examples:** 2024-12-11T13:29:31.374569, 2024-08-27T11:19:47.345485, 2024-03-03T19:26:14.131061, 2024-02-27T05:41:49.517079, 2024-07-28T02:07:50.799312

### `settled_at`
- **Type:** datetime
- **Nulls:** 9,898 (98.98%)
- **Unique values:** 102
- **Examples:** 2024-12-11T13:32:31.374569, 2024-07-28T02:09:50.799312, 2024-10-19T02:15:43.145261, 2024-03-10T03:44:46.038200, 2024-11-08T13:11:58.596374

### `expire_in`
- **Type:** integer
- **Nulls:** 0 (0.00%)
- **Unique values:** 1201
- **Min:** 600
- **Max:** 1800
- **Examples:** 717, 799, 1787, 680, 1049

## Column Analysis

- **Numeric columns:** try_seq, category_id, amount, adjusted_fee, init_time_ms, verify_time_ms, expire_in
- **Datetime columns:** created_at, try_created_at, verified_at, settled_at
- **Categorical/text columns:** session_key, terminal_key, merchant_key, category_title, session_status, try_status, switch_response_code, psp_code, issuer_bank_code, payer_card_key, verify_type

## Key Findings

- **Date column:** `created_at` (ISO 8601 datetime)
- **Merchant identifier:** `merchant_key`
- **Amount column:** `amount` (Rials)
- **Status column:** `session_status` with values: Paid, Verified, Failed, InBank, Reversed, NoAttempt
- **adjusted_fee:** Scaled value — relative comparisons only
- **No reliable `customer_id` column found**
- **No reliable `product_id` column found**
