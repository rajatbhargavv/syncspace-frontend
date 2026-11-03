# SyncSpace Frontend

SyncSpace is a production-grade collaborative task application designed for families sharing chores, developer teams running sprints, companies, individuals managing personal workflows, and productivity enthusiasts seeking a refined UI.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture & Separation of Concerns](#architecture--separation-of-concerns)
- [Design Tokens & Themes](#design-tokens--themes)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Coding Conventions](#coding-conventions)

---

## Tech Stack
- **Framework & Language**: React 18, TypeScript (strict mode, `noUncheckedIndexedAccess`), Vite 6
- **Styling**: Tailwind CSS with CSS-variable design tokens, dynamic runtime theme engine
- **Routing**: React Router v6 (data router, lazy routes, layout guards)
- **State Management**: TanStack Query v5 (server cache & state), Zustand (lightweight client UI state)
- **Forms**: React Hook Form + Zod validation (mirroring backend Joi schemas)
- **Networking & Realtime**: Native Fetch client with single-flight JWT refresh, Socket.io client
- **UI & Motion**: Framer Motion, `@dnd-kit`, Sonner (toast notifications), Recharts, Lucide-style SVG icons
- **Testing & Quality**: Vitest, React Testing Library, Mock Service Worker (MSW - tests only), ESLint, Prettier, Husky, lint-staged

---

## Architecture & Separation of Concerns

The frontend mirrors the backend layering pattern organized cleanly by **FEATURE**:

```text
Backend Concept      ->  Frontend Architecture
---------------------------------------------------------------------------------
Models / Types       ->  <feature>/types/<name>.types.ts
Validators (Joi)     ->  <feature>/schemas/<name>.schema.ts (Zod)
Services             ->  <feature>/api/<name>.api.ts (pure typed HTTP functions)
Controllers          ->  <feature>/hooks/use<Name>.ts (TanStack Query hooks)
Routes               ->  app/router/*.tsx + <feature>/routes.tsx
Middleware           ->  app/router/guards/*.tsx + lib/http interceptors
Config / Env         ->  config/env.ts, config/routes.ts, config/constants.ts
Utilities            ->  lib/*, hooks/*
UI Primitives        ->  components/ui/* (design system only, zero business logic)
```

### Folder Structure
```text
src/
├── app/
│   ├── App.tsx                     # Main root application component
│   ├── main.tsx                    # React DOM entry point
│   ├── layouts/                    # AppLayout, AuthLayout, PublicLayout
│   ├── providers/                  # QueryProvider, ThemeProvider, AuthProvider, SocketProvider
│   ├── router/                     # Data router with route definitions & guards
│   └── error-boundary/             # Global application error boundary
├── config/
│   ├── constants.ts                # System constants, API paths, and enums
│   ├── env.ts                      # Zod-validated environment config
│   └── routes.ts                   # Centralized application route definitions
├── lib/
│   ├── http/                       # client.ts, ApiError.ts, refresh.ts
│   ├── queryClient.ts              # TanStack Query configuration
│   ├── queryKeys.ts                # Structured query key factories
│   ├── socket.ts                   # WebSocket client & event handlers
│   ├── cn.ts                       # Classnames merger (clsx + tailwind-merge)
│   ├── date.ts                     # Date formatting helpers (date-fns)
│   └── storage.ts                  # Safe local storage wrapper
├── styles/
│   ├── tokens.css                  # Base CSS custom property tokens
│   ├── globals.css                 # Global CSS rules and Tailwind directives
│   └── themes/                     # orbit.css, hearth.css, neon-grid.css, ivory-ink.css
├── components/
│   ├── ui/                         # Design system primitives (Button, Input, NotchCard, ...)
│   ├── layout/                     # PageHeader, Container, Sidebar, Topbar
│   └── feedback/                   # Spinner, Toaster wrapper
├── features/
│   ├── auth/                       # Authentication (login, register, session)
│   ├── spaces/                     # Spaces management & views
│   ├── members/                    # Space membership & permissions
│   ├── tasks/                      # Tasks management, board & lists
│   ├── subtasks/                   # Subtask checklist
│   ├── comments/                   # Markdown comments & timeline
│   ├── notifications/              # Real-time notification feed
│   ├── profile/                    # Public profiles & user details
│   ├── analytics/                  # Premium team analytics (PRO)
│   └── settings/                   # Profile & app settings
├── hooks/                          # Shared reusable hooks (useDebounce, useMediaQuery, useDisclosure)
├── types/                          # Shared API & pagination types
└── test/                           # MSW handlers, setup, and render test-utils
```

### Dependency Rules
1. `components/ui` may never import from `features`.
2. `features` may import `components/ui`, `lib`, `config`, `hooks`, `types`, and other features ONLY through their public `index.ts`.
3. Pages compose feature components and hooks; they contain zero HTTP and zero domain business logic.
4. No `fetch` or HTTP calls outside `<feature>/api/*.ts`.

---

## Design Tokens & Themes

The application features 4 distinct presets, each supporting both `light` and `dark` modes:

- **ORBIT** (Default / Personal): Deep near-black (`#0A0A0B`), warm glow, radiant accent orange (`#FF8A1F`), 20px card radius.
- **HEARTH** (Family / Our Home): Warm terracotta and amber, 24px soft radius, friendly typography (Nunito).
- **NEON_GRID** (Developers / Builders' Circle): Deep navy/black, cyan + violet + lime accents, 12px compact density, JetBrains Mono IDs.
- **IVORY_INK** (Professional / Studio): Graphite and ivory with deep gold/emerald accents, serif headings (Lora), minimal 8px radius.

Runtime theme switching is powered by `data-theme` and `data-mode` HTML attributes driven by `ThemeProvider`.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd syncspace-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development
```bash
# Start development server with Vite proxy pointing to backend
npm run dev
```

The frontend will run at `http://localhost:5173`. Requests to `/api` and `/socket.io` are proxied to `http://localhost:4000`.

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Starts Vite dev server with Hot Module Replacement |
| `npm run build` | Compiles TypeScript and builds production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Runs `tsc --noEmit` strict type check |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run format:check`| Checks code formatting with Prettier |
| `npm run format` | Auto-formats code with Prettier |
| `npm run test` | Executes test suite with Vitest and MSW |
| `npm run test:watch` | Runs test runner in watch mode |

---

## Coding Conventions
- **Strict TypeScript**: No `any`, `noUncheckedIndexedAccess` enabled, explicit return types on all API functions.
- **Single-Flight Token Refresh**: Transparent handling of expired JWTs with single concurrent refresh promise.
- **Accessible UI**: Visible focus rings, ARIA roles, live regions, keyboard navigation.
- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.