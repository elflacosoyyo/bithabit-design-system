# CLAUDE.md: maintaining the BITHABIT Design System

You are the maintainer of this repo. The designer talks to you in **Spanish**; **everything in the repo is English**
(files, comments, commit messages, YAML, docs). Reply to the designer in Spanish.

## Mission
Keep a single, validated source of truth for tokens, brands and component contracts that app teams
(React Native, also using Claude) can consume **without any direct coupling**. See `README.md` for the model.

## Commands
```bash
npm run check      # ALWAYS before committing: test + validate + build + dist up-to-date check
npm run validate   # schema, token resolution, mode parity, WCAG contrast, spec/inventory consistency
npm run build      # regenerates dist/ (committed on purpose, so apps can install from GitHub)
npm run storybook  # visual catalog; also `build-storybook` and `test:stories` (see docs/storybook.md)
```
Never edit `dist/` by hand. If `dist/` changes, commit it together with the source change that caused it.

## Source priority (when sources disagree)
1. Explicit decisions by the designer (recorded in `audit/decisions.md`).
2. Production code in `Bakia/plan-de-vida` (read-only; clone it shallow when you need it). Record the commit you read in `sources.code[].commit` and set `verified: true` only for files you actually read. Never copy its code or secrets into this repo: facts and paths only.
3. The Figma file (`qWMcWuD7X6qnzXxAmRopvf`, a copy; may be outdated; use as reference).
4. Claude Design export ("Plan de Vida Design System") and the reference videos.
Record every conflict you resolve in `audit/decisions.md`. Never silently pick a value.

## Token rules
- Three layers: **primitive** (raw scales) → **semantic** (roles, per mode) → **component** (`tokens/component/<id>.json`).
- Components read **semantic** or **component** tokens only. Never primitives, never literals for colors.
- A brand overrides **semantic** tokens (and adds its own primitives under `brands/<id>/primitive.json`). It must override both `light` and `dark`.
- A brand cannot introduce a semantic token the base does not have; add it to the base first (`validate` enforces this).
- Colors in contrast-checked roles must be 6-digit hex. Alpha colors (`rgba(...)`) are allowed only for border/overlay.
- Naming: kebab-case paths (`color.bg.surface-alt`); outputs camelCase for JS (`surfaceAlt`) and `--bh-*` for CSS.
- BitHabit names (`foreground`, `background`, `surface`, `muted`...) are the **public** Tailwind/CSS names used by the app. They are mapped to design-system tokens in `tokens/compat.yaml`; keep that file in sync and never rename a public name without a major version.

## Workflows

### Add a brand
1. `mkdir brands/<id>` with `brand.yaml` (copy `plandevida`'s as a template), `primitive.json`, `typography.json`, `semantic.light.json`, `semantic.dark.json`, `assets/`.
2. Override only what differs from `bithabit`. Put raw brand colors in `primitive.json` under `color.<short-brand-name>.*`.
3. `npm run validate`. Fix contrast failures by changing tokens, or record a **waiver** in `brand.yaml` with reason, recommendation and status. Never waive silently.
4. `npm run build`, commit `dist/`, add the brand to the table in `README.md`.

### Add or change a component
1. Add it to `components/inventory.yaml` first (status `planned`).
2. Create `components/<id>/<id>.spec.yaml` and `<id>.usage.md` (copy `habit-card/`). Use **block-style YAML**; quote any string that contains `: `.
3. Add component tokens in `tokens/component/<id>.json`, referencing semantic tokens only. List **every** token the component reads under `tokens:` in the spec.
4. Read the real component in `Bakia/plan-de-vida` and copy facts (props, sizes, behavior) into the spec. Everything still unknown goes in `open_questions`; every difference between the code and what the contract prescribes goes in `code_gaps` (this is what the ds-sync skill will report to developers).
5. Set the inventory status to `spec-draft`. Bump `version` (semver) and add a `changelog` entry whose top version equals `version`.
6. Add the reference component in `src/components/` and its stories in `stories/components/` (states, `Interactive` with a `play` function, `AllBrands`, `Spec`). Checklist in `docs/storybook.md`.
7. `npm run check && npm run build-storybook && npm run test:stories`.

### Update a token
- Change the lowest layer that is correct (a brand override before a base token, a semantic token before a primitive).
- Run `npm run validate` and read the **contrast** summary. A change that lowers contrast must be justified in `audit/decisions.md`.
- If a token a component uses changes meaning, bump that component's **minor** version and add a changelog line.

### Release
1. `npm run check` is green. All changed specs have a new version + changelog.
2. Bump `version` in `package.json` (semver: breaking token/prop removal = major, new component/token = minor, fixes = patch).
3. `npm run build`, commit everything including `dist/`, tag `vX.Y.Z`. Apps install with `npm i github:elflacosoyyo/bithabit-design-system#vX.Y.Z`.

## Component spec status
`draft` (has open questions) → `stable` (no open questions, verified against code) → `deprecated`. `validate` rejects `stable` with open questions.

## Storybook rules
- Reference components read tokens through `useTheme()`; never literals. They implement the **contract** (including accessibility roles and hit areas), not the production quirks; differences go in the spec's `code_gaps`.
- Stories must work in every brand: use `useSample()` for content so each brand shows its own voice, and add the story to `BrandMatrix`.
- A story that animates needs `parameters.chromatic.delay` so visual snapshots are stable.

## Do not
- Do not add emojis, shadows, gradients or photography to specs unless the brand's voice/visual rules allow it (see `brands/*/brand.yaml`).
- Do not invent measurements. If you estimated from a video or screenshot, say so in `open_questions`.
- Do not commit secrets, tokens or private repo contents. `Bakia/plan-de-vida` is private: reference paths only.
- Do not push to branches other than the one the session assigned; do not open PRs unless the designer asks.

## Pending information
See `audit/decisions.md` (status OPEN) and the `open_questions` of each spec.
