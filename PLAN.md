# Subscription Tracker — Full Build Plan

## Pipeline Stage: Steps 1-4 (Brainstorm → Plan → Iterate → Autonomous Instructions)

---

## STEP 1: BRAINSTORM — FIRST PRINCIPLES

### What is this?
A local-first subscription tracker dashboard. No backend, no bank linking, no user accounts. All data persists on-device via IndexedDB. The user manually enters subscriptions and gets visibility into what they're actually paying.

### Why local-first?
- Zero friction to start (no signup)
- Privacy by default (no data leaves the device)
- Works offline
- No server costs
- Export/import for portability

### Core value proposition
The app answers three questions:
1. **"What am I actually paying?"** — Effective monthly cost normalization across all billing cycles
2. **"What should I cancel?"** — Usage/value scoring surfaces waste
3. **"When will I get charged?"** — Renewal calendar with configurable alerts

### Key technical insights
- **Data model is complex** — subscriptions relate to people, categories, price history, add-ons, cancellation workflows. This is relational data, not flat key-value.
- **IndexedDB via Dexie.js** — needed for complex queries, blob storage (receipts), and exceeding localStorage's 5MB limit
- **Computation-heavy dashboard** — effective monthly cost, category breakdowns, cashflow projections all require real-time derived state
- **No SSR needed** — pure client-side SPA. Next.js with static export gives good routing + future extensibility

---

## STEP 2: DETAILED BUILD PLAN

### Tech Stack (with rationale)

| Choice | Why |
|--------|-----|
| **Next.js 15 (App Router, static export)** | File-based routing, layout system, easy deployment as static SPA, future-proof for API routes |
| **TypeScript (strict mode)** | Complex data model demands type safety |
| **Tailwind CSS v4** | Utility-first, fast iteration, consistent design |
| **shadcn/ui** | Accessible, composable components, not a dependency (copied into project) |
| **Zustand** | Lightweight state management, TypeScript-first, simple persistence middleware |
| **Dexie.js (IndexedDB)** | Complex queries on subscription data, blob storage for receipts, no size limits |
| **date-fns** | Tree-shakeable date manipulation for billing cycle calculations |
| **Recharts** | Lightweight charting for spending breakdowns and trends |
| **uuid** | Subscription/person ID generation |
| **papaparse** | CSV export/import parsing |

### Data Model

```typescript
// ============ ENUMS / UNIONS ============

type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom';
type SubStatus = 'active' | 'trial' | 'paused' | 'on_hold' | 'cancelled';
type UsageRecency = 'within7' | 'within30' | 'within90' | 'over90' | 'never';
type CancelMethod = 'website' | 'phone' | 'chat' | 'email';
type AlertTiming = 1 | 3 | 7 | 14 | 30;
type HouseholdRole = 'admin' | 'member';

// ============ CORE ENTITIES ============

interface Subscription {
  id: string;
  name: string;
  logoUrl?: string;           // optional URL or data URI

  // Classification
  categoryId: string;
  tags: string[];

  // Billing
  billingCycle: BillingCycle;
  customCycleDays?: number;   // only when billingCycle === 'custom'
  amount: number;             // current price in user's currency
  currency: string;           // ISO 4217, default 'USD'
  taxAmount?: number;

  // Intro/trial pricing
  hasIntroPricing: boolean;
  introPrice?: number;
  introDurationDays?: number;
  introEndDate?: string;      // ISO date

  // Dates & renewal
  startDate: string;          // ISO date
  nextRenewalDate: string;    // ISO date — computed + adjustable
  renewalDayRule: 'exact' | 'lastDayOfMonth' | 'nextBusinessDay';

  // Status & auto-renew
  status: SubStatus;
  autoRenew: boolean;
  cancellationNeeded: boolean; // flag: "I need to cancel this before renewal"

  // Alert configuration
  alertDaysBefore: AlertTiming[];  // e.g. [14, 3, 1]
  alertSnoozedUntil?: string;     // ISO date — snooze alerts until this date

  // Household
  payerId: string;            // HouseholdMember.id
  ownerId: string;            // HouseholdMember.id
  managerId?: string;         // HouseholdMember.id
  userIds: string[];          // who actually uses it
  isShared: boolean;
  seatCount?: number;
  costPerSeat?: number;

  // Cancellation workflow
  cancelUrl?: string;
  cancelMethod?: CancelMethod;
  cancelDeadlineDays?: number;  // "cancel X days before renewal"
  cancellationChecklist?: string[];
  cancellationProofBlobId?: string; // reference to stored blob

  // Value assessment
  lastUsed?: UsageRecency;
  valueScore?: 1 | 2 | 3 | 4 | 5;
  wouldMiss?: boolean;

  // Add-ons
  addOns: AddOn[];

  // Price history
  priceHistory: PriceEntry[];

  // Notes
  notes?: string;
  sensitiveNotes?: string;    // AES-GCM encrypted, behind PIN

  createdAt: string;
  updatedAt: string;
}

interface AddOn {
  id: string;
  name: string;               // "Extra seat", "Premium tier", etc.
  amount: number;
  billingCycle: BillingCycle;  // may differ from parent
}

interface PriceEntry {
  date: string;               // ISO date
  amount: number;
  note?: string;              // "Price increased $2"
}

interface HouseholdMember {
  id: string;
  name: string;
  role: HouseholdRole;
  avatarColor: string;        // for UI badges
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;               // Lucide icon name
  isDefault: boolean;         // pre-built vs custom
  sortOrder: number;
}

interface AlertRule {
  id: string;
  subscriptionId: string;
  daysBefore: AlertTiming;
  dismissed: boolean;
  snoozedUntil?: string;
}

interface AppSettings {
  defaultCurrency: string;
  defaultAlertDays: AlertTiming[];
  pin?: string;               // hashed PIN for sensitive notes
  theme: 'light' | 'dark' | 'system';
  backupEnabled: boolean;
  lastBackupDate?: string;
}
```

