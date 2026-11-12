# SyncSpace Frontend Production Audit

## Scope and baseline

This audit covers the frontend repository as found on the `phase2/m4-list-calendar-filters`
branch. It is intentionally evidence-based: findings below are from source inspection and
the commands listed in the baseline table, not assumptions about unimplemented backend work.

| Check                                           | Result         | Evidence                                                                           |
| ----------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| TypeScript                                      | Pass           | `npm run typecheck`                                                                |
| ESLint                                          | Blocked        | `npm run lint` fails while resolving a missing generated `vitest.config.ts` module |
| Prettier                                        | Fail           | `npm run format:check` reports multiple source files                               |
| Vitest                                          | Blocked        | `npm test` cannot resolve `vite-plugin-pwa` from `vitest.config.ts`                |
| Production build                                | Blocked        | `npm run build` cannot resolve `vite-plugin-pwa` and its client types              |
| Production dependency audit                     | Fail           | `npm audit --omit=dev` reports 1 high and 2 moderate advisories                    |
| E2E, axe, Lighthouse, contrast, bundle analysis | Not configured | No scripts, suites, or reports are present yet                                     |

Severity uses the project convention: **P0** broken or blocking, **P1** important
production risk, and **P2** polish or maintainability.

## Findings

### Accessibility

| ID       | Severity | File/screen                                       | What is wrong                                                                                                                                               | Proposed fix                                                                                                                               |
| -------- | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A11Y-001 | P1       | All routes and `src/app/App.tsx`                  | There is no shared route announcer or page-heading focus policy; several pages set `document.title` independently.                                          | Add a reusable route-announcer/document-title hook and apply it at the route layout boundary.                                              |
| A11Y-002 | P1       | Interactive primitives under `src/components/ui/` | Focus styling is globally defined, but keyboard behavior, Escape/focus return, names, and roving tabindex are not covered by automated accessibility tests. | Add component-level axe and keyboard tests for Button, Dialog, Drawer, Dropdown, Tabs, Select, and IconButton; fix findings per component. |
| A11Y-003 | P1       | Main application routes                           | No Playwright + axe suite exists, so serious/critical route violations are not gated.                                                                       | Add route smoke tests with `@axe-core/playwright` and fail on serious/critical violations.                                                 |
| A11Y-004 | P1       | `src/styles/themes/*.css`                         | Eight theme/mode token sets are present, but no contrast checker validates text, muted text, accent, status, focus, or chart combinations.                  | Add a deterministic token contrast script and CI check; correct failing tokens.                                                            |
| A11Y-005 | P2       | Board, calendar, notifications, mentions          | Keyboard interaction and live announcements are not represented by tests or a documented manual screen-reader pass.                                         | Add keyboard interaction coverage, polite live regions, and document NVDA/VoiceOver smoke results.                                         |
| A11Y-006 | P2       | Mobile layouts and icon controls                  | The requested 44px target and 320px/400% reflow behavior are not measured by an automated viewport suite.                                                   | Add responsive browser checks and fix any undersized controls or overflow.                                                                 |

### Responsive and themes

| ID     | Severity | File/screen                                         | What is wrong                                                                                                                                               | Proposed fix                                                                                        |
| ------ | -------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| UI-001 | P1       | `index.html`, `src/app/providers/ThemeProvider.tsx` | Theme state is applied by React after first paint; no inline bootstrap prevents a wrong-theme flash on reload.                                              | Bootstrap the stored theme before first paint and keep the provider as the runtime source of truth. |
| UI-002 | P1       | All routes                                          | There is no screenshot matrix for the required widths, orientations, themes, or portal content.                                                             | Add deterministic Playwright capture/QA coverage for the key screens and theme modes.               |
| UI-003 | P1       | Lists, cards, and pages                             | Shared loading/empty/error usage is inconsistent and there is no audit proving skeleton geometry, friendly error mapping, or absence of raw enum/date copy. | Centralize error messages and audit each page/list state against shared components.                 |
| UI-004 | P2       | `src/features/*/pages`                              | Page titles and copy are implemented ad hoc; a shared microcopy/date/number policy is not enforced.                                                         | Reuse shared formatting and route metadata helpers, then remove user-visible raw values.            |

