# Storybook: the visual catalog and audit tool

Storybook is where the designer sees every component, in every brand and in light and dark, and audits them against the contract.
It is **not** the contract itself: the contract is `components/*/*.spec.yaml` + `*.usage.md`, which Storybook renders on each component's **Spec** page.

```bash
npm run storybook          # dev server on http://localhost:6006 (builds dist/ first)
npm run build-storybook    # static site in storybook-static/
npm run test:stories       # opens every story in headless Chromium; fails on render errors and failing play functions
```

## What you will find
| Section | What it shows |
|---|---|
| **Overview / Introduction** | How to read the catalog and which brands are in this build |
| **Foundations / Colors** | Semantic roles for the selected brand and mode, with the name the app already uses (`bg-foreground`, `--color-muted`...) |
| **Foundations / Typography, Shape and spacing** | Text styles (display face resolved per platform), scales, radius, motion |
| **Foundations / Brands** | Every role for every brand and mode in one table: the complete visual difference between clients |
| **Components / X** | States, an interactive version, **All brands** (every brand × light and dark), and **Spec** |
| **Audit / Contrast** | WCAG 2.2 AA for every brand and mode, with the documented waivers (same math as `npm run validate`) |
| **Audit / Inventory** | Status of all 49 components, plus code gaps and open questions per specified component |

Use the **Brand** and **Mode** selectors in the toolbar; every story follows them. The "All brands" stories ignore the toolbar and show everything at once.

## Reference components are not production code
`src/components/*` implement each contract in React Native and are rendered on the web with `react-native-web`. They read the generated theme (`dist/`), include the accessibility roles and 48pt hit areas the production app still lacks, and use `Animated`/`PanResponder` instead of Reanimated/Gesture Handler.
Production uses NativeWind classes; each Spec lists the tokens, and `tokens/compat.yaml` maps them to the class names.
`BottomSheet` has a reference-only `presentation="inline"` so several sheets can share a page.

## Adding a component (checklist for Claude)
1. Contract first: inventory entry, `spec.yaml`, `usage.md`, component tokens (see `CLAUDE.md`).
2. Reference component in `src/components/<Name>.tsx`, reading only theme tokens (`useTheme()`), exported from `src/index.ts`.
3. `stories/components/<Name>.stories.tsx` with: the main states, an `Interactive` story **with a `play` function**, `AllBrands` (use `BrandMatrix`, parameter `bare: true`) and `Spec` (`<SpecView id="..." />`, `bare: true`).
4. `npm run check && npm run build-storybook && npm run test:stories`.

## Publishing (Chromatic)
Recommended because it is made by the Storybook team, private by default (access follows your GitHub organization), and adds **visual regression**: it snapshots every story and flags any pixel change on every push.

1. Create a free account at chromatic.com with the GitHub account that owns the repo, and add the `bithabit-design-system` project.
2. Copy the project token. In the GitHub repo: **Settings → Secrets and variables → Actions**: add the secret `CHROMATIC_PROJECT_TOKEN`, and the variable `CHROMATIC_ENABLED` = `true`.
3. Push. `.github/workflows/chromatic.yml` builds and publishes; each push gets a permalink and a visual diff.
Check Chromatic's current free-tier limits before relying on it for many brands (snapshots multiply by stories × viewports × modes).

Alternatives: any static host works because `storybook-static/` is plain files, but GitHub Pages on a private repo requires a paid plan and has no access control. When the repo moves to Bakia's organization, the workflow does not change; only the Chromatic project is re-linked.
