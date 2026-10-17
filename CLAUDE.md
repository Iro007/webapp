@AGENTS.md

# Project guide

Next.js 16 App Router (Cache Components on) · React 19 · TypeScript 7 · Tailwind 4 · pnpm.
Read the relevant guide in `node_modules/next/dist/docs/` before using a Next API (see AGENTS.md).

## Commands

- `pnpm check`: lint (oxlint) + format check (oxfmt) + typecheck. Must pass before finishing a task.
- `pnpm design:sync`: run after any change to `DESIGN.md`, `src/design/theme.css` or `src/design/fonts.ts`.
- `pnpm build`: required for changes touching routing, caching or layouts.

## Product & design context

- `PRODUCT.md`: product truth. Purpose, users and name are still undecided, so never invent them. UI language is English; the Notion-style aesthetic and WCAG 2.2 AA are binding.
- `DESIGN.md`: "The Quiet Workspace" design system (tokens + rules). `.impeccable/design.json` is its sidecar: shadows, motion, z-index and breakpoints (spec-incompatible groups) are read from there by `pnpm design:sync`.

## Design rules (DESIGN.md is the source of truth)

- Never hardcode colors, font sizes, radii, shadows or z-index in components. Use the semantic
  utilities from `src/design/theme.css`: `bg-primary`, `text-fg`, `text-fg-muted`, `bg-surface-accent`,
  `border-border`, `text-display-xl`…`text-caption`, `rounded-md`, `shadow-dropdown`, `z-modal`,
  breakpoints `tablet:` / `desktop:` / `wide:`.
- Need a new value? Add it to `DESIGN.md` front matter → `pnpm design:sync` → map a role in `theme.css`
  (and register custom text/radius/shadow names in `src/core/cx/index.ts`).
- Never edit `src/design/tokens.generated.css`.
- Compose classes with `cx()` from `@/core/cx`, with variants as `Record<Variant, string>` lookups.
- Text contrast must pass WCAG AA: `text-fg-subtle` is for placeholders/hints only, not readable copy.

## Architecture (Noxen skills)

- Pages in `src/app/**/page.tsx` stay thin; feature code lives in `src/features/<feature>/`
  (`components/ hooks/ services/ types/ context/`), exported only through `index.ts`.
  Server-only exports go through `server.ts`.
- No cross-feature imports. App-wide infra lives in `src/core/`.
- Files are kebab-case (lint-enforced), one component per file, max ~200 lines.
- Server Components by default; push `'use client'` as far down as possible.

## Stack decisions (load the matching `references/<library>.md` in each skill)

| Concern      | Choice                                                                     | Where                                 |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------- |
| Styling      | Tailwind 4 + CSS variables                                                 | `styling` → `tailwind.md`             |
| Forms        | react-hook-form + zod (`@hookform/resolvers`)                              | `forms`                               |
| Server state | TanStack Query (`getQueryClient`, `AppProviders`)                          | `data-fetching` → `tanstack-query.md` |
| Client state | Zustand, per-feature stores, only when Context isn't enough                | `state-management` → `zustand.md`     |
| Modals       | Radix Dialog wrapped by nice-modal-react (`NiceModal.Provider` is mounted) | `modals`                              |
| Tables       | TanStack Table (headless)                                                  | `data-table`                          |
| HTTP         | Own `fetch` client: `http` (client) / `httpServer` (`@/core/http/server`)  | `http-layer`                          |
| Auth         | Cookie `SESSION_TOKEN_KEY` is the truth; `AuthProvider` + `getSessionUser` | `auth-flow`                           |

The HTTP clients convert snake_case ⇄ camelCase in interceptors, so services never convert.
`httpServer` reads cookies: under Cache Components its callers must render inside `<Suspense>`
(or use `'use cache: private'`). Auth isn't wired into the layout yet. Do that inside a Suspense
boundary when the first protected route exists.

## Skills in `.claude/skills/`

- **Noxen:** `noxen` (repo overview), `app-router` (load first), `architecture`, `ui-architecture`,
  `react-patterns`, `typescript`, `styling`, `code-constraints`, `forms`, `data-fetching`,
  `data-table`, `state-management`, `modals`, `http-layer`, `auth-flow`.
- **Emil Kowalski (UI/motion):** `emil-design-eng`, `animate`, `animation-performance`,
  `animation-vocabulary`, `improve-animations`, `review-animations`, `find-animation-opportunities`,
  `apple-design`, `break-ui`, `pick-ui-library`, `prototype`.
- **Impeccable:** `impeccable` (design quality + detector hook). Check pages with
  `.claude/skills/impeccable/scripts/impeccable detect http://localhost:3000`.

## Temporary: dashboard preview (delete when the real product exists)

`/preview` is a throwaway dashboard with synthetic data. To remove it completely:

