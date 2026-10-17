# Webapp

Next.js 16 (App Router, Cache Components) + React 19 + TypeScript 7 + Tailwind CSS 4.
The visual design is driven entirely by [`DESIGN.md`](./DESIGN.md).

## 30X challenge: Live segments

A working prototype for the 30X Jev challenge (Commercial area). Every Luma sign-up is sent to
[Jev](https://typesafe.ai), TypeSafe's typed decision model, with eight typed questions in one call
(segment, company stage, AI maturity, urgency, ready to buy, decision power, fit with 30X,
learning intent). Code turns the answers into a traffic light: **green** goes to a seller with a
summary, **yellow** enters an educational sequence, **red** is reviewed by a person. The segment
is re-decided whenever the person attends another event, changes role or their company raises a
round.

- Demo: `/segmentation` · Playbook: [`docs/playbook.md`](./docs/playbook.md)
- APIs: `POST /api/segment` (`{ profile, trigger }`), `POST /api/segment/evaluate` (`{ mode:
  'single' | 'consensus' }`, 60 annotated profiles), `POST /api/segment/simulate` (`{ days }`).
- **Luma, simulated end to end (no Luma account needed):** `POST /api/luma/webhook` behaves like a
  production Luma webhook. It verifies the HMAC `webhook-signature` (`t=…,v1=…` over
  `timestamp.body`, secret `LUMA_WEBHOOK_SECRET`), rejects forged or stale requests (401), ignores
  replays by `webhook-id`, handles `guest.registered` (new segment) and `guest.updated` with
  `checked_in_at` (re-decides as "attended event"), and drops name and email before Jev. Fictional
  guests (`@example.com`) come from **Start Luma sign-ups** on the dashboard or from the terminal:
  `pnpm luma:simulate --count 20 --every 2 [--kind registration|check_in|auto] [--replay] [--tamper]`.
  The dashboard polls `GET /api/luma/feed`. The feed lives in server memory, enough for a
  single-process demo; production would store it in a database.
- Evaluation from the terminal (dev server running): `pnpm jev:smoke`, `pnpm jev:eval [--consensus]`,
  `pnpm jev:simulate [--days 30]`. Reports and the 12:00 cut-off rule live in
  [`docs/evaluation/`](./docs/evaluation/README.md).
- All profiles are simulated. No real personal data is used or stored.

| `JEV_PROVIDER`   | What it does                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| `mock` (default) | Keyword heuristic, runs offline with no key, so anyone can run the demo        |
| `typesafe`       | Real Jev via `https://api.typesafe.ai/v1/systemone` (needs `TYPESAFE_API_KEY`) |
| `openrouter`     | A chat model emulates the answers (needs `OPENROUTER_API_KEY`); not calibrated |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set JEV_PROVIDER and a key to use real Jev
pnpm dev                     # http://localhost:3000/segmentation
```

## Scripts

| Script                         | What it does                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` | Next.js                                                                             |
| `pnpm lint` / `lint:fix`       | oxlint                                                                              |
| `pnpm format` / `format:check` | oxfmt (Prettier-compatible, sorts imports + Tailwind classes)                       |
| `pnpm typecheck`               | `tsc --noEmit` (TypeScript 7)                                                       |
| `pnpm check`                   | lint + format check + typecheck (runs on pre-commit)                                |
| `pnpm design:sync`             | Compiles `DESIGN.md` → `src/design/tokens.generated.css` and validates the contract |
| `pnpm design:lint`             | Lints `DESIGN.md` against the spec (structure, WCAG contrast)                       |

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (enforced by commitlint).

## Changing the design

The design system has three layers, so components never change when the design does:

```
DESIGN.md (front matter tokens)
   │  pnpm design:sync
   ▼
src/design/tokens.generated.css   --ds-* raw values (generated, never edit)
   │
   ▼
src/design/theme.css              semantic roles → Tailwind utilities (bg-primary, text-fg-muted, …)
   │
   ▼
components                        only use semantic utilities
```

- **Tweak a color / size / radius / shadow:** edit the value in `DESIGN.md`, run `pnpm design:sync`.
- **Change the font:** set `fontFamily` in `DESIGN.md`, load it in `src/design/fonts.ts` with
  `variable: '--font-<slug>'` (e.g. `Space Grotesk` → `--font-space-grotesk`), run `pnpm design:sync`.
- **Swap in a whole new DESIGN.md:** replace the file, run `pnpm design:sync`. If the new file uses
  different token names, the command lists every role it can't resolve. Remap those lines in
  `src/design/theme.css` and you're done.

`DESIGN.md` follows the [DESIGN.md spec](https://github.com/google-labs-code/design.md). Token groups the
spec can't hold (`shadows`, `motion`, `zIndex`, `breakpoints`) live in the Impeccable sidecar
`.impeccable/design.json` under `extensions`. A group defined directly in `DESIGN.md` takes precedence.

## Project structure

```
src/
├── app/                 # Routes only (thin pages, layouts)
├── core/                # App-level infra: config, cx, http (+ server/), query, providers
├── design/              # Tokens, theme contract, fonts, motion
└── features/<feature>/  # Self-contained modules exposed through index.ts
```

## Agent skills

Project skills live in `.claude/skills/` (Noxen, Emil Kowalski, Impeccable). See `CLAUDE.md`.
After cloning, run `/impeccable init` once in Claude Code to set up Impeccable's design context.