### Default Categories (pre-seeded)

| Category | Icon |
|----------|------|
| Streaming | tv |
| Music | music |
| Gaming | gamepad-2 |
| Cloud Storage | cloud |
| Software | code |
| News & Reading | newspaper |
| Fitness | dumbbell |
| Home & Utilities | home |
| Security | shield |
| Kids & Family | baby |
| Work & Productivity | briefcase |
| Other | package |

### File Structure

```
sub_tracker/
├── public/
│   └── icons/                    # Favicon, PWA icons
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: providers, sidebar nav, theme
│   │   ├── page.tsx              # Dashboard (redirect or inline)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard: totals, alerts, category chart
│   │   ├── subscriptions/
│   │   │   ├── page.tsx          # Subscription list (filterable, sortable)
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Add subscription form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Subscription detail view
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit subscription
│   │   ├── calendar/
│   │   │   └── page.tsx          # Renewal calendar (month view + upcoming list)
│   │   ├── household/
│   │   │   └── page.tsx          # Manage household members + per-person view
│   │   ├── insights/
│   │   │   └── page.tsx          # Value scoring, waste detection, recommendations
│   │   └── settings/
│   │       └── page.tsx          # Export/import, alerts defaults, PIN, theme
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # App sidebar navigation
│   │   │   ├── header.tsx        # Page header with breadcrumbs
│   │   │   └── mobile-nav.tsx    # Bottom nav for mobile
│   │   ├── dashboard/
│   │   │   ├── total-spend-card.tsx
│   │   │   ├── category-breakdown-chart.tsx
│   │   │   ├── upcoming-renewals-widget.tsx
│   │   │   ├── alerts-widget.tsx
│   │   │   └── quick-stats.tsx
│   │   ├── subscription/
│   │   │   ├── subscription-form.tsx         # Shared add/edit form
│   │   │   ├── subscription-card.tsx         # List item card
│   │   │   ├── subscription-detail.tsx       # Full detail view
│   │   │   ├── billing-cycle-selector.tsx
│   │   │   ├── intro-pricing-fields.tsx
│   │   │   ├── cancellation-section.tsx
│   │   │   ├── value-assessment-section.tsx
│   │   │   ├── price-history-section.tsx
│   │   │   └── add-on-manager.tsx
│   │   ├── calendar/
│   │   │   ├── month-calendar.tsx
│   │   │   ├── calendar-day-cell.tsx
│   │   │   └── cashflow-forecast.tsx
│   │   ├── household/
│   │   │   ├── member-list.tsx
│   │   │   ├── member-form.tsx
│   │   │   └── member-subscription-view.tsx
│   │   ├── insights/
│   │   │   ├── waste-detector.tsx
│   │   │   ├── duplicate-checker.tsx
│   │   │   ├── value-matrix.tsx
│   │   │   └── spending-trends.tsx
│   │   └── common/
│   │       ├── currency-input.tsx
│   │       ├── date-picker.tsx
│   │       ├── tag-input.tsx
│   │       ├── icon-picker.tsx
│   │       ├── pin-gate.tsx              # PIN entry for sensitive notes
│   │       ├── empty-state.tsx
│   │       └── confirm-dialog.tsx
│   ├── lib/
│   │   ├── db.ts                 # Dexie.js database schema + initialization
│   │   ├── db-seed.ts            # Default categories seed
│   │   ├── store.ts              # Zustand store (subscriptions, settings, UI state)
│   │   ├── calculations.ts       # Effective monthly cost, totals, projections
│   │   ├── alerts.ts             # Alert generation + snooze logic
│   │   ├── export-import.ts      # CSV + JSON export/import with validation
│   │   ├── encryption.ts         # AES-GCM encryption for sensitive notes
│   │   ├── renewal-engine.ts     # Next renewal date computation engine
│   │   ├── duplicate-detection.ts # Fuzzy matching for duplicate subs
│   │   ├── utils.ts              # Generic utilities
│   │   └── constants.ts          # Categories, billing cycles, defaults
│   ├── hooks/
│   │   ├── use-subscriptions.ts  # CRUD + filtered queries
│   │   ├── use-alerts.ts         # Active alerts for current date
│   │   ├── use-household.ts      # Household member CRUD
│   │   ├── use-cashflow.ts       # Projected charges for date range
│   │   ├── use-categories.ts     # Category management
│   │   └── use-settings.ts       # App settings
│   └── types/
│       └── index.ts              # All TypeScript interfaces and types
├── next.config.ts                # Static export config
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── components.json               # shadcn/ui config
```