### Performance

| ID       | Severity | File/screen                    | What is wrong                                                                                                                                     | Proposed fix                                                                                      |
| -------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| PERF-001 | P1       | Build and deployment           | No bundle visualizer, bundle budget, Lighthouse run, or before/after performance report exists.                                                   | Add analysis-only visualizer support and record production measurements in `docs/PERFORMANCE.md`. |
| PERF-002 | P1       | Route graph and heavy features | The repository has no verified route-level chunk budget or evidence that Recharts, markdown, and board dependencies are isolated.                 | Measure first, then split heavy routes/components without changing public exports.                |
| PERF-003 | P1       | Query/socket flows             | No test proves socket cache updates avoid a refetch storm, and no performance evidence covers board drag, task lists, timeline, or notifications. | Add focused cache-update tests and profile the highest-volume views before tuning.                |
| PERF-004 | P2       | PWA configuration              | The service-worker precache size and cache strategy are not reported or budgeted.                                                                 | Add a build report and verify immutable hashed assets versus update-sensitive files.              |

### Error, empty, and loading states

| ID      | Severity | File/screen                                         | What is wrong                                                                                                                                    | Proposed fix                                                                          |
| ------- | -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| RES-001 | P1       | `src/app/error-boundary/ErrorBoundary.tsx`          | A boundary exists, but route/widget coverage, error reporting hook, and a consistent recovery UX are not demonstrated.                           | Add root/route/heavy-widget boundaries with a shared fallback and `reportError` hook. |
| RES-002 | P1       | `src/pwa/registerSW.ts`                             | Lazy chunk failure handling is not shown to distinguish deploy-time module failures or prevent reload loops.                                     | Add a one-time session-guarded update/reload prompt.                                  |
| RES-003 | P1       | `src/lib/http/client.ts`, `src/lib/http/refresh.ts` | Timeout behavior, user-facing status mapping, and route-change cancellation are not covered by tests.                                            | Add AbortController timeout/error mapping and targeted request lifecycle tests.       |
| RES-004 | P1       | Auth provider and socket provider                   | Multi-tab logout synchronization, expired-session return paths, and refresh-loop prevention are not proven by tests.                             | Add storage/BroadcastChannel synchronization and auth edge-case tests.                |
| RES-005 | P2       | Global feedback                                     | A global offline banner is referenced by the requested design but no audit/test confirms consistent mutation failure and realtime announcements. | Verify existing feedback surfaces and standardize missing states.                     |

### Security

| ID      | Severity | File/screen                  | What is wrong                                                                                                  | Proposed fix                                                                                                                    |
| ------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | P0       | Dependency tree              | `zod` is reported high severity by `npm audit --omit=dev`; React Router packages have two moderate advisories. | Upgrade through a compatible migration, run the full suite, and document any unavoidable exception.                             |
| SEC-002 | P1       | `index.html`                 | Google Fonts are loaded from third-party origins and no CSP policy is documented or tested.                    | Define a report-only-compatible CSP for fonts, API, sockets, worker, and Vite output; self-host where practical.                |
| SEC-003 | P1       | Redirects and external links | Redirect validation and external-link `noopener noreferrer` coverage are not centrally tested.                 | Add same-origin relative redirect validation and an external-link audit/test.                                                   |
| SEC-004 | P1       | Markdown/comments            | Markdown rendering exists, but no XSS corpus test or sanitizer verification is present.                        | Add a malicious-markdown test and sanitize or constrain the renderer.                                                           |
| SEC-005 | P2       | Source and logs              | `console.error` remains in environment validation and no secret/log scan is documented.                        | Keep development diagnostics intentional, remove production logging of sensitive data, and add a repository secret scan report. |

### Code quality and architecture

