# Taskora

**Plan smarter. Focus deeper. Achieve more.**

A modern productivity and project management platform to organize tasks, manage projects, plan your day, stay focused, and track productivity with an intuitive, responsive interface and multilingual support.

Taskora is a smart productivity and project-management app built as a frontend-only React application. It combines project management with a daily planner, Kanban boards, a focus timer, template-based goal planning and productivity analytics, in a polished SaaS-style interface with light and dark themes.

All data lives in your browser (`localStorage`). There is no backend, no account and no external API. A public landing page at `/` introduces the product, and the app itself opens with a realistic demo workspace so every feature can be explored immediately. The whole interface is available in **English, Hindi (हिन्दी) and Gujarati (ગુજરાતી)**.

![Taskora landing page](docs/screenshots/landing.png)

![Taskora dashboard](docs/screenshots/dashboard.png)

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Data persistence](#data-persistence)
- [Testing](#testing)
- [Internationalization](#internationalization)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

---

## Features

| Area | What you can do |
| --- | --- |
| **Landing page** (`/`) | Public product page: sticky navbar with section links, language picker and theme toggle; a hero with an animated product preview; a product tour (mini Kanban); features; how it works; benefits (demo-workspace figures, clearly labeled); FAQ; and a footer with a dynamic year. **Open Taskora** goes straight to `/dashboard` — there is no login. Entrance animations are short and staggered, sections fade in once on scroll (`IntersectionObserver`), and everything is static under `prefers-reduced-motion`. |
| **Dashboard** (`/dashboard`) | Time-of-day greeting, live stats (due today, completed in 7 days, overdue, active projects). The stat cards link to the matching pages. Also shows a weekly created-vs-completed chart, today's top priorities, upcoming deadlines, recent activity, project progress and a quick link to Focus Mode. |
| **My Day** (`/today`) | Plan any date (URL `?date=`). Sections for Overdue, the selected day, Upcoming (7 days) and Completed. Includes a week strip, quick add, priority and project filters, a progress ring, up to **three pinned priorities**, and drag-to-reorder by mouse, touch or keyboard. |
| **Projects** (`/projects`) | Grid and list layouts (remembered), search, status filter (also via `?status=`), and sorting by name, due date, progress or last update. Create and edit projects with color, icon, status and dates. Deletion is confirmed and safe. |
| **Project workspace** (`/projects/:id`) | Header with progress and task statistics, search plus priority and tag filters, and four views (remembered): **Board**, **List**, **Calendar** and **Insights** (completion, status breakdown, overdue work and focus time for that project). |
| **My Tasks** (`/tasks`) | Every task across all projects and the Inbox in one sortable table, with search, quick filters (open, due today, overdue, completed) and status, priority, project and due-date filters. |
| **Kanban board** | Backlog, To Do, In Progress and Done columns using `@dnd-kit`. Drag between and within columns with a mouse, touch (long press) or the keyboard (Space, then arrow keys). Includes screen-reader announcements and a drag overlay. Cards show priority, due date, subtask progress, estimate and tags. |
| **Tasks** | One shared create/edit form (React Hook Form + Zod) with title, description, project, status, priority, start/due dates, tags, estimate and subtasks. A detail dialog has quick status and priority changes, a subtask checklist, delete with confirmation and a "Focus on this task" shortcut. Completing a task shows an **Undo** toast. |
| **Calendar** | Month grid with tasks on their due dates. Completed and overdue tasks are styled differently. You can move between months, use arrow keys to move between days, open the selected day's task list and create a task for that date. Phones show dots instead of task chips. |
| **Focus Mode** (`/focus`) | Large countdown ring, focus and break modes, presets or custom lengths, and start/pause/resume/reset. You can link a task or pick one from today's priorities. Also includes a completion screen, today's and total stats, session history and a full-screen distraction-free mode. |
| **Smart Plan** (`/smart-plan`) | Turns a goal such as "Launch my personal portfolio website" into an editable checklist using **local templates** (9 categories, keyword matching). You can choose steps and edit their title, priority, estimate and due date. Steps then go into a new project, an existing project or the Inbox. Duplicates are detected and skipped. |
| **Insights** (`/insights`) | 7, 30 or 90-day ranges. Shows tasks completed, completion rate, overdue count, average completion time (with 3 or more samples), focus sessions and focus time. Charts cover created vs completed, a weekly trend, open tasks by priority, an activity heatmap and a project progress comparison. Every chart has a data-table view and a screen-reader summary. |
| **Command palette** | `Ctrl + K` / `⌘ + K` opens a searchable list of commands, projects and tasks. Commands include create task, create project, navigation and theme toggle. Use arrow keys to move, Enter to run and Escape to close. Press **N** for a new task when you are not typing. |
| **Settings** (`/settings`) | Display name, **interface language**, light/dark/system theme, week start day, default priority, show-completed toggle, default focus and break lengths, and an optional completion chime (off by default). Data tools: **export JSON**, **import JSON** (fully validated before anything changes) and **reset to demo data**. |
| **Layout** | Compact, professional design. The collapsible sidebar (remembered) groups pages into Workspace, Productivity and Personal sections and lists active projects. A sticky header with breadcrumbs, search, notifications (overdue and due-today tasks) and a profile menu. On mobile, a slide-out navigation drawer and horizontally scrolling Kanban columns. |

> **About "Smart" Plan:** suggestions are template-based and deterministic. **No AI service is used.** The UI talks to a `TaskPlanner` interface, so an AI-backed planner could replace the template planner later without UI changes (see [Future improvements](#future-improvements)).

---

## Screenshots

Captured from the built-in demo workspace.

| | |
| --- | --- |
| ![Dashboard (dark)](docs/screenshots/dashboard-dark.png) **Dashboard, dark theme** | ![Kanban board](docs/screenshots/kanban-board.png) **Project Kanban board** |
| ![My Day](docs/screenshots/my-day.png) **My Day planner** | ![My Tasks](docs/screenshots/my-tasks.png) **My Tasks** |
| ![Projects](docs/screenshots/projects.png) **Projects** | ![Calendar](docs/screenshots/calendar.png) **Project calendar** |
| ![Project insights](docs/screenshots/project-insights.png) **Project Insights tab** | ![Insights](docs/screenshots/insights.png) **Productivity Insights** |
| ![Focus Mode](docs/screenshots/focus-mode.png) **Focus Mode** | ![Smart Plan](docs/screenshots/smart-plan.png) **Smart Plan** |
| ![Settings](docs/screenshots/settings-language.png) **Settings with language picker** | ![Landing page in Hindi](docs/screenshots/landing-hindi.png) **Landing page in Hindi** |
| ![Dashboard in Hindi](docs/screenshots/dashboard-hindi.png) **Dashboard in Hindi** | ![My Day in Gujarati](docs/screenshots/my-day-gujarati.png) **My Day in Gujarati** |
| ![Kanban in Gujarati](docs/screenshots/kanban-gujarati.png) **Board in Gujarati** | ![Mobile landing](docs/screenshots/mobile-landing.png) ![Mobile dashboard](docs/screenshots/mobile-dashboard.png) ![Mobile My Day](docs/screenshots/mobile-my-day.png) **Mobile** |

---

## Technology stack

| Concern | Choice |
| --- | --- |
| UI | React 19 + TypeScript 6 (strict, `noUncheckedIndexedAccess`) |
| Build & dev server | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), CSS-variable design tokens |
| Routing | React Router 7 (data router, lazy-loaded pages) |
| State | Redux Toolkit 2 + React Redux 9 (entity adapters, memoized selectors) |
| Forms & validation | React Hook Form 7 + Zod 4 (`@hookform/resolvers`) |
| Drag and drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Charts | Recharts 3 |
| Dates | date-fns 4 |
| Icons | Lucide React |
| Toasts | Sonner |
| Internationalization | i18next 26 + react-i18next 17, flat JSON dictionaries, `Intl` for dates and numbers |
| Tests | Vitest 5 + React Testing Library + jsdom |
| Linting | ESLint 10 + typescript-eslint (type-checked) + React Hooks + React Refresh |

No other runtime dependencies.

---

## Getting started

**Requirements:** Node.js 20.19+ (developed on Node 24) and npm 10+.

```bash
git clone https://github.com/kishanpatel00/taskora.git
cd taskora
npm install
npm run dev
```

Open <http://localhost:5199> (the URL Vite prints).

### Environment (`.env`)

Server and URL settings come from a `.env` file in the project root. It is ignored by Git, so each machine keeps its own. Without it, the defaults below apply:

```bash
# Public URL of the app, used for canonical and social-share links
VITE_APP_URL=http://localhost:5199
# Port for `npm run dev` and `npm run preview`
APP_PORT=5199
# Host to bind (0.0.0.0 to reach the dev server from other devices)
APP_HOST=localhost
```

- If `APP_PORT` is busy, the server stops with an error instead of silently switching ports. Free the port or change `APP_PORT`.
- An invalid `APP_PORT` (not a whole number from 1 to 65535) is rejected with a clear message.
- Only `VITE_*` values are included in the browser bundle, and they are public, so never put secrets in `.env`.
- On a host such as Netlify or Vercel, set `VITE_APP_URL` to your production URL in the host's environment settings.

On first launch, Taskora creates the demo workspace and saves it to `localStorage`. Your changes persist across reloads. To start over, use **Settings → Your data → Reset demo data**.

---

## Scripts

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript project check only |
| `npm run lint` | ESLint (type-aware rules) |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run i18n:check` | Validate translation files: flat, identical keys, no duplicates or empty values, matching placeholders |

---

## Project structure

```
taskora/
├── README.md
├── LICENSE
├── docs/screenshots/       # Screenshots used in this README
├── index.html          # Applies the saved theme before first paint (no flash)
├── vite.config.ts      # Vite, Tailwind, path alias, vendor chunks, Vitest
├── eslint.config.js
└── src/
    ├── main.tsx        # Bootstraps the store, starts persistence, renders <App/>
    ├── app/            # App shell: providers, router, lazy pages, bootstrap, global dialogs
    ├── components/
    │   ├── ui/         # Design-system primitives: Button, Input, Select, Modal, ConfirmDialog,
    │   │               # Popover, Dropdown, Tabs, Tooltip, Badge, Card, Progress, Switch, …
    │   ├── layout/     # AppLayout, Sidebar, Header, Breadcrumbs, MobileNavigation, PageContainer
    │   ├── shared/     # PageHeader, SearchInput, PriorityBadge, StatusBadge, DueDate, Logo, …
    │   └── charts/     # ChartCard (with table view) and ChartTooltip
    ├── features/
    │   ├── landing/    # Public landing page: sections, product preview, scroll Reveal, content data
    │   ├── tasks/      # taskSlice, selectors, utils, form schema, TaskForm, dialogs, Kanban, list view, My Tasks
    │   ├── projects/   # projectSlice, selectors, utils, pages, cards, form/delete dialogs
    │   ├── planner/    # My Day page, pinned priorities and manual day ordering
    │   ├── calendar/   # Month calendar view
    │   ├── focus/      # Timer math, focusSlice, timer watcher, Focus page
    │   ├── smart-plan/ # Plan templates, import rules, Smart Plan page
    │   ├── insights/   # Analytics calculations, heatmap, charts, Insights page
    │   ├── dashboard/  # Dashboard metrics and widgets
    │   ├── settings/   # settingsSlice, theme sync, Settings page, data tools
    │   └── command-palette/
    ├── i18n/           # i18next setup, language config, typed keys, useTranslation hook, locale tests
    ├── locales/        # en.json, hi.json, gu.json — flat translation dictionaries
    ├── services/       # storage.service, export.service, task-planner.service, persisted schema
    ├── store/          # Store setup, typed hooks, persistence subscriber, shared actions
    ├── lib/            # Dates, formatting, ids, validation, focus helpers, platform, sound
    ├── hooks/          # useToday, useDocumentTitle, useGlobalShortcuts
    ├── data/           # Deterministic demo data (user content, never translated)
    ├── styles/         # Tailwind entry + design tokens (light & dark)
    ├── types/          # Shared primitive types
    └── test/           # Test setup, factories, render helper
```

Tests sit next to the code they cover (`*.test.ts[x]`).

---

## Architecture

### Layers

```
 UI (pages, components)  ──reads──▶  memoized selectors  ◀──  Redux store (slices)
          │                                                     ▲        │
          └──dispatches actions─────────────────────────────────┘        │ subscribe (debounced)
                                                                          ▼
                     services (storage, export/import, task planner)  ──▶  localStorage
```

- **Pages compose; features own their logic.** Page components mostly arrange feature components. Business rules live in pure, tested modules: `taskUtils`, `projectUtils`, `timer`, `insightsUtils`, `dashboardMetrics` and `planImport`.
- **Redux holds only source data:** tasks, projects, planner pins/order, focus sessions plus timer state, and settings. Derived values such as project progress, dashboard metrics and analytics are always computed by memoized selectors or `useMemo` and never stored.
- **Normalized entities.** Tasks and projects use `createEntityAdapter`. Relationships use ids (`task.projectId`), and timestamps and ids are generated in action `prepare` callbacks so reducers stay pure.
- **Cross-slice rules live in reducers.** For example, deleting a project moves its tasks to the Inbox, and deleting a task removes it from pinned priorities and the focus timer. A single `app/dataReplaced` action, used by import and reset, is handled by every slice.
- **Transient UI state stays local.** Filters, open menus and drag previews use component state. App-wide dialogs (task create/edit/detail, project create/edit) live in a small `DialogsProvider` context, so the header, command palette, keyboard shortcuts and any page can open them.
- **Persistence is separate from reducers.** See [Data persistence](#data-persistence).

### Design system

`src/styles/index.css` defines semantic tokens (`--bg`, `--surface`, `--fg`, `--line`, `--brand`, `--accent`, chart series and ramps) for light mode and redefines them under `.dark`. Tailwind exposes them as utilities (`bg-surface`, `text-fg-2`, `border-line`, …), so a single class on `<html>` themes the whole app. The palette uses white and slate surfaces, an indigo primary and violet highlights.

The look is compact and professional: a tight type scale (11.5–22 px), small radii (`rounded-control` 4 px, `rounded-menu` 6 px, `rounded-panel` 8 px), flat shadows and consistent 1.8-stroke Lucide icons. Status and priority are shown as plain text with a dot or flag icon rather than boxed badges, and completed tasks read "Done" instead of being struck through. Component variants (button `variant`/`size`, input `size`, `ModalBody flush`) are used instead of overriding base classes. Animations are subtle and disabled under `prefers-reduced-motion`.

Chart colors were checked for color-vision-deficiency separation and contrast on both themes. Ordinal and sequential data (priority, heatmap) use a single-hue indigo ramp, and every chart can switch to a data table.

### Key implementation notes

- **Timer accuracy.** The timer never counts interval ticks. It stores `runningSince` and `elapsedBeforeMs`, and remaining time is computed from `Date.now()`. Throttled background tabs, missed ticks and re-renders therefore cannot drift it. A single `FocusTimerWatcher` in the layout schedules completion at the exact end time, so a session finishes correctly on any page, after the tab wakes up, or right after a reload (using the real end time). Only one display interval runs, and only while the timer is running.
- **Kanban consistency.** During a drag, a local copy of the columns gives instant feedback. On drop, a single `taskMoved` action renumbers the column. Drops in a filtered board are mapped back to positions in the full column, so hidden tasks keep their order and records are never duplicated.
- **Accessible overlays.** Modal, Popover, Dropdown, drawer and command palette trap focus, close on Escape, restore focus to the trigger and lock background scroll. Menus render in a portal so scroll containers never clip them.
- **Code splitting.** Each app page is lazy-loaded, and vendor code is split into long-lived chunks (react, state, forms, charts). Recharts downloads only with the Dashboard or Insights. The landing page is bundled eagerly so a hard refresh on `/` never shows a blank frame.
- **Routing.** `/` is the landing page; `/dashboard`, `/today`, `/tasks`, `/projects`, `/projects/:projectId`, `/focus`, `/smart-plan`, `/insights` and `/settings` live inside the app layout, and unknown paths show a not-found page. Every route works on a hard refresh as long as the host falls back to `index.html` (see [Deployment](#deployment)).

---

## Data persistence

Taskora is **frontend-only**. Everything is stored in the browser under one versioned key:

| Key | Contents |
| --- | --- |
| `taskora:data` | `{ version, tasks, projects, focusSessions, timer, planner, settings }` |
| `taskora:backup:<timestamp>` | A copy of unreadable data, kept if loading ever fails |
| `taskora.language` | The interface language (`en`, `hi` or `gu`). Missing or invalid values fall back to English. |

**How it works**

1. **Startup (`app/bootstrap.ts`)**
   - Valid saved data is loaded, and demo data never overwrites it.
   - If nothing is saved yet, the demo workspace is created and saved.
   - If saved data is unreadable, it is backed up under a separate key, demo data is loaded, and a notice explains what happened.
   - If storage is unavailable (for example in private modes), the app runs in memory and warns that changes won't be saved.
2. **Validation (`services/persistedData.ts`)**
   - Zod schemas check every field, the same way for stored data and imported files.
   - Invalid settings fall back to their defaults individually.
   - Dangling references are repaired: a task pointing to a missing project moves to the Inbox, and stale pinned ids are dropped.
   - Duplicate ids are rejected. A `migrate()` step is in place for future schema versions.
3. **Saving (`store/persistence.ts`)**
   - A store subscriber writes only when the state reference changes, so there are no save loops.
   - Writes are debounced (400 ms) and flushed when the page is hidden or closed.
   - Quota or write failures show a single error toast instead of crashing.
4. **Dates**
   - Calendar dates are stored as local `yyyy-MM-dd` strings.
   - Moments (created, updated, completed, sessions) are stored as ISO-8601 timestamps.
   - The timer uses epoch milliseconds.

**Export and import (Settings → Your data)**

- **Export** downloads the same JSON document that is stored locally.
- **Import** parses and validates the file first, shows what it contains and what it will replace, and only changes state after you confirm.

---

## Testing

```bash
npm test
```

The suite currently runs **98 tests in 11 files** (97 pass; one check, "not copied from English", is skipped for English by design):

| Area | Coverage |
| --- | --- |
| Task reducer | Create (trimming, tag normalization, subtask ids, ordering, duplicate-id guard), edit, `completedAt` transitions, subtasks, delete (also clears pins), drag-and-drop moves and renumbering, project-deletion policy |
| Task utilities | Search and filters, sorting (undated tasks last, no mutation), My Day date grouping, overdue detection, manual ordering |
| Projects | Progress calculation, memoized progress selector on demo data, filtering and sorting |
| Task form | Zod rules (required title, date order, estimate, empty subtasks, invalid dates). React Testing Library flows for validation messages, kept values, a full submit with tags and subtasks, creating a task through the real dialog (focus on open, store updated), and closing with Escape (focus restored) |
| Persistence | Load/save round trip, malformed JSON, invalid structure, quota errors, missing storage, reference repair, settings fallback, duplicate ids, first-launch seeding, never overwriting saved data, backup of corrupt data, debounced subscriber, flush on `pagehide`, error reporting |
| Focus timer | Timestamp-based remaining time, pause segments, progress and expiry, the full start → pause → resume → complete lifecycle, recording interrupted sessions (one minute or more), locking configuration while running |
| Smart Plan | Category detection, deterministic plans, forced category, duplicate detection, import filtering and validation |
| Import | Accepting exported files and rejecting invalid JSON, wrong shapes, unsupported versions and invalid fields (with path), leaving state untouched until applied |
| Translations | Every locale file is flat with non-empty string values and `category_feature_element` keys; all three files have identical key sets and matching `{{placeholders}}`; Hindi and Gujarati are genuinely translated (not copies of English); every translation key referenced in source code exists in `en.json`; switching language translates, interpolates, sets `<html lang>` and persists, and invalid stored values fall back to English; English, Hindi and Gujarati Smart Plan example goals each map to their own template |

The main user journeys were also exercised end to end in a real browser (Microsoft Edge) during development:

- The landing page at `/`: document title, footer year, scroll reveal, FAQ anchor and disclosure, and **Open Taskora** → `/dashboard`
- A hard refresh on `/dashboard` and on a project route keeps the route; unknown routes show the not-found page
- Switching language on the landing page and in Settings, persistence after reload, and no raw translation keys on any Hindi or Gujarati screen
- A Gujarati goal generating the website plan in Gujarati
- Reduced motion: content is fully visible with no animation or hidden sections
- No horizontal overflow at 1440, 1280, 1024, 768, 390 and 360 px (landing, dashboard, project board and settings, in English and Gujarati)
- Navigation and the command palette
- Task creation updating the dashboard
- Reload persistence
- Keyboard and mouse drag-and-drop
- The task detail dialog
- The focus timer counting down and surviving a reload
- Smart Plan import
- Theme persistence
- No horizontal overflow at 390 px on every app page, plus the mobile drawer

That browser script isn't part of the repository; see [Future improvements](#future-improvements).

---

## Internationalization

Taskora ships in **English (`en`, default and fallback), Hindi (`hi`) and Gujarati (`gu`)**. Formatting uses the locales `en-IN`, `hi-IN` and `gu-IN`.

- **Dictionaries.** `src/locales/{en,hi,gu}.json` are flat key–value files (no nesting) with keys named `category_feature_element`, for example `dashboard_stat_overdue` or `landing_hero_title`. Plurals use the `_one` / `_other` suffixes and are called with `count`. Values are strings with `{{name}}`-style placeholders.
- **API.** `useTranslation()` from `src/i18n/useTranslation.ts` returns `{ t, language, setLanguage, languages }`. `t` is typed against `en.json`, so an unknown key is a compile error. Non-React code (toasts, date and number helpers, the Smart Planner) uses `i18n.t`.
- **Choosing a language.** Use the picker in **Settings → Language**, or in the landing-page navbar and footer. The change applies instantly, updates `<html lang>` and is saved under `taskora.language`.
- **Formatting.** Dates, weekdays, months, relative times ("3 hours ago") and numbers use `Intl` with the active locale. Durations and relative labels such as "Today" come from the dictionaries.
- **What is never translated.** Content you create — task, project, subtask and tag names, descriptions and your display name — stays exactly as written. The demo workspace counts as user content and is in English.
- **Validation messages.** Zod schemas return translation keys, and the form `Field` component translates them, so errors follow the current language.
- **Smart Planner.** Templates have English, Hindi and Gujarati keywords, and generated steps are written in the current UI language.

**Adding a key or a language**

1. Add the key to `en.json`, then to `hi.json` and `gu.json` with the same placeholders.
2. For a new language, add an entry to `LANGUAGES` in `src/i18n/language.config.ts`, add its JSON file and register it in `src/i18n/index.ts`.
3. Run `npm test`. The locale test fails on missing, extra, empty or untranslated keys, placeholder mismatches, or keys used in code but missing from `en.json`.

---

## Accessibility

- Semantic landmarks, skip links (app and landing page), `lang` on `<html>` that follows the selected language, labeled controls and `aria-describedby` error messages
- Visible focus rings, and full keyboard support for menus, tabs, dialogs, the command palette, calendar days and Kanban/My Day drag-and-drop
- Live-region announcements while dragging. Status is never shown by color alone (text labels and icons are always present).
- Chart summaries for screen readers, plus a table view for every chart
- Respects `prefers-reduced-motion` and `prefers-color-scheme` (System theme)

---

## Deployment

The production build is a static site:

```bash
npm run build      # output: dist/
npm run preview    # optional local check
```

Deploy `dist/` to any static host. Because routing is client-side, the host must serve `index.html` for unknown paths so that a refresh on `/dashboard` or `/projects/:id` works. The fallbacks for Netlify and Vercel are already included:

- **Netlify:** set the build command to `npm run build` and the publish directory to `dist`. `public/_redirects` (`/*  /index.html  200`) is copied into the build.
- **Vercel:** use the Vite preset. `vercel.json` rewrites every path to `/index.html`.
- **GitHub Pages:** build with `npx vite build --base=/<repo-name>/` and use a `404.html` copy of `index.html` for deep links.

No environment variables or secrets are required.

---

## License

Released under the [MIT License](LICENSE).

---

## Known limitations

- **Single browser, single user.** Data lives in this browser's `localStorage` only. There is no sync, collaboration, account or authentication. Clearing site data erases it, so export a backup regularly.
- **Storage size.** `localStorage` usually allows about 5 MB, which is plenty for thousands of tasks but not unlimited. Write failures are reported.
- **Smart Plan uses templates, not AI.** Matching is keyword-based across 9 categories and does not understand arbitrary goals.
- **Timer completion needs the app open.** A session that ends while Taskora is closed is recorded with its correct end time the next time the app opens. No system notification is shown. An optional chime plays only if enabled and the app is open.
- **No recurring tasks, reminders or time-of-day scheduling.** Due dates are calendar days.
- **Analytics only cover what has been recorded.** Completion timestamps and focus sessions are tracked from the moment tasks are used. History is never invented, apart from the clearly labeled demo workspace.
- **Drag-and-drop ordering in My Day** is turned off while filters hide part of the day's list, to avoid ambiguous positions.

---

## Future improvements

- An AI-backed `TaskPlanner` implementation (the interface in `services/task-planner.service.ts` is already provider-agnostic)
- Optional cloud sync with a backend and authentication, replacing `storage.service` behind the same interface
- Recurring tasks, reminders with opt-in browser notifications, and time blocking in My Day
- Task dependencies and a timeline (Gantt) view
- Committed end-to-end tests (Playwright) and visual regression tests
- PWA installability and offline caching
- More languages, including a right-to-left language (the language config already carries a `dir` field), and lazy-loading dictionaries once there are many
