# UI/UX Micro-Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox syntax for tracking.

**Goal:** Add rich animations, drag-and-drop reordering, illustrated empty states, logo auto-suggest, and keyboard shortcuts to the Sub Tracker app.

**Architecture:** Framer Motion provides the animation/reorder backbone. A new `userPreferences` Dexie table persists custom ordering. All new UI components are self-contained and integrate into existing pages via targeted modifications.

**Tech Stack:** Next.js 15, React 19, Framer Motion >= 11.15, Tailwind CSS v4, shadcn/ui, Dexie, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-12-ui-ux-micro-improvements-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/ui/motion-page.tsx` | Animated page wrapper (AnimatePresence per-page) |
| `src/components/ui/animated-number.tsx` | Counter animation component for dashboard |
| `src/components/ui/empty-state.tsx` | Shared empty state with illustration + CTAs |
| `src/components/ui/illustrations.tsx` | CSS-only illustrations for all empty states |
| `src/components/subscription/brand-suggest.tsx` | Combobox dropdown for brand name auto-suggest |
| `src/components/layout/shortcut-help.tsx` | Keyboard shortcut help overlay modal |
| `src/hooks/use-user-preferences.ts` | Hook for reading/writing userPreferences table |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add framer-motion |
| `src/types/index.ts` | Add UserPreference interface |
| `src/lib/db.ts` | Add userPreferences table, v3 schema |
| `src/lib/brand-logos.ts` | Export searchBrands() utility |
| `src/app/subscriptions/page.tsx` | MotionPage, staggered grid, Reorder, empty state |
| `src/app/dashboard/page.tsx` | MotionPage, Reorder, empty state, animated numbers |
| `src/app/calendar/page.tsx` | MotionPage, empty state |
| `src/app/household/page.tsx` | MotionPage, empty state |
| `src/app/insights/page.tsx` | MotionPage, empty state |
| `src/app/settings/page.tsx` | MotionPage |
| `src/components/subscription/subscription-card.tsx` | motion hover, disableLink prop |
| `src/components/subscription/subscription-form.tsx` | BrandSuggest integration |
| `src/components/dashboard/total-spend-card.tsx` | AnimatedNumber |
| `src/components/dashboard/quick-stats.tsx` | AnimatedNumber |
| `src/components/layout/command-palette.tsx` | New shortcuts, ShortcutHelp |

---

## Chunk 1: Foundation -- Framer Motion + DB + Animations

### Task 1: Install Framer Motion

**Files:** Modify: `package.json`

- [ ] Step 1: Run `npm install framer-motion@latest`
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git add package.json package-lock.json && git commit -m "chore: add framer-motion dependency"`

### Task 2: Add userPreferences Dexie table

**Files:** Modify: `src/lib/db.ts:1-42`, `src/types/index.ts`

- [ ] Step 1: Add to `src/types/index.ts`: `export interface UserPreference { key: string; value: unknown; }`
- [ ] Step 2: In `src/lib/db.ts` -- import UserPreference, add `userPreferences!: EntityTable<UserPreference, 'key'>`, add v3 schema including ALL existing tables plus `userPreferences: 'key'`
- [ ] Step 3: Verify build: `npm run build`
- [ ] Step 4: Commit: `git add src/lib/db.ts src/types/index.ts && git commit -m "feat: add userPreferences Dexie table (v3 schema)"`

### Task 3: Create MotionPage wrapper

**Files:** Create: `src/components/ui/motion-page.tsx`

- [ ] Step 1: Create component -- uses AnimatePresence with mode="wait", motion.div keyed by usePathname(), enter: opacity 0->1 y 8->0 200ms easeOut, exit: opacity 1->0 100ms
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git add src/components/ui/motion-page.tsx && git commit -m "feat: add MotionPage animated page wrapper"`

### Task 4: Wrap all pages with MotionPage

**Files:** Modify: all 6 page files (subscriptions, dashboard, calendar, household, insights, settings)

- [ ] Step 1: In each page, import MotionPage and wrap return content in `<MotionPage>...</MotionPage>`
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git add src/app/subscriptions/page.tsx src/app/dashboard/page.tsx src/app/calendar/page.tsx src/app/household/page.tsx src/app/insights/page.tsx src/app/settings/page.tsx && git commit -m "feat: add page transition animations to all routes"`

### Task 5: Card hover animation

**Files:** Modify: `src/components/subscription/subscription-card.tsx:1-72`

- [ ] Step 1: Import motion from framer-motion. Wrap Card in `motion.div` with `whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(68,46,20,0.10)' }}` and `transition={{ type: 'spring', stiffness: 300, damping: 25 }}`. Remove old `hover:shadow-md transition-shadow` classes.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add spring hover animation to subscription cards"`

### Task 5b: Modal/Dialog spring animation override

**Files:** Modify: `src/app/globals.css`

