# CLAUDE.md: maintaining the BITHABIT Design System

You are the maintainer of this repo. The designer talks to you in **Spanish**; **everything in the repo is English**
(files, comments, commit messages, YAML, docs). Reply to the designer in Spanish.

## Mission
Keep a single, validated source of truth for tokens, brands and component contracts that app teams
(React Native, also using Claude) can consume **without any direct coupling**. See `README.md` for the model.

## Commands
```bash
npm run check      # ALWAYS before committing: test + typecheck + validate + build + build-catalog + "dist/ and catalog/ are up to date"
npm run validate   # schema, token resolution, mode parity, WCAG contrast, spec/inventory consistency
npm run build      # regenerates dist/ (committed on purpose, so apps can install from GitHub)
npm run build-catalog  # regenerates catalog/index.html, the single-file visual catalog (committed; also part of `check`)
npm run test:catalog   # opens catalog/index.html as a file in headless Chromium and exercises every page and interaction
npm run catalog        # catalog dev server (see docs/catalog.md)
```
Never edit `dist/` or `catalog/` by hand. If either changes, commit it together with the source change that caused it.

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
6. Add the reference component in `src/components/` and its catalog page in `catalog-src/pages/components/` (`Examples` and `AllBrands`; register it in `catalog-src/registry.tsx`). Checklist in `docs/catalog.md`.
7. `npm run check && npm run test:catalog`.

### Add or change a screen
1. Read the real screen in `Bakia/plan-de-vida` (and compare with Figma when you can). Write `screens/<id>/<id>.screen.yaml` (schema `schemas/screen.schema.json`): components used, what is `pending`, states, annotations, sources with `verified`.
2. Build it only from design-system components. If the screen needs something that is not in `components/inventory.yaml`, add that component first, following "Add or change a component" (contract, tokens, reference component, catalog page). Never draw a one-off piece inside a screen; if something must be a placeholder, mark it visibly and list it under `pending`.
3. Compose it in `catalog-src/screens/` and add a page in `catalog-src/pages/screens/` (exports `Screen`, `AllBrands`, `Notes`), registered in `catalog-src/registry.tsx`. The prototype (`AppPhone`) is the same composition, so a new section appears there too.
4. Annotations are the designer's notes: `note`, `gap`, `question` or `decision` (a `decision` points at a `D-xx` row in `audit/decisions.md`). Each `target` is a `data-testid` or `data-anno` in the recreation. Write what the designer dictates; do not invent findings.
5. Screens are documentation: they are not part of `dist/manifest.json`. `npm run check && npm run test:catalog` (the test fails if an annotation points at nothing).

### Update a token
- Change the lowest layer that is correct (a brand override before a base token, a semantic token before a primitive).
- Run `npm run validate` and read the **contrast** summary. A change that lowers contrast must be justified in `audit/decisions.md`.
- If a token a component uses changes meaning, bump that component's **minor** version and add a changelog line.

### Release
1. `npm run check` is green. All changed specs have a new version + changelog.
2. Bump `version` in `package.json` (semver: breaking token/prop removal = major, new component/token = minor, fixes = patch).
3. `npm run build`, commit everything including `dist/`, tag `vX.Y.Z`. Apps install with `npm i github:elflacosoyyo/bithabit-design-system#vX.Y.Z`.

## Code Connect (ds-sync)
- `dist/manifest.json` is a public interface: apps' `connect.yaml` files depend on component ids and manifest fields. Never rename or remove them without a major version.
- When you change what the manifest exposes, update `scripts/build.mjs`, `integration/ds-sync/sync.mjs` and `test/ds-sync.test.mjs` together. `npm run validate` checks the connect template and `integration/examples/*.yaml` against `schemas/connect.schema.json`.
- To refresh the Plan de Vida example after a spec change: `node integration/ds-sync/sync.mjs bump --all --app <path to plan-de-vida> --connect integration/examples/plan-de-vida.connect.yaml`. Never write into the app repo.
- ds-sync only reads files; it must never edit app code.

## Component spec status
`draft` (has open questions) → `stable` (no open questions, verified against code) → `deprecated`. `validate` rejects `stable` with open questions.

## Catalog rules
- Reference components read tokens through `useTheme()`; never literals. They implement the **contract** (including accessibility roles and hit areas), not the production quirks; differences go in the spec's `code_gaps`.
- Pages must work in every brand: use `useSample()` for content so each brand shows its own voice, and show the component in `BrandMatrix`.
- The catalog must stay one self-contained file: no network requests, no external fonts or scripts (`test:catalog` blocks the network and fails on any request).
- Interactive examples need a step in `scripts/test-catalog.mjs`. Give each `<Example>` a clear title: tests find it by name.

## Do not
- Do not add emojis, shadows, gradients or photography to specs unless the brand's voice/visual rules allow it (see `brands/*/brand.yaml`).
- Do not invent measurements. If you estimated from a video or screenshot, say so in `open_questions`.
- Do not commit secrets, tokens or private repo contents. `Bakia/plan-de-vida` is private: reference paths only.
- Do not push to branches other than the one the session assigned; do not open PRs unless the designer asks.
- Do not add paid or account-bound services (hosting, visual regression, analytics) without the designer's explicit decision (D-23).

## Pending information
See `audit/decisions.md` (status OPEN) and the `open_questions` of each spec.
