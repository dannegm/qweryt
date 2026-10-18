# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**qweryt** ("QR it") — free, fully customizable QR code generator. Mobile-first installable PWA with its own desktop layout. Deployed on Vercel at `qweryt.hckr.mx`. `PLAN.md` holds the original spec and phase list.

Everything is public and anonymous (identity pattern of pinia/filapp, no Supabase Auth). Every saved QR has a public page `/q/<nanoid>`; the creator is whoever's `settings.user.id` matches `qrs.profile_id` (enforced in the UI only, RLS is open). URLs are stored as typed — no tracking, no redirects of our own. Shortening is an opt-in switch (off by default) that calls the black-box shortener at `https://s.hckr.mx/shorten`.

Routes: `/` (library of wallet-style cards + search), `/new`, `/q/$id` (public detail + download), `/q/$id/edit` (owner only), `/q/$id/duplicate`, `/settings` (identity, share settings link, clear data).

Commands: `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm format`. The service worker only registers in production builds.

## Stack

- React 19 + Vite 8, plain JavaScript (JSX) — no TypeScript, ever. pnpm, Node 24.
- TanStack Router (code-based tree in `src/router.jsx`), TanStack Query, nuqs (`q` search param).
- Tailwind CSS v4 (CSS config in `src/css/index.css`), shadcn/ui on base-ui primitives (not Radix), Lucide, sonner, date-fns, fuse.js, nanoid.
- `qrcode-generator` only produces the module matrix (wrapped in `engine/matrix.js`); everything visual is our own SVG renderer.
- `react-i18next`, English only for now (`src/locales/en.json`).
- Supabase (Postgres), dedicated schema `qweryt` — must be exposed in Supabase → Settings → API → Exposed schemas. Same project as bins/pinia/filapp.

## Architecture (each layer only knows the ones below)

1. **`src/engine/`** — pure JS, no React/DOM/Supabase. `style.js` (defaults, enums, `normalizeStyle` which sanitizes everything coming from the DB — colors, enums, numbers, logo data URI — because rows are writable by anyone), `matrix.js`, `shapes.js` (path builders), `render.js` (`renderQr(text, style)` → `{ svg, ecc, guards }`, fixed 1024 viewBox output size, QR size is never user-editable), `guards.js` (contrast / logo-size / ECC warnings as `{ code, level, params }`), `export.js` (SVG → PNG/JPG via canvas; the only browser-bound file). QR images are always displayed through `<img src="data:image/svg+xml…">`, never injected as HTML.
2. **`src/content-types/`** — registry of data: `{ id, icon, initial, fields, encode, validate, update?, summary, suggestTitle }`. Adding a type = one file + one line in `index.js` + its i18n labels (`types.<id>.*`). URL type holds `{ url, shorten, short_url }`; `encode` returns `short_url` only when `shorten` is on. Validation returns `{ field: code }` (`required` | `invalid` | `pending`).
3. **`src/style-options/`** — registry of controls `{ key, path?, group, control, options|min/max/step, visible?, preview? }`. The Customize tab is generated from it; the dice (`randomizeStyle`) randomizes everything except content and logo (and ECC). A new option needs: default + sanitizer in `engine/style.js`, drawing support in the renderer, one registry entry, i18n (`style.<key>.*`).
4. **Editor (`components/editor/`)** — `QrEditor` edits a local draft `{ type, content, style, cardColor, title }` and doesn't care whether it creates, edits or duplicates; only the initial draft and the save mutation differ. Preview is sticky on top (mobile) / left column (desktop `lg:`).
5. **Pickers vs containers** — `ColorSelector`, option grids etc. are content-only; containers come from `ui/responsive-popover.jsx` (Drawer on mobile, Popover on desktop). Same idea for confirmations (`ui/confirm-drawer.jsx`).
6. **Data (`src/queries/`)** — TanStack Query factories over Supabase; UI never calls Supabase directly. Library list is cached in localStorage (`cache`) as `initialData`.
7. **Platform shell** (ported from filapp/pinia): `ensureIdentity`, `settings`/`cache` (localStorage, cross-tab), share-settings link (`/settings#share=…`, the only backup mechanism — losing the browser's data loses ownership), `DeviceProvider` variants, service worker + `scripts/vite-precache.js`, icon/splash generators, fake iOS home bar.
8. **`src/services/shortener.js`** — `shorten(url)` → `short`. The editor calls it (debounced 600 ms) when the switch is on and the URL is valid; changing the URL requests a new short link.

## Database

- `db.sql` is the canonical self-contained schema (current desired state, not history). `migrations/NNN_slug.sql` is the incremental history. Every schema change goes through the `/migrate` skill (`.agents/skills/migrate`), which creates the next migration AND updates `db.sql`. Never hand-edit `db.sql`.
- Tables: `profiles` (id text nanoid(10), name, color) and `qrs` (id text nanoid(8), profile_id, title, type, `content` jsonb, `style` jsonb, card_color, v). Open RLS ("permitir todo"), grants for anon/authenticated.
- Client: `supabase()` in `src/helpers/supabase.js` (lazy singleton, schema `qweryt`). Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional `VITE_SHORTENER_URL`.

## Code conventions

- JavaScript only. `export const` for everything; no default exports. `useRef` variables use a `$` prefix, no `Ref` suffix. `async/await`, never `.then()/.catch()`.
- `kebab-case` for every file and folder. Components PascalCase, hooks camelCase with `use`.
- `src/components/` domain subfolders; `src/ui/` flat shadcn-style primitives; `src/helpers/`; `src/hooks/`; `src/constants/`; `src/providers/`; `src/queries/`; `src/pages/` one file per page.
- No obvious comments. No hardcoded UI strings: every label goes through `useTranslation` (one hook call per component). Option/field labels follow naming conventions so registries need no label fields: `types.<id>.label|fields.<key>|options.<value>`, `style.<key>.label|options.<value>|hint`, `guards.<code>`.
- Conditional classes via object in `cn()`; runtime values through CSS custom properties (`bg-(--card-color)` + `style={{ '--card-color': color }}`); icon sizing via `[&>svg]:size-X`; `rem` over `px`; every `shadow-*` has an explicit color.
- **Mobile has no dropdowns, popovers or dialogs — everything is a bottom `Drawer`** (`ui/drawer.jsx`; centered at `sm:` and up). Enumerations use chip/preview grids, never a select. Desktop may use popovers via the `responsive-*` wrappers.
- Mobile mechanics: viewport `maximum-scale=1, user-scalable=no, viewport-fit=cover`, `min-h-dvh`, `pt-safe`/`pb-safe`, inputs at 16px, touch targets ≥ 40px. Unprefixed classes are mobile; layer `sm:`/`lg:` for desktop.
- Check `src/ui/` and the shadcn registry before writing custom UI.

## Development process

- One feature at a time: implement, stop, wait for the owner to test manually. No automated tests; all verification is manual.
- After each unit of work, summarize what changed and what to test, then stop.
- Keep this file and `AGENTS.md` in sync.
- Never run `git add`, `git commit`, or push — the owner handles git.