- [ ] Step 1: Override the default shadcn Dialog animation with custom spring-like CSS. In `src/app/globals.css`, add after the `@layer base` block a new override for the Dialog content animation. Since shadcn Dialogs use Radix which applies data-state attributes, override with smoother timing:

```css
@layer base {
  /* ... existing ... */

  [data-state="open"][role="dialog"] {
    animation: dialog-in 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }
  [data-state="closed"][role="dialog"] {
    animation: dialog-out 0.15s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.95) translateY(4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes dialog-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.95) translateY(4px); }
}
```

Note: Uses CSS cubic-bezier approximation of spring (damping 25, stiffness 300) rather than wrapping every Dialog with Framer Motion, keeping the change non-invasive.

- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add spring-like dialog animation override"`

### Task 6: Staggered list entry

**Files:** Modify: `src/app/subscriptions/page.tsx:111-121`

- [ ] Step 1: Replace grid div with motion.div using staggerChildren: 0.04. Each card in motion.div with variants hidden/visible. Cap stagger at first 12 items (index >= 12 gets duration: 0).
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add staggered entry animation for subscription cards"`

### Task 7: Animated number counters

**Files:** Create: `src/components/ui/animated-number.tsx`, Modify: `src/components/dashboard/total-spend-card.tsx`, `src/components/dashboard/quick-stats.tsx`

- [ ] Step 1: Create AnimatedNumber component using useMotionValue + useTransform + animate. Props: value, duration (default 0.8), formatFn, className. Uses ref to update textContent directly.
- [ ] Step 2: Read total-spend-card.tsx and replace static monetary displays with AnimatedNumber, passing formatCurrency as formatFn
- [ ] Step 3: Read quick-stats.tsx and replace static count displays with AnimatedNumber
- [ ] Step 4: Verify build: `npm run build`
- [ ] Step 5: Commit: `git commit -m "feat: add animated number counters on dashboard"`

---

## Chunk 2: Empty States

### Task 8: Create shared EmptyState component

**Files:** Create: `src/components/ui/empty-state.tsx`

- [ ] Step 1: Create component with motion fade-in (opacity 0->1, y 12->0, 300ms). Props: illustration (ReactNode), title, description, primaryAction ({label, onClick}), secondaryAction? Uses shadcn Button for CTAs.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add shared EmptyState component with motion fade-in"`

### Task 9: Create CSS-only illustrations

**Files:** Create: `src/components/ui/illustrations.tsx`

