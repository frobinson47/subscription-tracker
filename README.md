# Subscription Tracker

A local-first subscription management app that puts all your recurring charges in one place. No bank linking, no permissions — just add your subscriptions manually and stay on top of what you're paying for.

## Features

- **Dashboard** — Monthly/yearly totals, category breakdown chart, upcoming renewals, and renewal alerts
- **Subscription Management** — Full CRUD with logo uploads, billing cycles (weekly through custom), intro/trial pricing, add-ons, price history tracking, and value assessments
- **Renewal Calendar** — Month grid with category-colored dots, gridlines, day detail view, and big-hit month warnings when spending spikes
- **Household** — Track family members with avatar uploads, see per-person costs, assign payer/owner/user roles to each subscription
- **Insights** — Waste detector (low-value + high-cost subs), duplicate detection via Levenshtein distance, category overlap analysis, price increase tracking
- **Alerts** — Configurable timing (1/3/7/14/30 days before renewal), escalation for expensive subscriptions, snooze and dismiss
- **Security** — Optional PIN to encrypt sensitive notes (AES-GCM via Web Crypto API)
- **Data Portability** — Full JSON backup/restore and CSV export/import
- **Theming** — Light, dark, and system themes

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Storage:** Dexie.js (IndexedDB) — all data stays in your browser
- **State:** Zustand (UI state), React Hook Form + Zod (forms)
- **Charts:** Recharts
- **Date Math:** date-fns
- **Encryption:** Web Crypto API (PBKDF2 + AES-GCM)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server (port 3001, Turbopack)
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── dashboard/          # Main dashboard
│   ├── subscriptions/      # List, add, edit, detail views
│   ├── calendar/           # Renewal calendar
│   ├── household/          # Family member management
│   ├── insights/           # Waste detection & analytics
│   └── settings/           # Preferences, security, data management
├── components/
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Sidebar, mobile nav, header
│   ├── subscription/       # Card, detail, form components
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # Custom React hooks (CRUD, alerts, cashflow)
├── lib/                    # Business logic
│   ├── calculations.ts     # Cost normalization & formatting
│   ├── renewal-engine.ts   # Billing cycle math & cashflow projection
│   ├── alerts.ts           # Alert generation & escalation
│   ├── encryption.ts       # PIN-based note encryption
│   ├── db.ts               # Dexie database schema
│   └── export-import.ts    # JSON/CSV data portability
└── types/                  # TypeScript interfaces
```

## Privacy

All data is stored locally in your browser's IndexedDB. Nothing is sent to any server. Sensitive notes can be encrypted with a PIN that never leaves your device.

## License

MIT