1. Delete `src/app/preview/` and `src/features/dashboard-preview/`.
2. Remove the `<Button asChild>` link to `/preview` in `src/features/coming-soon/components/coming-soon.tsx` and `previewCta` in `src/core/config/site.ts`.
   Keep `src/ui/button/`; it's the shared button primitive (`<Button asChild variant="primary"><Link …/></Button>`).

## Jev (30X challenge prototype)

- `src/core/jev/` is the server-only Jev client: `decide({ state, questions })` routes to the adapter picked by
  `JEV_PROVIDER` (`mock` default, `typesafe` real Jev at `/v1/systemone`, `openrouter` LLM emulation, not calibrated).
- `src/features/segmentation/` is the whole product: "Live segments" at `/segmentation` (`POST /api/segment`,
  `/api/segment/evaluate`, `/api/luma/webhook`). Questions, traffic-light thresholds and recommendations live in
  its `config/`. Data is simulated only; never add real personal data.
- Evaluation set: `src/features/segmentation/evaluation/profiles.json` + `answers.json` (ground truth, server-only,
  never sent to Jev). Run `pnpm jev:smoke | jev:eval [--consensus] | jev:simulate` with the dev server up;
  reports go to `docs/evaluation/`.
- Its UI copies the `/preview` dashboard shell into `components/shell/` (no cross-feature imports). Keep it visually
  identical to `/preview` and never edit `dashboard-preview`, the home page or `src/ui` for this feature.
- Luma is simulated end to end: signed webhooks hit `/api/luma/webhook` (HMAC check, replay guard, server-memory feed
  read by `/api/luma/feed`). `pnpm luma:simulate` sends them from the terminal. Guests are fictional (`@example.com`).
- Jev cannot count or compare dates: turn counters into categories in code first (`services/profile-state.ts`).
- The playbook for the challenge is `docs/playbook.md`.

## No comments

Do not write comments in code by default. This applies to every file in this repo (`src/`, `scripts/`).

- No explanatory comments describing what the code does — a well-named function, variable, or type already does that.
- No comments narrating a fix, a task, or a caller ("fixes the reset bug", "used by the settings page") — that belongs in the commit message or PR description, not the code.
- If a comment feels necessary to explain why something non-obvious is done, that is a signal to make the code itself clearer (rename, extract a function, simplify), not to add a comment.

Allowed exceptions:

- JSDoc on shared public APIs (`src/ui`, `src/core`) that genuinely needs documented parameters or return values.
- `// SAFETY:` — why an assertion or unsafe operation is sound.
- `// NOTE:` — a non-obvious business or platform constraint the code cannot express.
- Lint and tool directives with a reason, for example `// oxlint-disable-next-line rule -- reason`.

When editing a file, remove any comment that is not one of those exceptions.
A comment in Spanish or any language other than English is a separate violation of No mixed languages.

## Long lists use Combobox

Any selection field with a long list of options must use Combobox, never Select.

- "Long" means 8 or more options, or any list whose length is data-driven and can grow — categories, breeds, roles, services, users.
- If a list is populated from the API, use Combobox from the start even when it looks short today. It will grow.
- Select is only for short, fixed lists that will never grow — a handful of statuses, yes/no, a size or sex choice.
- The point of Combobox is type-to-filter. Forcing someone to eye-scan a long dropdown is the failure mode this rule exists to prevent.
- Default to filtering an existing list only. Do not enable `allowCustomValue` unless the field genuinely accepts free text.

## Hook filenames

Every file whose primary export is a hook must be named `use-*.ts` — e.g. `use-provider-query.ts`, `use-schedule-day-actions.ts`. This applies everywhere: `features/*/hooks/`, hooks colocated next to components, and shared folders.

Exception: zustand stores (`*-store.ts`, e.g. `auth-store.ts`) keep their name even though they export a hook.

## Commits and pull requests

Create commits and PRs through the `git-publisher` subagent (`.claude/agents/git-publisher.md`), which runs on the cheapest Claude model (Haiku). Do not write commits or PRs with the main model. Other agents follow the commit and PR format in this section.

### Commits

- Follow Conventional Commits: `<type>(<scope>): <description>` (e.g. `feat(settings): add archive button`, `fix(drawer): close on Escape`). Types: feat, fix, docs, chore, refactor, test, style, perf, ci, build.
- The title must be short — one line, no filler.
- The commit message is the title only. Do not add a body/description under the title.

### Pull requests

Titles must follow one of these forms, in priority order:

1. `[TICKET] Description` when there's a ticket, e.g. `[LUNA-29] Fix settings drawer`.
2. `[Feature/Change Part] Description` when there's no ticket but the feature or area the change touches is identifiable, e.g. `[Settings] Add archive button`.
3. `[VERB] Description` only when there's no ticket and the feature/area can't be pinned down, e.g. `[Fix] Settings drawer closes on Escape`.

Keep the description short and specific — no filler. Titles are at most 72 characters and match `^\[[^][]+\] .+$`.

- Keep the body short and clear: a couple of bullet points on what changed, nothing more.
- Do not include a "Test Plan" section in the body.
