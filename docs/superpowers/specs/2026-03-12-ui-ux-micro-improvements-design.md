# UI/UX Micro-Improvements Design Spec

**Date:** 2026-03-12
**Brand:** Sub Tracker — Cream + Orange, Premium
**Status:** Approved

---

## Overview

Five UI/UX micro-improvements to polish the Sub Tracker app: rich animations via Framer Motion, drag-and-drop reordering, illustrated empty states, logo auto-suggest, and expanded keyboard shortcuts.

---

## 1. Framer Motion Foundation & Page Transitions

**Dependency:** `framer-motion` >= 11.15 (new, ~30KB gzipped). Requires v11.15+ for React 19 compatibility. Run smoke test after install to verify AnimatePresence and Reorder work correctly.

### Page Transitions
- Each page wraps its content in `motion-page.tsx` — animation is per-page, not at the layout level
- `motion-page.tsx` internally uses `AnimatePresence` with `mode="wait"` and keys by `usePathname()`
- Note: Next.js App Router does not unmount layouts on navigation, so `AnimatePresence` at the layout level would not detect route changes. The animation must live inside each page component.
  - Enter: opacity 0→1, y 8→0, 200ms ease-out
  - Exit: opacity 1→0, 100ms

### Card Hover States
- `subscription-card.tsx`: `whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(68,46,20,0.10)" }}` with spring physics

### Staggered List Entry
- Subscription grid uses `staggerChildren: 0.04`, capped at the first 12 items (items beyond 12 appear instantly to avoid 2+ second delays with large datasets)

### Number Counters (Dashboard)
- Monthly total and subscription count animate from 0 to actual value on mount
- Uses `useMotionValue` + `useTransform` + `animate`

### Modal/Dialog Spring
- Override shadcn Dialog default animation with Framer Motion spring (damping: 25, stiffness: 300)

### Toast
- Sonner already animates — no changes needed

---

## 2. Drag-and-Drop Reordering

Uses Framer Motion's built-in `Reorder` component — no additional DnD library.

### Subscription List (`/subscriptions`)
- When "Custom" sort is active, the grid switches to a single-column list layout to enable clean vertical drag-and-drop. `Reorder.Group` with `axis="y"` wraps the list.
- Each card becomes a `Reorder.Item` with layout animation
- New "Custom" sort option in the sort dropdown
  - Auto-selected when user drags
  - Drag handles hidden when any other sort is active (Name, Amount, Renewal, Added)
  - Grid view (multi-column) is used for all other sort modes; single-column list view for Custom
- Persist custom order as `string[]` (subscription IDs) in new Dexie table
- Note: Framer Motion's `Reorder` works best on a single axis. Multi-column grid drag is intentionally avoided.

### Dashboard Cards (`/dashboard`)
- Stat cards (total monthly, active count, upcoming renewals) become `Reorder.Item`s
- Category breakdown cards also reorderable
- Persist layout order separately

### Persistence
- New Dexie table: `userPreferences`
  - Schema: `key` (primary), `value` (JSON)
  - Keys: `subscription-order`, `dashboard-order`
  - DB version bump required (v3)

### Visual Feedback
- Dragged item: scale 1.02, elevated shadow, slight opacity reduction on the vacated space
- Siblings: smooth spring-based layout shift
- Cursor: `grab` on hover, `grabbing` while active

---

## 3. Illustrated Empty States

### Shared Component
- New `src/components/ui/empty-state.tsx`
- Props: `illustration` (ReactNode), `title` (string), `description` (string), `primaryAction` ({ label, onClick }), `secondaryAction?` ({ label, onClick })
- Framer Motion fade-in on mount
- CSS-only illustrations using positioned divs with brand colors (cream `#FAF1D6`, `#FDEAD7`, orange `#EC6C27`)

### Per-Page Empty States

| Page | Illustration | Title | Description | Primary CTA | Secondary CTA |
|------|-------------|-------|-------------|-------------|---------------|
| `/subscriptions` | Stacked cards | Start tracking your subscriptions | See where your money goes each month | Add Subscription | Import CSV |
| `/dashboard` | Flat mini-chart bars | Your dashboard is waiting | Add subscriptions to see spending analytics | Add Your First Subscription | — |
| `/calendar` | Empty calendar grid | No renewals to show | Add subscriptions with renewal dates to see them here | Add Subscription | — |
| `/household` | People silhouettes | Track who uses what | Add household members to see shared costs | Add Member | — |
| `/insights` | Magnifying glass | Need more data | Add a few subscriptions and we'll surface trends | Add Subscription | — |

### Design Notes
- Illustrations use only brand palette (cream, orange, neutral)
- No external images or SVG files — pure CSS positioned elements
- Each illustration ~80-100px tall, centered above text
- CTA buttons use existing shadcn Button component with `variant="default"` (primary) and `variant="secondary"`
- The illustrated empty state replaces only the "no data at all" case. The existing "no subscriptions match your filters" message for filtered-but-empty results remains as-is (simple text, no illustration)

