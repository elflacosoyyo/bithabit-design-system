---
name: ds-sync
description: Compare this app's components and styling with the BITHABIT design system and suggest updates. Use when the user asks to sync, update or audit components against the design system, after upgrading @bakia/bithabit-design-system, or before building or changing a UI component that the design system specifies.
---

# ds-sync: keep this app aligned with the BITHABIT design system

The design system is a **contract layer**, not a dependency. It publishes, per component, a spec (`spec.yaml`), a usage guide
(`usage.md`) and a manifest with versions. This app keeps a mapping file (`.bithabit/connect.yaml`) that says which of its own
components implement which design-system component. This skill compares the two and **suggests** changes.

## Safety rules (always)
- **Suggest, never impose.** Do not edit app code until the user approves that specific change. One component at a time.
- The design system can be wrong or outdated for this app. Where the app and the contract differ, present both and let the user decide.
- Follow this repo's own `CLAUDE.md` (code conventions, git conventions, tests). Never hard-code colors, fonts or spacing; use the token-based classes.
- Do not paste spec text into code comments, and do not change behavior that the user did not approve.

## Workflow
1. **Check the setup.**
   - The package must be installed: `node_modules/@bakia/bithabit-design-system/dist/manifest.json`. If not, tell the user to install it
     (`npm i github:elflacosoyyo/bithabit-design-system#<tag>`); do not install it yourself unless asked.
   - `.bithabit/connect.yaml` must exist. If not, run `npx ds-sync init` (prints a draft to the terminal), show it to the user, and write it
     with `npx ds-sync init --write` only after they review it. Its mappings are guesses: confirm each one.
2. **Run the report:** `npx ds-sync check` (or `node node_modules/@bakia/bithabit-design-system/integration/ds-sync/sync.mjs check`).
3. **Read before you advise.** For every component with warnings, read its contract in
   `node_modules/@bakia/bithabit-design-system/components/<id>/`: `<id>.usage.md` (intent, do and don't) and `<id>.spec.yaml`
   (props, states, tokens, accessibility, `code_gaps`).
4. **Summarize for the user**, shortest useful form, in this order:
   1. Errors (a mapped file or prop that does not exist, an invalid `connect.yaml`).
   2. Updates available, with what changed in the contract.
   3. Differences from the contract (accessibility, hit areas, pressed state, hard-coded colors...).
   4. Design-system components with no mapping.
   5. Styling drift between `global.css` and the brand's generated variables.
   Ask which items to apply.
5. **Apply each approved item** with the smallest change that satisfies it. Use token names, not values:
   `tokens/compat.yaml` maps design-system tokens to the Tailwind/CSS names this app already uses, and `dist/<brand>/tailwind.preset.cjs` lists them.
   Run this repo's lint, type check and tests, show the diff, then record it: `npx ds-sync bump <id>`.
6. **Gaps the team wants to keep:** ask the user for the reason and add `{ gap, reason }` under that component's `acceptedGaps` in `connect.yaml`
   so it stops being reported. Never accept a gap on the user's behalf.
7. **Styling drift:** if `global.css` differs from `dist/<brand>/bithabit-compat.css`, show the differing variables and ask before changing them.
   A drift can mean the design system moved or the app changed on purpose.

## What the report means
| Code | Meaning | Typical action |
|---|---|---|
| `update-available` | The contract moved since `syncedVersion` | Read the changelog, apply what the user approves, `bump` |
| `content-changed` | Spec or usage changed without a version bump | Re-read it; `bump` when aligned |
| `mapped-prop-missing` | `connect.yaml` maps a prop the component does not have | Fix the mapping or add the prop |
| `prop-not-mapped` / `required-prop-absent` | A contract prop has no mapping / no equivalent | Map it, or `null` plus a note |
| `hardcoded-color` | A color literal bypasses tokens (lines are listed) | Replace with a token class |
| `a11y-*-missing` | The contract's accessibility role or label is absent | Add `accessibilityRole` / `accessibilityLabel` |
| unmapped | A design-system component has no mapping | Map it, or `ignore` it with a reason |

## Limits
- ds-sync reads files statically (it never runs the app). It finds props through a `<Export>Props` type and colors through patterns; say so if a result looks odd.
- A component that the design system specifies but the app has inline (not a separate component) shows up as unmapped: suggest extracting it, do not force it.
