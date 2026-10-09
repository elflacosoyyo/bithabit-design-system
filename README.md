# BITHABIT Design System

White-label design system for **BITHABIT**, Bakia's habit-tracking platform. One neutral default brand
(BITHABIT) plus any number of client brands (the first is **Plan de Vida**), each shipped as its own app.

It is **not** a component library you import into production. It is the **contract layer between design and development**:

```
 Design (Figma, references)          This repo                          Each app's repo (React Native)
 ───────────────────────────  →  ──────────────────────────  →  ─────────────────────────────────────
 screens, videos, decisions        tokens (3 layers)                  connect.yaml: maps ds:habit-card
                                   component specs (.yaml + .md)      to src/ui/NormItem.tsx
                                   brands (visual overrides)          Claude compares the app's
                                   manifest.json (versions, hashes)   components with the manifest and
                                   Storybook (planned)                SUGGESTS updates. It never forces them.
```

The design system never imports app code and apps never depend on it at runtime. That is the same idea as Figma's
Code Connect: a thin mapping layer that lets developers (and their Claude) keep their own components in sync.

## What is in the repo

| Path | What | Audience |
|---|---|---|
| `tokens/` | Design tokens in the W3C DTCG format, in three layers: **primitive → semantic → component** | design, dev |
| `brands/<id>/` | `brand.yaml` (identity, voice, a11y waivers) + token overrides + assets. A brand only overrides the **semantic** layer | design |
| `src/`, `stories/`, `.storybook/` | Reference React Native components and the **Storybook** catalog (brand and mode switcher, all-brands matrices, spec pages, contrast audit) | design |
| `components/<id>/` | `<id>.spec.yaml` (machine contract) + `<id>.usage.md` (when and why) | dev, dev's Claude |
| `components/inventory.yaml` | Backlog of every component the system will cover | design |
| `schemas/` | JSON Schemas that validate brands and specs | tooling |
| `scripts/` | `build.mjs` (tokens → outputs), `validate.mjs` (linter + WCAG contrast) | tooling |
| `dist/` | **Generated** and committed: theme (JS + d.ts + JSON), CSS variables, a CSS file and Tailwind/NativeWind preset that use the app's existing BitHabit names, `manifest.json` | dev |
| `audit/decisions.md` | Open and closed design decisions, inconsistencies found in the sources | design |
| `docs/` | Architecture, spec format and the consumer guide for app developers | everyone |
| `CLAUDE.md` | How Claude maintains this repo (the maintainer is Claude, guided by the designer) | Claude |

## Quick start

```bash
npm install
npm run check      # tests + validate + build + "dist is up to date"
npm run validate   # linter and WCAG contrast for every brand and mode
npm run build      # regenerate dist/
npm run storybook  # visual catalog on http://localhost:6006
```

## Brands and modes

Every brand ships **light** and **dark**. Today:

| Brand | Status | Accent | Notes |
|---|---|---|---|
| `bithabit` | default | blue | Neutral grays + white + blue. Proposal, pending approval |
| `plandevida` | active | tan `#EDA96D` | Cream surfaces, Yrsa serif titles. Values verified against `Bakia/plan-de-vida` (generated CSS matches its `global.css` 1:1) |

## Status

| Phase | Scope | State |
|---|---|---|
| 0 | Repo base, conventions, CI, `CLAUDE.md` | done |
| 1 | Three-layer tokens, two brands, build, WCAG validation | done |
| 2 | Component specs and usage docs | **5 of 49** components, verified against the production code (vertical slice) |
| 3 | Reference components in React Native + Storybook (RN-web) with brand/mode switcher, all-brands matrices, generated spec pages, contrast audit, smoke + interaction tests | **done** (Chromatic is wired but needs your account, see `docs/storybook.md`) |
| 4 | Code Connect layer: `connect.yaml` template, `ds-sync` Claude skill, onboarding for dev teams | planned |
| 5 | Per-brand audit report, versioned releases | planned |

Specs are **draft** until the designer approves the changes listed in each spec's `code_gaps` and closes its `open_questions`. See `audit/decisions.md` for what needs a decision.