- [ ] Step 1: Create 5 illustration components, all aria-hidden="true", using positioned divs with brand colors (#FAF1D6, #FDEAD7, #EC6C27):
  - StackedCardsIllustration (120x100px) -- 3 stacked card shapes, top card has + icon
  - ChartBarsIllustration (80px tall) -- 7 bars of varying heights, accent bar highlighted
  - CalendarGridIllustration (100x90px) -- mini calendar with header and grid dots
  - PeopleSilhouettesIllustration -- 3 abstract person shapes (circle heads + body)
  - MagnifyingGlassIllustration (80x80px) -- circle with handle + highlight dot
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add CSS-only illustrations for empty states"`

### Task 10: Integrate empty states into all pages

**Files:** Modify: subscriptions, dashboard, calendar, household, insights pages

- [ ] Step 1: /subscriptions -- replace `subscriptions.length === 0` block with EmptyState + StackedCardsIllustration. Keep filter-mismatch text as-is. Add useRouter. CTAs: "Add Subscription" -> /subscriptions/new, "Import CSV" -> /settings
- [ ] Step 2: /dashboard -- add `subscriptions.length === 0` check wrapping dashboard widgets. ChartBarsIllustration. CTA: "Add Your First Subscription"
- [ ] Step 3: /calendar -- add top-level `subscriptions.length === 0` check. CalendarGridIllustration. CTA: "Add Subscription"
- [ ] Step 4: /household -- replace `members.length === 0` text. PeopleSilhouettesIllustration. CTA: "Add Member" -> setDialogOpen(true)
- [ ] Step 5: /insights -- add `subscriptions.length === 0` check. MagnifyingGlassIllustration. CTA: "Add Subscription"
- [ ] Step 6: Verify build: `npm run build`
- [ ] Step 7: Commit: `git commit -m "feat: add illustrated empty states to all pages"`

---

## Chunk 3: Drag-and-Drop Reordering

### Task 11: Create useUserPreference hook

**Files:** Create: `src/hooks/use-user-preferences.ts`

- [ ] Step 1: Create hook using useLiveQuery from dexie-react-hooks. Returns [value, setValue] tuple. setValue uses db.userPreferences.put().
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add useUserPreference hook for persisted settings"`

### Task 12: Drag-and-drop on subscriptions page

**Files:** Modify: `src/app/subscriptions/page.tsx`, `src/components/subscription/subscription-card.tsx`

- [ ] Step 1: Add "Custom" SelectItem to sort dropdown. Import Reorder from framer-motion and useUserPreference. Add custom sort case in useMemo (sort by persisted order using Map of id->index).
- [ ] Step 2: Conditionally render: sortBy === 'custom' -> Reorder.Group axis="y" single column with Reorder.Item per card (whileDrag scale 1.02 + shadow, cursor-grab). Other sorts -> existing staggered grid.
- [ ] Step 3: Add `disableLink?: boolean` prop to SubscriptionCard. When true, render content without Link wrapper. Pass disableLink={true} from subscriptions page in custom mode.
- [ ] Step 4: Verify build: `npm run build`
- [ ] Step 5: Commit: `git commit -m "feat: add drag-and-drop reordering to subscription list"`

### Task 13: Drag-and-drop on dashboard

**Files:** Modify: `src/app/dashboard/page.tsx`

- [ ] Step 1: Import Reorder and useUserPreference. Define defaultDashboardOrder = ['total-spend', 'quick-stats', 'health-score', 'charts-alerts', 'forecast']. Create sectionMap mapping IDs to existing JSX. Wrap in Reorder.Group axis="y" with Reorder.Item per section (whileDrag scale 1.01 + shadow).
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add drag-and-drop reordering to dashboard sections"`

---

## Chunk 4: Logo Auto-Suggest

### Task 14: Add searchBrands utility

**Files:** Modify: `src/lib/brand-logos.ts`

- [ ] Step 1: Export BrandMatch interface (name, slug, color) and searchBrands(query) function. Returns up to 5 matches, deduplicated by slug, prioritizing starts-with over substring. Returns [] for query < 2 chars.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add searchBrands utility for brand auto-suggest"`

### Task 15: Create BrandSuggest dropdown

**Files:** Create: `src/components/subscription/brand-suggest.tsx`

- [ ] Step 1: Create accessible combobox: role=combobox on input, role=listbox on dropdown, role=option on items. Arrow-key nav (up/down), aria-selected on active, sr-only result count announcement. Shows BrandLogo(24px) + name per match. Esc and click-outside dismiss.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add BrandSuggest dropdown with a11y and keyboard nav"`

### Task 16: Integrate into subscription form

**Files:** Modify: `src/components/subscription/subscription-form.tsx:312-321`

- [ ] Step 1: Import BrandSuggest. Replace name field Input with BrandSuggest, passing field.value and field.onChange.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: integrate brand auto-suggest into subscription form"`

---

## Chunk 5: Keyboard Shortcuts

### Task 17: Create ShortcutHelp overlay

**Files:** Create: `src/components/layout/shortcut-help.tsx`

- [ ] Step 1: Create modal with AnimatePresence + spring animation (damping 25, stiffness 300). Backdrop click to close. Display shortcuts grouped by Navigation (g+d, g+s, g+c, g+h, g+i, g+x, d, /) and Actions (n, Ctrl+K, ?, Esc). Each shortcut shows kbd elements.
- [ ] Step 2: Verify build: `npm run build`
- [ ] Step 3: Commit: `git commit -m "feat: add keyboard shortcut help overlay"`

### Task 18: Add new shortcuts to command palette

**Files:** Modify: `src/components/layout/command-palette.tsx:62-128`

- [ ] Step 1: Import ShortcutHelp. Add helpOpen state. In handleKeyDown, after existing 'n' handler, add:
  - `d` key: `router.push('/dashboard')` -- guard: `!pendingGRef.current`
  - `/` key: `router.push('/subscriptions')` + setTimeout focus search input -- must `e.preventDefault()`
  - `?` key: toggle helpOpen -- guard: `!open` (command palette not open)
- [ ] Step 2: Add `<ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />` after CommandDialog in return
- [ ] Step 3: Verify build: `npm run build`
- [ ] Step 4: Manual test: ?, d, /, g+d, n, Ctrl+K, Esc
- [ ] Step 5: Commit: `git commit -m "feat: add /, d, ?, Esc keyboard shortcuts"`

---

## Chunk 6: Final Verification

### Task 19: Full build and smoke test

- [ ] Step 1: Run lint: `npm run lint`
- [ ] Step 2: Run build: `npm run build`
- [ ] Step 3: Manual smoke test with `npm run dev`:
  1. Page transitions between routes
  2. Card hover spring animation
  3. Staggered card entry on /subscriptions
  4. Animated counters on /dashboard
  5. Empty states on all pages (clear IndexedDB or fresh profile)
  6. Drag-and-drop subscription reorder (Custom sort) with persistence
  7. Drag-and-drop dashboard reorder with persistence
  8. Brand auto-suggest on /subscriptions/new (type "net")
  9. Keyboard shortcuts: ?, d, /, g+d, n, Ctrl+K, Esc
- [ ] Step 4: Fix and commit any issues found