| ID       | Severity | File/screen              | What is wrong                                                                                         | Proposed fix                                                                       |
| -------- | -------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| CODE-001 | P0       | Tooling                  | Declared PWA tooling is unavailable in the installed dependency tree, preventing tests and builds.    | Restore dependencies from the lockfile, then validate from a clean install.        |
| CODE-002 | P1       | Project-wide             | Formatting is not clean and lint cannot complete, so CI cannot establish a reliable quality baseline. | Format only in-scope source/config changes and make lint deterministic.            |
| CODE-003 | P1       | Project-wide             | No unused-code/import-boundary check is configured despite documented feature boundaries.             | Run a dead-code tool once, remove confirmed dead code, and add a repeatable check. |
| CODE-004 | P2       | Large feature/page files | No max-lines/complexity warning policy or measured refactoring pass exists.                           | Report the largest offenders and split only where behavior remains unchanged.      |

### Tests and CI

| ID       | Severity | File/screen                | What is wrong                                                                                                                                                                          | Proposed fix                                                                       |
| -------- | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| TEST-001 | P0       | Test tooling               | The current test command is blocked before collecting tests.                                                                                                                           | Restore dependencies and make the test config load independently and reliably.     |
| TEST-002 | P1       | Critical feature logic     | Coverage thresholds and focused tests for refresh single-flight, optimistic rollback, URL filters, timeline mapping, plan gating, and analytics utilities are not configured as gates. | Add/extend tests and realistic v8 thresholds.                                      |
| TEST-003 | P1       | `e2e/`                     | No Playwright critical journeys, smoke tag, traces, or axe checks are present.                                                                                                         | Add the requested smoke and journey suites using a separate test backend/database. |
| TEST-004 | P1       | `.github/workflows/ci.yml` | No CI workflow is present to run typecheck, lint, formatting, tests, contrast, build, budgets, or smoke E2E.                                                                           | Add staged CI jobs and upload browser artifacts on failure.                        |
| TEST-005 | P2       | Dependency maintenance     | No Dependabot/Renovate configuration is present.                                                                                                                                       | Add weekly grouped update configuration after baseline CI is green.                |

### DX and documentation

| ID      | Severity | File/screen                | What is wrong                                                                                                                                        | Proposed fix                                                                 |
| ------- | -------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| DOC-001 | P1       | README and `docs/`         | The README is phase-contract oriented and there are no audit, accessibility, performance, architecture, deployment, demo, or contribution documents. | Rewrite documentation from verified behavior and link measured evidence.     |
| DOC-002 | P1       | Repository metadata        | No visible Node engine pin, license, changelog, PR/issue templates, or documented environment/test setup is present.                                 | Add only verified metadata and setup instructions; do not invent metrics.    |
| DOC-003 | P2       | Portfolio/resume materials | No truthful resume pack or screenshot capture workflow exists.                                                                                       | Add capture tooling and resume content only after measurements are produced. |

## Deferred until the backend repository is available

The requested backend hardening, Docker/Compose, Render/Railway blueprint, backend README,
health/readiness endpoints, rate limiting, cookie/CORS policy, environment validation,
Mongo indexes, graceful shutdown, and production static serving require the backend repository.
They must not be simulated or changed in this frontend repository.

## Status

The first hardening batch changed the following findings:

- **Fixed:** CODE-001 (dependencies restored), CODE-002 (source formatting and deterministic
  `check` script), A11Y-001 (shared title/route announcement behavior), A11Y-004 (contrast
  checker and token corrections), UI-001 (pre-first-paint theme bootstrap), RES-001 (shared
  recoverable root boundary/reporting hook), PERF-002 (manual vendor chunk isolation), and
  TEST-004 (frontend CI workflow).
- **Measured:** the production build now reports the entry at 256.13 kB minified/74.00 kB
  gzip, the analytics route at 16.60 kB/5.78 kB gzip, and 41 PWA precache entries. Details
  are in `docs/PERFORMANCE.md`.
- **Deferred:** all backend-dependent items, Lighthouse/browser measurements, manual
  screen-reader verification, full Playwright/axe journeys, dependency major upgrades,
  CSP/server headers, and deployment artifacts. Each remains open above with its reason.