---

## 4. Logo Auto-Suggest on Name Input

### Behavior
- Triggers after 2+ characters typed in the subscription name field
- Shows up to 5 matching brands in a dropdown below the input
- Each suggestion shows: `BrandLogo` (colored circle + initials, 24px) + brand name
- Clicking a suggestion fills the name field; brand logo renders immediately in any preview
- Matching priority: starts-with first, then substring match
- Dismiss: Esc key or click outside
- No external API calls — matches against existing `BRAND_LOGOS` map (~85 entries)

### Accessibility
- Dropdown uses `role="listbox"` with `role="option"` on each item
- Arrow-key navigation (up/down) through suggestions
- Screen reader announcement of result count (e.g., "5 suggestions available")
- Active/selected item indicated via `aria-selected`

### New Files
- `src/components/subscription/brand-suggest.tsx` — dropdown component anchored to name input

### Modified Files
- `src/lib/brand-logos.ts` — export new `searchBrands(query: string): BrandMatch[]` utility
  - Returns: `{ name: string; slug: string; color: string }[]`
  - Max 5 results, sorted by match quality (starts-with > substring)
- `src/components/subscription/subscription-form.tsx` — wrap name `FormField` with brand suggest

---

## 5. Keyboard Shortcuts

### New Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `/` | Focus search input on subscriptions page (navigates there if on another page) | Global |
| `d` | Navigate to dashboard (simpler alt to `g+d`) | Global |
| `Esc` | Close open dialog/sheet/popover | When overlay is open |
| `?` | Toggle keyboard shortcut help overlay | Global |

### Shortcut Help Overlay
- New `src/components/layout/shortcut-help.tsx`
- Lightweight modal with grouped shortcut table:
  - **Navigation**: `g+d` Dashboard, `g+s` Subscriptions, `g+c` Calendar, `g+h` Household, `g+i` Insights, `g+x` Settings, `d` Dashboard, `/` Search
  - **Actions**: `n` New Subscription, `Ctrl+K` Command Palette, `?` This Help
- Toggle with `?`, dismiss with `?` again or `Esc`

### Implementation
- Add to existing `useEffect` keyboard listener in `command-palette.tsx`
- Same guard: ignored when focus is in input/textarea/select/contentEditable

### Shortcut Conflict Guards
- **`d` key**: Must check that `pendingGRef.current` is false before firing, to avoid double-firing with the existing `g+d` chord sequence
- **`/` key**: Must call `e.preventDefault()` to suppress Firefox quick-find and other browser default behaviors
- **`?` key**: Must also check that the command palette is not open (`!open` state), so typing `?` into the command palette search works normally

---

## New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `framer-motion` | Animations, page transitions, drag-and-drop reorder | ~30KB gzipped |

No other new dependencies.

---

## New Files Summary

| File | Purpose |
|------|---------|
| `src/components/ui/motion-page.tsx` | Reusable animated page wrapper |
| `src/components/ui/empty-state.tsx` | Shared empty state component |
| `src/components/subscription/brand-suggest.tsx` | Logo auto-suggest dropdown |
| `src/components/layout/shortcut-help.tsx` | Keyboard shortcut help overlay |

## Modified Files Summary

| File | Changes |
|------|---------|
| `package.json` | Add `framer-motion` |
| `src/lib/db.ts` | Add `userPreferences` table, bump to v3 |
| `src/lib/brand-logos.ts` | Export `searchBrands()` utility |
| `src/app/client-layout.tsx` | (no AnimatePresence needed — animation is per-page) |
| `src/app/subscriptions/page.tsx` | Reorder.Group, empty state, staggered entry |
| `src/app/dashboard/page.tsx` | Reorder.Group, empty state, number counters |
| `src/app/calendar/page.tsx` | Empty state |
| `src/app/household/page.tsx` | Empty state |
| `src/app/insights/page.tsx` | Empty state |
| `src/components/subscription/subscription-card.tsx` | Reorder.Item, hover animation |
| `src/components/subscription/subscription-form.tsx` | Brand suggest integration |
| `src/components/layout/command-palette.tsx` | New shortcuts (/, d, ?, Esc) |

---

## Dexie Schema Change

```typescript
// v3 migration — MUST include ALL existing tables to avoid dropping them
db.version(3).stores({
  subscriptions: 'id, name, categoryId, status, nextRenewalDate, payerId, ownerId',
  householdMembers: 'id, name',
  categories: 'id, name, sortOrder',
  settings: 'id',
  alertRecords: 'id, subscriptionId, renewalDate',
  userPreferences: 'key'  // NEW
});
```

---

## Out of Scope

- External logo API (Clearbit, Google Favicons)
- Vim-style j/k list navigation
- Drag-and-drop on household page
- SVG/image-based empty state illustrations (CSS-only)
