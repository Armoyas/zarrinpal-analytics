# ZarrinPal Analytics Dashboard (Frontend)

Next.js 14 dashboard for ZarrinPal merchants — RTL / Persian (Vazirmatn font), mobile-first, built with shadcn/ui + Tailwind CSS.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard proxies `/api/*` to the FastAPI backend (default http://localhost:8000).

## Features

- KPI metric cards (volume, success rate, fee ratio, active days)
- Transaction trend charts (Recharts)
- Merchant ranking & peer comparison
- AI recommendation panel (actionable insights)
- Nowruz seasonal impact analysis
- Data provenance / traceability panel ("how was this calculated?")
- Responsive: desktop sidebar + mobile navigation

## Env

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`.
