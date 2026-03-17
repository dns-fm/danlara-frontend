# Danlara — Frontend

React SPA for the Danlara trademark conflict analysis platform. Connects to the Django REST API to manage brand portfolios, run conflict analysis jobs, and review potential trademark conflicts.

## Features

- **Dashboard** — Company stats overview
- **My Brands** — Browse, add, and bulk-import (JSON) your trademark portfolio; upload history with status tracking
- **Third-Party Brands** — Browse INPI publications and trademark entries
- **Conflict Jobs** — Create and monitor conflict analysis jobs against INPI publications; configure similarity threshold and candidate count
- **Conflict Matches** — Review all brand matches across jobs; filter by review status; confirm or dismiss each conflict with notes
- **Billing** — Stripe-backed subscription management
- **Auth** — Token-based auth with login / logout

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Router | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| UI components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Build | Vite |
| Package manager | pnpm |

## Requirements

- Node.js ≥ 18
- pnpm

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Production | Backend origin (e.g. `https://api.example.com`). Leave empty in dev — Vite proxy forwards `/api/*` to `localhost:8000`. |

### 3. Dev server

```bash
pnpm dev
```

The app is served at `http://localhost:3000`. API requests to `/api/*` are proxied to `http://localhost:8000` (configured in `vite.config.ts`).

The backend (Django) must be running locally for the API to work.

### 4. Build for production

```bash
pnpm build
```

## Project structure

```
src/
├── routes/
│   ├── __root.tsx              # Root layout (auth guard, QueryClient)
│   ├── index.tsx               # Redirect to /dashboard
│   ├── login.tsx
│   ├── dashboard/
│   ├── account/
│   ├── billing/
│   ├── brands/
│   │   ├── index.tsx           # Brand list
│   │   ├── new.tsx             # Add single brand
│   │   ├── upload.tsx          # Bulk JSON upload
│   │   ├── uploads/index.tsx   # Upload history
│   │   └── $brandId/index.tsx  # Brand detail
│   ├── third-party-brands/
│   │   ├── index.tsx           # Publications list
│   │   └── trademarks/
│   └── conflicts/
│       ├── index.tsx           # Jobs list
│       ├── new.tsx             # Create conflict job
│       ├── $jobId/index.tsx    # Job detail + matches
│       └── matches/
│           ├── index.tsx       # All conflicts (cross-job)
│           └── $matchId/index.tsx  # Conflict detail + review
├── components/
│   ├── DashboardLayout.tsx
│   ├── DashboardSidebar.tsx
│   └── ui/                     # shadcn/ui components
└── lib/
    ├── api.ts                  # All API functions and types
    ├── auth-context.tsx        # Auth state (token, user)
    └── utils.ts
```

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

## Linting & formatting

```bash
pnpm lint
pnpm format
pnpm check
```