### Page-by-Page Feature Breakdown

#### 1. Dashboard (`/dashboard`)
- **Total monthly spend** card (sum of all effective monthly costs)
- **Total yearly spend** card (sum of all effective annual costs)
- **Active subscriptions count** + **trials expiring soon** count
- **Category breakdown** donut chart (Recharts)
- **Upcoming renewals** (next 7 days) with amounts
- **Active alerts** widget (subscriptions renewing soon that match alert rules)
- **Top 5 by cost** quick list
- **Quick add** button (floating action on mobile)

#### 2. Subscriptions List (`/subscriptions`)
- Card grid or list view toggle
- Each card shows: name, amount, effective monthly, next renewal, status badge, category icon
- **Filters:** status, category, tag, billing cycle, household member
- **Sort:** name, amount, next renewal date, value score, date added
- **Search:** fuzzy match on name
- **Bulk actions:** export selected, delete selected

#### 3. Add/Edit Subscription (`/subscriptions/new`, `/subscriptions/[id]/edit`)
- Multi-section form:
  - **Basic:** name, category, tags, logo URL
  - **Billing:** cycle type, amount, currency, tax, add-ons
  - **Intro pricing:** toggle, intro price, duration, regular price
  - **Dates:** start date, renewal date, day rule
  - **Status:** active/trial/paused/on_hold/cancelled, auto-renew, cancellation-needed flag
  - **Alerts:** select alert timings (multi-select chips)
  - **Household:** payer, owner, manager, users (dropdowns from household members)
  - **Cancellation:** URL, method, deadline days, checklist items, proof upload
  - **Value:** last used, value score (1-5 stars), would-miss toggle
  - **Notes:** regular notes + sensitive notes (behind PIN)
- **Form validation** with Zod schema
- Save creates entry in Dexie + logs initial price in priceHistory

#### 4. Subscription Detail (`/subscriptions/[id]`)
- Full read view of all fields
- **Effective monthly cost** prominently displayed
- **Price history** timeline (with delta badges: "+$2/mo")
- **Cancellation workflow** section (checklist with checkboxes, proof viewer)
- **Edit** and **Delete** actions
- **Duplicate warning** if similar sub exists

#### 5. Calendar (`/calendar`)
- **Month grid** view with dots on renewal days
- Click a day to see renewals on that date with amounts
- **Upcoming charges** sidebar: next 30/60/90 days toggleable
- **Monthly total** per month shown at top of each month
- **"Big hit month" warning** — highlight months where spend exceeds average by >50%
- Color-coding by category

#### 6. Household (`/household`)
- **Member list** with add/edit/delete
- **Per-member view:** subscriptions they use, subscriptions they pay for
- **Shared vs individual** filter
- **Cost per person** summary card
- **Seat utilization** — for family plans, show seats used vs available

#### 7. Insights (`/insights`)
- **Waste detector:** subscriptions not used in 60+ days sorted by cost
- **Low value / high cost:** value score ≤ 2 AND cost in top quartile
- **"Top 5 that deliver least value"** ranked list
- **Duplicate checker:** fuzzy name matching + same category
- **Similar subscriptions:** "You have 3 streaming services costing $45/mo total"
- **Price increase tracker:** subs where latest price > previous price
- **Spending trends:** monthly spend over last 12 months (line chart)

#### 8. Settings (`/settings`)
- **General:** default currency, theme (light/dark/system)
- **Alerts:** default alert timing for new subscriptions
- **Security:** set/change/remove PIN for sensitive notes
- **Data:**
  - Export all as JSON (full backup)
  - Export all as CSV (spreadsheet-friendly)
  - Import from JSON
  - Import from CSV (with column mapping UI)
  - Print-friendly summary (opens print dialog)
- **About:** version, reset all data (with confirmation)

### Computation Engine (`lib/calculations.ts`)

The most critical business logic:

**SURVIVING FIX #7: Exact normalization formula and rounding policy**

