# The catalog: the visual reference and audit tool

`catalog/index.html` is the whole visual catalog in **one file**: the app, the styles and the fonts (Inter and Yrsa) are embedded.
It opens by double-click, works offline, needs no server and no account, and is committed to the repo like `dist/`.

## How to open it
| You want to | Do this |
|---|---|
| See it now | Open `catalog/index.html` in a browser (double-click) |
| Get it from GitHub | Open the file on github.com, press **Download raw file**, then double-click the downloaded file. (GitHub shows HTML as code, not as a page) |
| Edit it with live reload | `npm run catalog` (Vite dev server) |
| Rebuild the file | `npm run build-catalog` (also part of `npm run check`) |
| Share a private link | Ask Claude to publish `catalog/index.html` as an Artifact; it is private until you share it |

Use the **Brand** selector and the **Light/Dark** toggle in the top bar; every page follows them and the choice stays in the URL, so a link keeps the brand and mode.

## What is inside
| Section | What it shows |
|---|---|
| **Overview** | How to read the catalog and the brands in this build |
| **Foundations** | Colors (with the Tailwind/CSS name the app already uses), typography, shape and spacing, and **brands side by side** (the full visual difference between clients) |
| **Components** | One page per component with three tabs: **Examples** (states and interactive versions), **All brands** (every brand × light and dark at once) and **Spec** (the contract generated from `spec.yaml` + `usage.md`, with the real value of each token for the selected brand and mode) |
| **Screens** | A **Prototype** (the app as one navigable phone) and one page per recreated screen with tabs **Screen** (state selector, annotation pins and list), **All brands** and **Notes** (the screen's contract). See `docs/screens.md` |
| **Audit** | WCAG 2.2 AA contrast for every brand and mode with the documented waivers (same math as `npm run validate`), and the status of the whole component inventory |

## Reference components are not production code
`src/components/*` implement each contract in React Native and are rendered on the web with `react-native-web`. They read the generated theme (`dist/`), include the accessibility roles and 48pt hit areas that production still lacks, and use `Animated`/`PanResponder` instead of Reanimated and Gesture Handler. The production app uses NativeWind classes; each Spec lists its tokens and `tokens/compat.yaml` maps them to class names. `BottomSheet` has a reference-only `presentation="inline"` so several sheets can share a page.

## Tests
`npm run build-catalog && npm run test:catalog` opens the built file **as a file** (`file://`) in headless Chromium with the network blocked and:
- loads every page cold in two brand/mode combinations and fails on any console error, page error, network request or empty page;
- checks the canvas takes the brand's color, so a broken theme is caught;
- runs the interactions: complete a habit, toggle a checkbox, switch tabs, open and close the bottom sheet and the drawer menu, swipe cards with the mouse, delete with confirmation, move through the prototype, switch brand and mode from the toolbar, and check that Yrsa is embedded and applied;
- checks that every annotation of every screen is attached to an element that exists in at least one state.

Set `SNAPSHOTS=1` to also write PNGs to `catalog-snapshots/` (ignored by git) to look at the pages. In CI the browser is `CHROMIUM_PATH=/usr/bin/google-chrome`.

## Adding a component (checklist for Claude)
1. Contract first: inventory entry, `spec.yaml`, `usage.md`, component tokens (see `CLAUDE.md`).
2. Reference component in `src/components/<Name>.tsx`, reading only theme tokens (`useTheme()`), exported from `src/index.ts`.
3. A page `catalog-src/pages/components/<Name>.tsx` exporting `Examples` (use `<Example title="...">` blocks; give interactive ones a clear title) and `AllBrands` (use `BrandMatrix` and `useSample()` so each brand shows its own voice). Register it in `catalog-src/registry.tsx`; the Spec tab is automatic.
4. If the component is interactive, add a step for it in `scripts/test-catalog.mjs`.
5. `npm run check && npm run test:catalog`.

## Adding a screen
See `docs/screens.md`. In short: a `screens/<id>/<id>.screen.yaml`, a page in `catalog-src/pages/screens/`, a route in `catalog-src/registry.tsx`, and every component it needs added to the system first.

## Why there is no Storybook or Chromatic (decision D-23)
Both were tried first. They were replaced because the design system should not depend on a framework's release cycle or on an external service and account. What was given up, and what to do if it is missed later:
- The "Controls" panel for editing props live: replaced by fixed examples plus interactive ones.
- Storybook's accessibility panel: the contrast audit covers color; roles and labels are checked by the reference components and the tests.
- Automatic visual regression: not replaced for now (decision of the designer). If needed, screenshot baselines can be stored in the repo with Playwright (already a dev dependency) without any external service.
