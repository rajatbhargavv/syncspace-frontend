# Accessibility Verification

## Automated checks

- `npm run check:contrast` checks 56 text/status/accent token pairs across four themes and
  both modes. The current result is 56/56 passing WCAG AA normal-text contrast.
- `npm run check` runs TypeScript, ESLint, Prettier, contrast, Vitest, and the production build.
- The application has a skip link, visible `:focus-visible` styling, reduced-motion CSS,
  route announcements, and page-main focus management.

## Manual verification

The NVDA/VoiceOver smoke test is **pending** because this environment does not provide a
screen-reader session. Before release, verify login, creating a space, switching board/list/
calendar views, opening a task drawer, composing a mention, opening notifications, and
changing settings with keyboard-only navigation and a screen reader. Record the browser,
screen reader, date, and any defects here.

## Known gaps

Playwright axe coverage for every primary route, drag-and-drop announcements, and calendar
arrow-key behavior still require the real backend/demo environment and are tracked in
`docs/AUDIT.md`.