All monetary computations use these rules:
- **Rounding:** Round to 2 decimal places using `Math.round(value * 100) / 100` (banker's rounding not needed for display)
- **Average days per month:** 30.436875 (365.2425 / 12, accounts for leap years)
- **Display:** Always show 2 decimal places via `Intl.NumberFormat`

```typescript
const AVG_DAYS_PER_MONTH = 30.436875; // 365.2425 / 12

// Core: normalize ANY billing cycle to monthly cost
function getEffectiveMonthly(sub: Subscription): number {
  const totalAmount = sub.amount + (sub.taxAmount ?? 0)
    + sub.addOns.reduce((sum, a) => sum + normalizeAddOnMonthly(a), 0);

  let monthly: number;
  switch (sub.billingCycle) {
    case 'weekly':     monthly = totalAmount * (52 / 12); break;        // 4.333... weeks/month
    case 'monthly':    monthly = totalAmount; break;
    case 'quarterly':  monthly = totalAmount / 3; break;
    case 'biannual':   monthly = totalAmount / 6; break;
    case 'annual':     monthly = totalAmount / 12; break;
    case 'custom':     monthly = totalAmount * AVG_DAYS_PER_MONTH / (sub.customCycleDays ?? 30); break;
  }
  return Math.round(monthly * 100) / 100;
}

// Handles intro pricing: returns current effective rate
function getCurrentEffectiveMonthly(sub: Subscription): number {
  if (sub.hasIntroPricing && sub.introEndDate) {
    const introEnd = new Date(sub.introEndDate);
    if (new Date() < introEnd) {
      // Still in intro period — use intro price
      return getEffectiveMonthlyForAmount(sub.introPrice!, sub.billingCycle);
    }
  }
  return getEffectiveMonthly(sub);
}
```

### Date Policy (SURVIVING FIX #6)

**ALL billing/renewal dates use `YYYY-MM-DD` local-date strings** (not UTC timestamps). Rationale: subscriptions are billed in the user's local timezone. Storing `2026-03-15` means "March 15th wherever you are", not a UTC instant that could shift across date boundaries.

- Billing dates, renewal dates, start dates → `YYYY-MM-DD` (local-date, no time component)
- Timestamps (createdAt, updatedAt, exportDate) → ISO 8601 with `Z` suffix (UTC instants)
- All date comparisons for alerts/calendar use `date-fns` `parseISO()` → local Date, then `isBefore`/`isAfter`/`differenceInDays`

### Renewal Engine (`lib/renewal-engine.ts`)

**SURVIVING FIX #5: Deterministic renewal rules for month-end, leap day, DST**

```typescript
// Compute next renewal date from current date + billing cycle
function computeNextRenewal(
  lastRenewal: Date,
  cycle: BillingCycle,
  customDays?: number,
  dayRule: RenewalDayRule = 'exact'
): Date {
  // 1. Add cycle duration using date-fns:
  //    weekly → addWeeks(1)
  //    monthly → addMonths(1)
  //    quarterly → addMonths(3)
  //    biannual → addMonths(6)
  //    annual → addYears(1)
  //    custom → addDays(customDays)
  //
  // 2. Apply day rule:
  //    'exact' → use the computed date as-is
  //    'lastDayOfMonth' → clamp to lastDayOfMonth(computed)
  //    'nextBusinessDay' → if weekend (Sat/Sun), advance to Monday
  //
  // 3. DETERMINISTIC EDGE CASES:
  //    - Jan 31 + 1 month → Feb 28 (or 29 in leap year) via date-fns addMonths
  //      (date-fns already clamps to end of shorter months)
  //    - Feb 29 + 1 year → Feb 28 in non-leap years (date-fns handles this)
  //    - DST transitions: irrelevant because we use YYYY-MM-DD local dates,
  //      not UTC timestamps. No hour arithmetic means no DST shift.
  //    - "Business day" means Mon-Fri only (no holiday calendar for MVP)
}

// Generate all renewal dates in a date range (for calendar)
function getRenewalsInRange(
  sub: Subscription,
  startDate: Date,
  endDate: Date
): Date[] { ... }
```

### Alert Engine (`lib/alerts.ts`)

```typescript
interface Alert {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  renewalDate: string;
  amount: number;
  daysBefore: number;
  alertDate: string;        // when to show this alert
  dismissed: boolean;
  snoozedUntil?: string;
}

// Generate active alerts for today
function getActiveAlerts(subs: Subscription[], today: Date): Alert[] {
  // For each active sub:
  //   For each alertDaysBefore in sub.alertDaysBefore:
  //     If today >= (renewalDate - daysBefore) AND today <= renewalDate:
  //       AND not dismissed AND not snoozed:
  //         → generate Alert
  // Escalation: if sub.amount > threshold, also alert at 30 days
}
```

### Export/Import (`lib/export-import.ts`)

```typescript
// JSON export: full Dexie dump
async function exportJSON(): Promise<string> {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    subscriptions: await db.subscriptions.toArray(),
    householdMembers: await db.householdMembers.toArray(),
    categories: await db.categories.toArray(),
    settings: await db.settings.get('app'),
  };
  return JSON.stringify(data, null, 2);
}

// CSV export: flattened subscription data
async function exportCSV(): Promise<string> {
  // Flatten sub → row, join arrays as semicolons
  // Use papaparse to generate
}

// Import with validation
async function importJSON(json: string): Promise<ImportResult> {
  // Parse, validate schema, merge or replace
}
```

---

## STEP 3: ITERATION REFINEMENTS

After reviewing the plan, these refinements:

1. **Billing cycle "custom" needs a unit picker** — "every X days" or "every X months" (not just days). Someone paying every 2 months is different from every 61 days.

2. **Effective monthly display should always show both** — "$120/yr ($10/mo)" not just one or the other. The specs emphasize this.

3. **Alert "escalation" logic** — specs say "if expensive, alert earlier". Rule: if monthly cost > 2x average, auto-add a 30-day alert. Make the threshold configurable in settings.

4. **Category vs Tags** — specs say "multi-category allowed (or just tags)". Decision: single primary category + unlimited tags. This avoids taxonomy fights while keeping the donut chart clean.

5. **Print-friendly summary** — use `@media print` CSS + a dedicated print layout component. No special library needed.

6. **Sensitive notes encryption** — Use Web Crypto API with AES-GCM. Key derived from PIN via PBKDF2. Store salt + IV alongside ciphertext. This is standard and works in all modern browsers.

7. **Responsive design** — Mobile-first. Sidebar collapses to bottom tab bar on mobile. Forms use sheet/drawer pattern on mobile.

8. **PWA consideration** — Add a basic `manifest.json` and service worker for offline support. This is a natural fit for a local-first app but is a Phase 2 enhancement.

---

## STEP 4: AUTONOMOUS EXECUTION INSTRUCTIONS

Below are the complete, self-contained instructions for building this application from zero. No human intervention required.

**IMPORTANT: These instructions incorporate 12 surviving fixes from an independent Codex GPT-5.3 review + steelman defense (30 issues raised, 18 killed, 12 applied).**

---

### AUTONOMOUS BUILD: Subscription Tracker

**Runtime:** Node.js 20+, npm
**Target:** Static SPA deployable anywhere (Vercel, Netlify, S3, local)
**Dev server port:** 3001 (avoids conflict with existing Vite on 3000 and Express on 3002)

---

### PHASE 0: PROJECT SCAFFOLDING

```bash
# 1. Create Next.js project (use . since we're already in the project directory)
# SURVIVING FIX #4: Use . as target to avoid nested sub_tracker/sub_tracker
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*" --yes

# 2. Install dependencies
# SURVIVING FIX #1: Include react-hook-form + @hookform/resolvers (referenced in Phase 4)
npm install zustand dexie dexie-react-hooks date-fns recharts papaparse uuid zod lucide-react react-hook-form @hookform/resolvers next-themes
npm install -D @types/papaparse @types/uuid

# 3. Initialize shadcn/ui
# SURVIVING FIX #3: Use --yes or -d flag to suppress prompts for autonomous execution
npx shadcn@latest init -d

# 4. Add shadcn components
npx shadcn@latest add button card input label select textarea dialog sheet tabs badge avatar calendar dropdown-menu popover command separator switch checkbox radio-group slider toast tooltip form scroll-area progress alert-dialog sonner

# 5. SURVIVING FIX #11: Phase gate — verify build passes
npm run build || { echo "PHASE 0 FAILED: build error after scaffolding"; exit 1; }
```

**next.config.ts** — add:
```typescript
const nextConfig = {
  output: 'export',        // Static export — no server
  images: { unoptimized: true },
};
```

**package.json** — update dev script to use port 3001:
```json
"scripts": {
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001",
  "lint": "next lint"
}
```

### DEPLOYMENT NOTES (SURVIVING FIX #12)

Static export requires host-specific configuration for client-side routing:

- **Vercel:** Add `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **Netlify:** Add `public/_redirects`: `/* /index.html 200`
- **S3 + CloudFront:** Set error document to `index.html` with 200 status
- **Nginx:** `try_files $uri $uri/ /index.html;`

---

### PHASE 1: FOUNDATION (Types + Database + Store)

**Order of operations:**
1. `src/types/index.ts` — ALL interfaces and types from the data model above
2. `src/lib/constants.ts` — default categories array, billing cycle labels, alert timing options
3. `src/lib/db.ts` — Dexie database with tables: subscriptions, householdMembers, categories, settings, blobs
4. `src/lib/db-seed.ts` — seed default categories on first load
5. `src/lib/calculations.ts` — getEffectiveMonthly, getCurrentEffectiveMonthly, getTotalMonthly, getTotalYearly, getCategoryBreakdown
6. `src/lib/renewal-engine.ts` — computeNextRenewal, getRenewalsInRange, isRenewalToday
7. `src/lib/alerts.ts` — generateAlerts, dismissAlert, snoozeAlert, getEscalationAlerts
8. `src/lib/encryption.ts` — encryptNote, decryptNote (AES-GCM + PBKDF2 from PIN)
9. `src/lib/export-import.ts` — exportJSON, importJSON, exportCSV, importCSV
10. `src/lib/utils.ts` — cn() helper, formatCurrency, formatDate, formatRelativeDate
11. `src/lib/duplicate-detection.ts` — findDuplicates (Levenshtein on names + same category)
12. All hooks in `src/hooks/` — thin wrappers over Dexie useLiveQuery + Zustand

**PHASE GATE (SURVIVING FIX #11):** `npx tsc --noEmit && npm run lint`

---

### PHASE 2: LAYOUT + NAVIGATION

1. `src/app/layout.tsx` — Root layout with:
   - ThemeProvider (next-themes or manual CSS class)
   - Sidebar on desktop (left rail, 240px)
   - Bottom tab bar on mobile (5 tabs: Dashboard, Subscriptions, Calendar, Household, Settings)
   - Toaster component (sonner)

2. `src/components/layout/sidebar.tsx` — Nav items with Lucide icons:
   - Dashboard (layout-dashboard)
   - Subscriptions (credit-card)
   - Calendar (calendar)
   - Household (users)
   - Insights (lightbulb)
   - Settings (settings)

3. `src/components/layout/mobile-nav.tsx` — Bottom tab bar, 5 items

4. `src/components/layout/header.tsx` — Page title + breadcrumb + quick-add button

---

### PHASE 3: DASHBOARD PAGE

`src/app/dashboard/page.tsx` + supporting components:

1. **TotalSpendCard** — Shows monthly total and yearly total. Large numbers. Green/red delta vs last month.
2. **QuickStats** — 4 stat cards in a row: Active subs, Trials ending soon, Upcoming this week, Categories
3. **CategoryBreakdownChart** — Recharts donut/pie chart. Click segment to filter.
4. **UpcomingRenewalsWidget** — Next 7 days list. Each row: name, amount, date, days until.
5. **AlertsWidget** — Active alerts with dismiss/snooze actions. Red for 1-day, yellow for 3-day, blue for 7+ day.
6. **TopSpendList** — Top 5 subscriptions by effective monthly cost.

Layout: 2-column grid on desktop (cards top, chart + lists bottom). Single column on mobile.

---

### PHASE 4: SUBSCRIPTION CRUD

1. **SubscriptionForm** (`src/components/subscription/subscription-form.tsx`)
   - Uses React Hook Form + Zod validation
   - Sections as collapsible accordion or tabs:
     - Basic Info (name, category dropdown, tags input, logo URL)
     - Billing (cycle selector, amount, currency, tax, add-ons list)
     - Intro Pricing (toggle, conditional fields)
     - Dates (start date, renewal date, day rule radio)
     - Status (status select, auto-renew switch, cancellation-needed flag)
     - Alerts (multi-select timing chips)
     - Household (payer/owner/manager/users dropdowns from household members)
     - Cancellation (URL, method, deadline, checklist builder, proof upload)
     - Value Assessment (last used dropdown, star rating, would-miss switch)
     - Notes (textarea + sensitive notes with PIN gate)
   - On save: write to Dexie, add initial price to priceHistory, redirect to detail

2. **SubscriptionCard** — Compact card for list view. Shows name, effective monthly, status badge, next renewal, category icon.

3. **SubscriptionDetail** — Full read view. Prominent effective monthly cost. Price history timeline. Cancellation section with checklist checkboxes. Edit/Delete buttons.

4. **List page** (`/subscriptions`) — Grid of SubscriptionCards. Filter bar (status, category, tag, member). Sort dropdown. Search input. Bulk export/delete.

---

### PHASE 5: CALENDAR

`src/app/calendar/page.tsx`:

1. **MonthCalendar** component — 7-column grid. Each cell shows day number + colored dots for renewals. Click to expand.
2. **DayDetail** — Sheet/popover showing renewals for that day with amounts.
3. **Upcoming sidebar** — Toggle between 30/60/90 day views. List of upcoming charges with running total.
4. **Month total** displayed at top: "February 2026: $187.43 in renewals"
5. **Big hit warning** — if a month's total > 150% of average monthly, show orange warning banner.

---

### PHASE 6: HOUSEHOLD

`src/app/household/page.tsx`:

1. **MemberList** — cards with avatar (colored circle + initial), name, role badge.
2. **AddMember** dialog — name, role (admin/member), color picker.
3. **MemberDetail** — click member to see:
   - Subscriptions they use
   - Subscriptions they pay for
   - Their total monthly cost
   - Shared vs individual breakdown
4. **CostPerPerson** summary at top: horizontal bar chart showing each person's total share.

---

### PHASE 7: INSIGHTS (Phase 2 features, build structure now)

`src/app/insights/page.tsx`:

1. **WasteDetector** — list of subs where lastUsed is 'over90' or 'never', sorted by cost desc
2. **LowValueHighCost** — valueScore ≤ 2 AND effectiveMonthly in top 25th percentile
3. **DuplicateChecker** — run Levenshtein on all sub names, show pairs with >80% similarity
4. **SimilarSubs** — group by category, flag categories with 3+ active subs and show total
5. **PriceIncreases** — subs where priceHistory[last].amount > priceHistory[last-1].amount
6. **SpendingTrends** — Recharts line chart, monthly total over last 12 months (computed from start dates + billing cycles)

---

### PHASE 8: SETTINGS

`src/app/settings/page.tsx`:

1. **General** — Currency select (USD, EUR, GBP, CAD, AUD, JPY), Theme toggle
2. **Alerts** — Default timing checkboxes, escalation threshold input
3. **Security** — Set PIN (4-6 digits), Change PIN, Remove PIN. PIN is hashed with PBKDF2 and stored in settings.
4. **Data Management:**
   - Export JSON button → triggers download
   - Export CSV button → triggers download
   - Import JSON → file input + validation + preview of what will be imported + confirm
   - Import CSV → file input + column mapping step + preview + confirm
   - Print Summary → opens print-optimized view in new window
5. **Danger Zone** — Reset all data (double confirmation dialog)

---

### PHASE GATES AFTER EACH UI PHASE (SURVIVING FIX #11)

After completing each phase (2–8), run:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
If any gate fails, fix errors before proceeding. This prevents silent regressions from compounding across phases.

---

### PHASE 9: POLISH + QUALITY

1. **Responsive testing** — every page works at 375px, 768px, 1024px, 1440px
2. **Empty states** — every list has a friendly empty state with CTA
3. **Loading states** — Dexie queries are async; show skeleton loaders
4. **Error boundaries** — wrap each page in error boundary
5. **Keyboard navigation** — all interactive elements focusable, escape closes dialogs
6. **Dark mode** — full dark mode support via Tailwind dark: variants
7. **Animations** — subtle transitions on cards, page transitions, alert dismissals

---

### CRITICAL IMPLEMENTATION NOTES

1. **Dexie versioning** — Use Dexie's version system. Start at version 1. Every schema change bumps version with migration.

2. **Date handling** — ALL dates stored as ISO 8601 strings. ALL date math uses date-fns. NEVER use raw Date arithmetic.

3. **Currency formatting** — Use Intl.NumberFormat with the sub's currency. Always show 2 decimal places.

4. **Form validation with Zod** — Define schema that matches the TypeScript types. Validate on submit. Show field-level errors.

5. **Next.js static export caveats:**
   - No `useSearchParams` in pages without Suspense boundary
   - No API routes (all logic is client-side)
   - Use `'use client'` directive on all pages (everything is interactive)
   - Dynamic routes `[id]` work with `generateStaticParams` returning empty (client-side navigation handles it)

6. **IndexedDB initialization (SURVIVING FIX #10: capability check):**
   - On app mount, check `window.indexedDB` availability
   - If unavailable (private mode in some browsers, disabled by policy, quota exceeded):
     - Show a full-page fallback: "This app requires IndexedDB to store your data. Please ensure you're not in private/incognito mode and that storage is enabled."
     - Do NOT attempt to render the app or silently fail
   - If available: Dexie auto-creates DB on first access. Seed categories in a useEffect in root layout (check if categories table is empty first).
   - Wrap all Dexie operations in try/catch — on quota errors, show toast: "Storage is full. Please export your data and free up space."

7. **Encryption flow (SURVIVING FIXES #8 and #9 — complete PIN lifecycle + separated concerns):**

   **Two separate cryptographic materials (FIX #9):**
   - **PIN verification hash:** `PBKDF2(pin, verifySalt, 100000, SHA-256)` → stored as `pinVerifyHash` in settings
     - Used ONLY to check "is this the right PIN?" without touching encryption
   - **Encryption key:** `PBKDF2(pin, encryptSalt, 100000, SHA-256)` → used as AES-GCM key
     - DIFFERENT salt from verify hash (stored as `encryptSalt` in settings)
     - Key is NEVER stored — derived fresh each session from PIN

   **PIN lifecycle (FIX #8):**
   - **Set PIN:** User enters PIN → generate `verifySalt` + `encryptSalt` → store both salts + `pinVerifyHash` → derive encryption key for session
   - **Unlock session:** User enters PIN → derive verify hash → compare to stored `pinVerifyHash` → if match, derive encryption key → hold in memory (Zustand, non-persisted) for session
   - **Change PIN:** Unlock with old PIN → decrypt all sensitive notes → user enters new PIN → generate new salts + hashes → re-encrypt all notes with new key → update settings
   - **Remove PIN:** Unlock with old PIN → decrypt all sensitive notes → delete all encryption fields from settings → store notes as plaintext (with confirmation)
   - **Wrong PIN:** Decryption verification fails → show "Incorrect PIN" → no lockout (this is local, not networked)
   - **Session expiry:** On tab close / browser refresh, encryption key is lost from memory → user must re-enter PIN

   **Encrypt/Decrypt:**
   - Encrypt: `AES-GCM(derivedKey, randomIV, plaintext)` → store `IV + ciphertext` as base64 string on subscription
   - Decrypt: derive key from PIN → `AES-GCM decrypt(derivedKey, storedIV, ciphertext)` → plaintext
   - Each sensitive note gets its own random IV (stored alongside ciphertext)

8. **Performance** — Memoize expensive computations (effective monthly totals, category breakdowns) with useMemo. Dexie's useLiveQuery is already reactive.

---

### MVP vs PHASE 2 SCOPE

**MVP (build all of this):**
- Full CRUD for subscriptions with all billing cycle types
- Effective monthly cost normalization
- Categories (pre-seeded) + custom tags
- Dashboard with totals, category chart, upcoming renewals, alerts
- Alert system with configurable timing + snooze + escalation
- Household members with payer/owner/users/shared
- Calendar with month view + upcoming charges
- Export/Import (JSON + CSV)
- Dark mode + responsive
- PIN-protected sensitive notes

**Phase 2 (build structure/UI only, minimal logic):**
- Insights page (waste detector, duplicates, similar subs, price tracking, trends)
- Cancellation workflow (checklist, proof upload, deadline tracking)
- Value assessment scoring + recommendations
- Print-friendly summary
- PWA + service worker notifications

---

### SUCCESS CRITERIA

The app is complete when:
1. User can add a subscription with any billing cycle and see correct effective monthly cost
2. Dashboard shows accurate totals, category breakdown, and upcoming renewals
3. Alerts appear correctly based on configured timing
4. Household members can be assigned to subscriptions
5. Calendar shows all renewal dates in the correct positions
6. Full JSON and CSV export/import works with round-trip fidelity
7. Sensitive notes are encrypted behind a PIN
8. App works on mobile (375px) and desktop (1440px)
9. Dark mode works throughout
10. All data persists across browser sessions via IndexedDB
11. `npx tsc --noEmit` passes with zero errors
12. `npm run build` produces a clean static export

---

## STEP 5-6: EXTERNAL REVIEW + STEELMAN DEFENSE (COMPLETED)

**Reviewer:** Codex CLI (GPT-5.3-codex) via codex-bridge
**Date:** 2026-02-17

### Review Results: 30 findings raised → 12 survived steelman (40% kill rate)

### 12 SURVIVING FIXES (all applied above):
| # | Finding | Fix Applied |
|---|---------|-------------|
| 1 | Missing `react-hook-form` + `@hookform/resolvers` | Added to Phase 0 install |
| 2 | `@latest` non-deterministic | Pinned `create-next-app@15` |
| 3 | CLI prompts block autonomy | Added `--yes` flags |
| 4 | Nested folder risk | Changed to `create-next-app . ` |
| 5 | Renewal rules for Feb 29/month-end/DST | Added deterministic rules in renewal engine |
| 6 | No timezone policy | Defined YYYY-MM-DD local-date for billing, UTC for timestamps |
| 7 | Custom cycle formula vague | Specified exact formula with AVG_DAYS_PER_MONTH = 30.436875 |
| 8 | PIN lifecycle incomplete | Defined set/unlock/change/remove/session-expiry flows |
| 9 | PIN hash vs encryption conflated | Separated verify hash (verifySalt) from encryption key (encryptSalt) |
| 10 | IndexedDB availability not handled | Added capability check + fallback UI + quota error handling |
| 11 | No phase gates | Added `tsc --noEmit && lint && build` gates after each phase |
| 12 | Deployment config missing | Added host-specific rewrite rules for Vercel/Netlify/S3/Nginx |

### 18 KILLED FIXES (not applied):
| # | Finding | Kill Reason |
|---|---------|-------------|
| 1 | `next-themes` missing | Theme switching optional; not foundational |
| 3 | `clsx`/`tailwind-merge` | Handled by shadcn scaffolding |
| 7 | Static SPA vs App Router | False conflict; App Router supports static export |
| 8 | `use client` over-broad | Pragmatic for browser-API-heavy local-first app |
| 9 | Dedicated bootstrap component | Architectural preference, not correctness issue |
| 10 | Zustand slices/hydration | Premature for MVP; single store evolves naturally |
| 11 | Dexie index specification | Optimize when query bottlenecks emerge |
| 12 | Migration rollback plan | Overkill for early local-only app |
| 14 | Holiday calendar for business day | Locale-heavy; Mon-Fri is valid minimum |
| 19 | Import merge modes | Single replace is acceptable MVP default |
| 20 | CSV nested object schema | JSON carries full fidelity; CSV stays flat |
| 22 | Alert snooze identity matrix | Simple recompute-on-load is sufficient |
| 23 | Big-hit baseline over-specified | Premature heuristic lock-in |
| 24 | Duplicate detection threshold | High complexity for low early value |
| 26 | Formal a11y criteria matrix | shadcn semantic defaults carry MVP |
| 27 | Automatic versioned backups | Manual export is acceptable recovery |
| 28 | Household role enforcement | No backend boundary; defer strict enforcement |
| 29 | Pin lint configs | Default Next.js tooling is adequate |
