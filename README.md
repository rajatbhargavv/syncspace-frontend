# SyncSpace Frontend

SyncSpace is a production-grade collaborative task application designed for families sharing chores, developer teams running sprints, companies, individuals managing personal workflows, and productivity enthusiasts seeking a refined UI.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture & Separation of Concerns](#architecture--separation-of-concerns)
- [Phase 1 Shared Contract](#phase-1-shared-contract)
- [Phase 2 Shared Contract (Tasks & Workspaces)](#phase-2-shared-contract-tasks--workspaces)
- [Phase 3 Shared Contract (Discussion, Notifications & Realtime)](#phase-3-shared-contract-discussion-notifications--realtime)
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
│   ├── spaces/                     # Spaces management, views & theme scoping
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

## Phase 1 Shared Contract

Phase 1 establishes the spaces data foundation, theme scoping system, and route skeleton across four parallel work streams:

### 1. Route Paths (`config/routes.ts`)

- `ROUTES.home` / `ROUTES.HOME`: `/`
- `ROUTES.overview` / `ROUTES.OVERVIEW`: `/app`
- `ROUTES.spaces` / `ROUTES.SPACES`: `/spaces`
- `ROUTES.spaceNew` / `ROUTES.SPACE_NEW`: `/spaces/new`
- `ROUTES.space(id)` / `ROUTES.SPACE(id)`: `/spaces/:id`
- `ROUTES.publicSpace(id)` / `ROUTES.PUBLIC_SPACE(id)`: `/s/:id`
- `ROUTES.myTasks` / `ROUTES.MY_TASKS`: `/my-tasks`
- `ROUTES.notifications` / `ROUTES.NOTIFICATIONS`: `/notifications`
- `ROUTES.settings` / `ROUTES.SETTINGS`: `/settings`

### 2. Page Exports & Ownership

| Route            | Page Component      | File Path                                            | Phase 1 Owner       |
| ---------------- | ------------------- | ---------------------------------------------------- | ------------------- |
| `/app`           | `OverviewPage`      | `features/overview/pages/OverviewPage.tsx`           | Member 2            |
| `/spaces/new`    | `CreateSpacePage`   | `features/spaces/pages/CreateSpacePage.tsx`          | Member 3            |
| `/spaces`        | `SpacesPage`        | `features/spaces/pages/SpacesPage.tsx`               | Member 4            |
| `/spaces/:id`    | `SpaceOverviewPage` | `features/spaces/pages/SpaceOverviewPage.tsx`        | Member 4            |
| `/s/:id`         | `PublicSpacePage`   | `features/spaces/pages/PublicSpacePage.tsx`          | Member 4            |
| `/my-tasks`      | `MyTasksPage`       | `features/tasks/pages/MyTasksPage.tsx`               | Phase 2 Placeholder |
| `/notifications` | `NotificationsPage` | `features/notifications/pages/NotificationsPage.tsx` | Phase 2 Placeholder |
| `/settings`      | `SettingsPage`      | `features/settings/pages/SettingsPage.tsx`           | Phase 2 Placeholder |

### 3. Space Types (`features/spaces/types/space.types.ts`)

- `SpaceKind`: `"OUR_HOME" | "BUILDERS_CIRCLE" | "STUDIO" | "MY_CORNER" | "CUSTOM"`
- `ThemePreset`: `"HEARTH" | "NEON_GRID" | "IVORY_INK" | "ORBIT"`
- `ThemeMode`: `"light" | "dark"`
- `SpaceVisibility`: `"PRIVATE" | "UNLISTED" | "PUBLIC"`
- `SpaceJoinPolicy`: `"INVITE_ONLY" | "REQUEST" | "OPEN"`
- `SpaceStatus`: `"Active" | "Inactive"`
- `MemberRole`: `"OWNER" | "MEMBER"`
- `SpaceSummary`: `Space & { myRole: MemberRole; memberCount: number }`
- `PublicSpace`: public representation without sensitive membership or role info

### 4. Space Hooks & React Query (`features/spaces/hooks/`)

- `useSpaces()`: query for user's space summaries (`queryKeys.spaces.list()`)
- `useSpace(id)`: query for single space (`queryKeys.spaces.byId(id)`)
- `usePublicSpace(id)`: query for public space details (`queryKeys.spaces.public(id)`)
- `useCreateSpace()`: mutation, automatically invalidates spaces list
- `useUpdateSpace()`: mutation, invalidates spaces list and target space by ID
- `useDeactivateSpace()`: mutation (soft delete), updates space status to `Inactive`
- `useSpaceTheme(space)`: hook applying a space's theme on mount and restoring base theme on unmount

### 5. Backend REST Endpoints (Phase 1)

| Method   | Endpoint                          | Auth Required | Description                                                               |
| -------- | --------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `POST`   | `/api/auth/register`              | No            | Register a new account                                                    |
| `POST`   | `/api/auth/login`                 | No            | Login and receive session cookies & access token                          |
| `POST`   | `/api/auth/refresh`               | Cookie/Body   | Single-flight token refresh                                               |
| `POST`   | `/api/auth/logout`                | Optional      | Revoke session and clear cookies                                          |
| `GET`    | `/api/users/me`                   | Yes           | Fetch authenticated profile                                               |
| `GET`    | `/api/spaces`                     | Yes           | List authenticated user's spaces (`SpaceSummary[]`)                       |
| `GET`    | `/api/spaces/:id`                 | Member only   | Get space details (returns `403` if not a member)                         |
| `GET`    | `/api/spaces/public/:id`          | No            | Public space landing view with stats and owner name                       |
| `POST`   | `/api/spaces`                     | Yes           | Create space (name 3-50, description <=500, kind, theme, policies)        |
| `PUT`    | `/api/spaces/:id`                 | Owner only    | Update space name, description, kind, theme, or policies                  |
| `PATCH`  | `/api/spaces/:id/deactivate`      | Owner only    | Soft-deactivate space (marks status `Inactive`)                           |
| `GET`    | `/api/spaces/:id/members`         | Member only   | List space members with roles and statuses                                |
| `POST`   | `/api/spaces/:id/join`            | Yes           | Join space (`OPEN` -> ACTIVE, `REQUEST` -> PENDING, `INVITE_ONLY` -> 403) |
| `POST`   | `/api/spaces/:id/leave`           | Member only   | Leave space (owner cannot leave)                                          |
| `DELETE` | `/api/spaces/:id/members/:userId` | Owner only    | Remove member from space                                                  |
| `GET`    | `/api/notifications/unread-count` | Yes           | Unread notifications count badge                                          |

### 6. Scoped Theming & Utilities

- `<ThemeScope theme={preset} mode={mode}>`: Isolates theme tokens (`--color-*`, `--radius-*`, `--font-*`) to a local DOM subtree for real-time creation and preview cards.
- `<SpaceThemeDot theme={preset} size="sm|md|lg">`: Small themed indicator dot with corresponding preset colors.
- `SPACE_KIND_CONFIG`: Comprehensive presets, default themes, and contextual copy per kind (e.g. Our Home -> "Chores", Builders' Circle -> "Tickets", Studio -> "Deliverables").

---

## Phase 2 Shared Contract (Tasks & Workspaces)

Phase 2 delivers the core interactive task management system across Board, List, and Calendar views with detailed task drawer, subtasks checklist, workload strip, URL-driven filtering, and cross-space aggregation:

### 1. Route Paths & URL State

- Space Workspace: `/spaces/:id`
  - View State: `?view=board|list|calendar` (persisted per-space to `localStorage` key `syncspace:view:<spaceId>`)
  - Drawer Deep Link: `?task=<taskId>` (opens task detail drawer)
  - URL Filter Params: `?q=<search>&status=<TODO,IN_PROGRESS>&priority=<HIGH>&assignee=<userId|me|unassigned>&sort=<deadline|priority|createdAt>&dir=<asc|desc>`
- Cross-Space Inbox: `/my-tasks` (aggregates active tasks assigned to the current user across all active spaces)

### 2. Task & Subtask Types

- **Task Progress Status**: `"TODO" | "IN_PROGRESS" | "COMPLETED"`
- **Task Priority**: `"LOW" | "MEDIUM" | "HIGH" | "URGENT"`
- **Assignee Status**: `"TODO" | "IN_PROGRESS" | "DONE"`
- **Subtask Status**: `"TODO" | "IN_PROGRESS" | "DONE"`
- **Task Model**: `{ _id, spaceId, createdBy, title, description?, priority, deadline, progressStatus, lifecycleStatus, assignees: [{ userId, status }], createdAt, updatedAt }`
- **Subtask Model**: `{ _id, taskId, title, description?, assigneeId, priority, deadline, status, lifecycleStatus, createdAt, updatedAt }`

### 3. Task Hooks & State Management

- `useSpaceTasks(spaceId, filters?)`: Raw tasks query (`queryKeys.tasks.bySpace(spaceId, filters)`)
- `useFilteredTasks(spaceId)`: Client-filtered and sorted task selector driven by `useTaskFilters()`
- `useTask(taskId)`: Single task detail query
- `useCreateTask()`: Task creation mutation with automatic space tasks cache invalidation
- `useUpdateTask()`: Task metadata mutation (title, description, priority, deadline)
- `useUpdateTaskStatus()`: Optimistic column drag and status transition with automatic rollback on error
- `useDeleteTask()`: Soft delete mutation (creator / space owner only)
- `useAddAssignee()`, `useRemoveAssignee()`: Member assignment management
- `useUpdateMyAssigneeStatus()`: Self-status progress update (`PATCH /tasks/:id/assignees/me`)
- `useSubtasks(taskId)`: Task subtasks query (`queryKeys.tasks.subtasks(taskId)`)
- `useCreateSubtask()`, `useUpdateSubtask()`, `useDeleteSubtask()`: Subtask checklist mutations
- `useMemberLookup(spaceId)`: Member resolver providing `getName(userId)` with fallback to "Former member"

### 4. Components & Workspace Architecture

- **BoardView**: 3-column drag-and-drop workspace using `@dnd-kit` (`PointerSensor`, `TouchSensor`, `KeyboardSensor` with `sortableKeyboardCoordinates`). Optimistic status drop with mobile horizontal snap scroll.
- **ListView**: Density-toggleable list view with grouping by status, priority, or assignee, inline status select, and quick actions.
- **CalendarView**: Month-grid calendar with day-level task bubbles, overdue styling, and month navigation.
- **TaskDrawer**: Slide-over drawer deep-linked via `?task=<id>`, supporting title editing, priority selection, assignees management, markdown description editing, subtask checklist, and deletion modal.
- **SubtaskList & SubtaskForm**: Checkbox toggle, status cycle, subtask creation with required deadline and assignee selection.
- **WorkloadStrip**: 5-dot workload visualizer across all space members with one-click assignee filtering.
- **TaskFilterBar**: Search input with debounce, multi-status chip filters, priority selector, assignee dropdown, and active filter reset.
- **PendingRequests**: Owner join request moderation panel (`GET /spaces/:id/members?status=PENDING`, Approve / Reject).

### 5. Backend REST Endpoints (Phase 2)

| Method   | Endpoint                              | Auth Required  | Description                                                         |
| -------- | ------------------------------------- | -------------- | ------------------------------------------------------------------- |
| `GET`    | `/api/spaces/:id/tasks`               | Member only    | List tasks for space with optional query filters                    |
| `POST`   | `/api/tasks`                          | Member only    | Create task (spaceId, title, description?, priority, deadline)      |
| `GET`    | `/api/tasks/:id`                      | Member only    | Get task by ID                                                      |
| `PATCH`  | `/api/tasks/:id`                      | Member only    | Update task metadata or status (`progressStatus`)                   |
| `DELETE` | `/api/tasks/:id`                      | Creator/Owner  | Soft-delete task (returns `403` for non-authorized members)         |
| `POST`   | `/api/tasks/:id/assignees`            | Member only    | Add member assignee to task                                         |
| `DELETE` | `/api/tasks/:id/assignees/:userId`    | Member only    | Remove member assignee from task                                    |
| `PATCH`  | `/api/tasks/:id/assignees/me`         | Assigned user  | Update authenticated user's assignee status (`TODO`, `IN_PROGRESS`, `DONE`) |
| `GET`    | `/api/tasks/:taskId/subtasks`         | Member only    | List subtasks for a task                                            |
| `POST`   | `/api/tasks/:taskId/subtasks`         | Member only    | Create subtask (title, assigneeId, priority, deadline, description?)|
| `PATCH`  | `/api/subtasks/:id`                   | Member only    | Update subtask status or details                                    |
| `DELETE` | `/api/subtasks/:id`                   | Member only    | Delete subtask                                                      |
| `GET`    | `/api/spaces/:id/members?status=PENDING` | Owner only  | Query pending join requests waiting for review                      |
| `POST`   | `/api/spaces/:id/members/:userId/approve` | Owner only | Approve join request into active member                            |
| `POST`   | `/api/spaces/:id/members/:userId/reject`  | Owner only | Reject pending join request                                         |

---

## Phase 3 Shared Contract (Discussion, Notifications & Realtime)

Phase 3 introduces real-time collaborative features: GitHub-PR-style discussion timeline in task drawers, notifications system with unread bell popover and dedicated page, and live bidirectional synchronization over Socket.io:

### 1. Discussion Timeline (`features/comments`)

- **Timeline Data Model**: Discriminant union `TimelineItem = CommentItem | EventItem` sorted chronologically.
  - `CommentItem`: `{ _id, taskId, userId: { _id, name }, content, createdAt, updatedAt }`
  - `EventItem`: `{ _id, type: ActivityEventType, actorId: { _id, name }, meta: Record<string, unknown>, createdAt }`
- **Components**:
  - `<DiscussionTimeline taskId spaceId />`: Primary discussion container mounted in `TaskDiscussionSlot` within `TaskDrawer`.
  - `<CommentComposer />`: Dual-tab (Write / Preview) editor with `@mention` auto-completion listbox, keyboard shortcuts (`Cmd/Ctrl+Enter` to submit), draft persistence in `localStorage`, and error recovery.
  - `<CommentCard />`: Clean user comment bubble with author metadata, timestamp, edit/delete actions for author/owner, and optimistic mutations.
  - `<EventTimelineItem />`: Compact dot-and-line event row formatted according to space kind wording (e.g. "created this ticket" vs "created this task").
  - `<MarkdownRenderer />`: Sanitized rendering via `react-markdown` and `remark-gfm` with interactive `@mention` badges and external link security (`target="_blank" rel="noopener noreferrer"`).

### 2. Notifications System (`features/notifications`)

- **Notification Model**: `{ _id, userId, type, message, isRead, resource?: 'SPACE' | 'TASK' | 'SUBTASK' | 'COMMENT', resourceId?: string, createdAt, updatedAt }`
- **Components & Routing**:
  - `<NotificationBell />`: Topbar bell with unread badge count (capped at `99+`), popover panel displaying 5 recent notifications, and one-click "Mark all as read".
  - `<NotificationsPage />`: Full `/notifications` screen with filter tabs (All / Unread), day grouping (Today, Yesterday, Earlier), optimistic mark-as-read toggles, and responsive empty states.
  - `resolveNotificationDestination`: Navigates to `/spaces/:id` or deep-links to `/spaces/:spaceId?task=:taskId`. Unresolvable resources (e.g. subtask/comment without space context) safely redirect to `/notifications`.

### 3. Realtime Socket & Cache Synchronization (`features/realtime`, `lib/socket.ts`)

- **Socket Lifecycle & Reconnection**:
  - Connects to backend with credentials (`withCredentials: true`), joining `user:<id>` room and space rooms dynamically on view or membership update.
  - Single-flight token refresh on `connect_error`: automatically refreshes JWT once, reconnects on success, or triggers auth failure logout on 401.
  - Reconnection reconciliation: invalidates active task lists, task details, timelines, and notification queries when reconnecting after a drop.
- **Event Cache Handlers**:
  - `"notification"`: Increments unread count, prepends to infinite notification cache, and triggers a Sonner toast with "View" action (suppressed if the target task drawer is actively open).
  - `"task:updated"`: Updates single-task and space-tasks caches, removes deleted tasks, and filters out older echoes via timestamp checks.
  - `"comment:created"`: Appends comment to timeline cache and invalidates `timeline` query.
- **Status Monitoring**:
  - `useSocketStatus()`: Returns `'connected' | 'connecting' | 'disconnected'`.
  - Subtle `Topbar` indicator appears only when disconnected for >3s to avoid flicker during transient network changes.

### 4. Backend REST Endpoints (Phase 3)

| Method   | Endpoint                          | Auth Required | Description                                                         |
| -------- | --------------------------------- | ------------- | ------------------------------------------------------------------- |
| `GET`    | `/api/tasks/:id/timeline`         | Member only   | Chronological timeline of comments and activity events              |
| `GET`    | `/api/tasks/:taskId/comments`     | Member only   | List comments for a task                                            |
| `POST`   | `/api/tasks/:taskId/comments`     | Member only   | Create a task comment (1-2000 characters)                           |
| `PUT`    | `/api/comments/:id`               | Author only   | Update comment content                                              |
| `DELETE` | `/api/comments/:id`               | Author/Owner  | Delete comment                                                      |
| `GET`    | `/api/notifications`              | Yes           | List paginated notifications (`unread`, `page`, `limit`)            |
| `GET`    | `/api/notifications/unread-count` | Yes           | Get unread notifications count                                      |
| `PATCH`  | `/api/notifications/:id/read`     | Yes           | Mark single notification as read                                    |
| `PATCH`  | `/api/notifications/read-all`     | Yes           | Mark all notifications as read                                      |


---

## Design Tokens & Themes

The application features 4 distinct presets, each supporting both `light` and `dark` modes:

- **ORBIT** (Default / Personal): Deep near-black (`#0A0A0B`), surfaces `#141416` / `#1C1C1F`, radiant accent orange (`#FF8A1F`), 16px card radius.
- **HEARTH** (Family / Our Home): Warm cream (`#FDF6F0`) and terracotta (`#C96A3C`), 24px soft radius, friendly typography (Nunito).
- **NEON_GRID** (Developers / Builders' Circle): Deep navy/black (`#080B14`), cyan (`#22D3EE`) + violet (`#818CF8`) + lime (`#A3E635`) accents, 12px compact density, JetBrains Mono IDs.
- **IVORY_INK** (Professional / Studio): Graphite (`#2D2D2A`) and ivory (`#F8F6F1`) with deep gold/emerald accents, serif headings (Lora), minimal 8px radius.

Runtime theme switching is powered by `data-theme` and `data-mode` HTML attributes driven by `ThemeProvider` globally or `<ThemeScope>` locally.

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

The frontend will run at `http://localhost:5173`. Requests to `/api` and `/socket.io` are proxied to `http://localhost:5000`.

---

## Available Scripts

| Script                 | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Starts Vite dev server with Hot Module Replacement |
| `npm run build`        | Compiles TypeScript and builds production bundle   |
| `npm run preview`      | Previews the production build locally              |
| `npm run typecheck`    | Runs `tsc --noEmit` strict type check              |
| `npm run lint`         | Runs ESLint across the codebase                    |
| `npm run format:check` | Checks code formatting with Prettier               |
| `npm run format`       | Auto-formats code with Prettier                    |
| `npm run test`         | Executes test suite with Vitest and MSW            |
| `npm run test:watch`   | Runs test runner in watch mode                     |

---

## Coding Conventions

- **Strict TypeScript**: No `any`, `noUncheckedIndexedAccess` enabled, explicit return types on all API functions.
- **Single-Flight Token Refresh**: Transparent handling of expired JWTs with single concurrent refresh promise.
- **Accessible UI**: Visible focus rings, ARIA roles, live regions, keyboard navigation.
- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
