# Code Connect: the layer between the design system and each app

Figma's Code Connect links a design component to the code that implements it, without making design depend on code.
This repo does the same for apps. **Nothing is coupled at runtime**: the design system never reads app code, and the app never imports the design system to run.
The only link is a small mapping file that lives in the app repo.

```
 design-system repo (this one)                         app repo (React Native)
 ─────────────────────────────                         ───────────────────────────────
 components/<id>/spec.yaml + usage.md   ── published ──▶  node_modules/@bakia/bithabit-design-system
 dist/manifest.json (versions, hashes,                     .bithabit/connect.yaml   ← maps ds:habit-card to src/components/habit-card.tsx
   props, a11y role, code_gaps)                            .claude/skills/ds-sync   ← tells Claude how to use the report
 integration/ds-sync (the comparison tool)                 ds-sync check            ← suggests changes, never applies them
```

## The pieces
| Piece | Where | What it does |
|---|---|---|
| **Manifest** | `dist/manifest.json` | For each component: version, status, content hash, props, accessibility role, `code_gaps`, the app paths it was verified against, last changelog entries. For each brand: token hash and the generated CSS |
| **Connect file** | app: `.bithabit/connect.yaml` (template: `integration/connect.template.yaml`, schema: `schemas/connect.schema.json`) | Maps each design-system component to an app component and its props; records the version it was aligned with; records gaps the team chose to keep |
| **ds-sync tool** | `integration/ds-sync/sync.mjs` (`npx ds-sync`) | Static comparison of the app with the manifest. Prints a report. **Never edits app code** |
| **ds-sync skill** | `integration/skills/ds-sync/SKILL.md` | Instructions so the developer's Claude runs the tool, reads the contract and proposes changes one at a time |

## Install in an app
```bash
npm i -D github:elflacosoyyo/bithabit-design-system#<tag>
mkdir -p .claude/skills && cp -r node_modules/@bakia/bithabit-design-system/integration/skills/ds-sync .claude/skills/
npx ds-sync init              # prints a draft mapping; review it
npx ds-sync init --write      # writes .bithabit/connect.yaml (refuses to overwrite without --force)
npx ds-sync check             # the report
```
Then ask Claude: *"Run ds-sync and tell me what to update."* An example for Plan de Vida is in `integration/examples/plan-de-vida.connect.yaml`.

## Commands
| Command | Purpose |
|---|---|
| `ds-sync check [--json] [--strict]` | Report. `--strict` exits 1 only on **errors** (missing file, mapped prop that does not exist, invalid connect file), so it can run in the app's CI without blocking on suggestions |
| `ds-sync init [--write] [--force] [--brand <id>]` | Drafts the mapping by matching the app's files with the components' known paths and export names. Components that look inline (the file exists but does not export the component) are listed as unmatched instead of being mapped wrongly |
| `ds-sync bump <id...> \| --all` | After aligning a component, records the current version and hash. Keeps the file's comments |
| `ds-sync list` | Components in the installed design system |
Options: `--app <dir>`, `--ds <dir>`, `--connect <file>`.

## What `check` looks at
| Check | Finding code | Severity |
|---|---|---|
| Mapped file does not exist | `file-missing` | error |
| Contract version moved since `syncedVersion` (shows the changelog entries in between) | `update-available` | warn |
| Spec or usage changed without a version bump | `content-changed` | warn |
| `connect.yaml` maps a prop the app component does not have | `mapped-prop-missing` | error |
| Contract prop not in the mapping / required prop with no equivalent | `prop-not-mapped`, `required-prop-absent` | info or warn |
| Hard-coded colors (hex, `rgb()`, `bg-white`...) instead of tokens; **only line numbers are reported** | `hardcoded-color` | warn |
| Contract's accessibility role or label not found in the file | `a11y-*-missing` | warn |
| The component's `code_gaps` from the spec, minus those in `acceptedGaps` | listed per component | info |
| Design-system component with no mapping and not in `ignore` | unmapped | info |
| `global.css` color variables vs the brand's `bithabit-compat.css` | styling section | warn |

## What it does not do
- It does not run the app or execute any app code. It reads files with simple patterns, so it relies on the conventions `<Export>Props` for props and a `role`/`accessibilityRole` attribute for accessibility. If a result looks odd, say so and check by hand.
- It does not compare visuals. Visual regression is Chromatic's job (see `docs/storybook.md`).
- It does not pick for you. A difference is a suggestion; the team can accept it (`acceptedGaps` with a reason) or schedule it.

## Versioning rules (for the people who maintain this repo)
- A component's `version` follows semver. The manifest's `contentHash` changes with any edit to its spec or usage, so tooling notices even a forgotten bump.
- If you add a field the tool should read, add it in `scripts/build.mjs` (manifest), in `integration/ds-sync/sync.mjs` and in its tests (`test/ds-sync.test.mjs`).
- Never rename a component `id` or a manifest field without a major version: apps' `connect.yaml` files depend on them.
- `npm run validate` checks that the template and every file in `integration/examples/` satisfy the schema and only refer to existing components.
