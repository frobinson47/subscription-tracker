# CLAUDE.md

## Overview

Sub Tracker — local-first subscription tracking dashboard. Manage and visualize all your recurring subscriptions with offline-capable storage, analytics, and CSV import/export.

## Development Commands

### Setup
- `npm install` — Install dependencies

### Running
- `npm run dev` — Start Next.js dev server with Turbopack (http://localhost:3001)

### Building
- `npm run build` — Next.js production build
- `npm run start` — Start production server (port 3001)

### Linting
- `npm run lint` — ESLint check

## Architecture

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State**: Zustand
- **Storage**: Dexie (IndexedDB wrapper) — fully local, no backend
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

### Key Patterns
- **Local-first**: All data in IndexedDB via Dexie — works offline
- **No backend**: Pure client-side app, no API calls
- **shadcn/ui**: Radix-based component library via `radix-ui` package
- **CSV import/export**: PapaParse for subscription data portability

### Dependencies of Note
- `dexie` + `dexie-react-hooks` — IndexedDB ORM with React bindings
- `cmdk` — Command palette
- `date-fns` — Date utilities
- `sonner` — Toast notifications
- `uuid` — Unique ID generation

## Guidelines

- Port 3001 (configured in package.json scripts)
- All data lives in the browser — no server, no database to configure
- Use shadcn/ui components for new UI elements
- Forms validated with Zod schemas via React Hook Form
