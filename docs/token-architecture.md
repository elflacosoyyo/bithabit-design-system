# Token architecture

Tokens follow the W3C Design Tokens format (DTCG): `{ "$value": ..., "$type": ... }`, references as `"{path.to.token}"`.

## Layers

| Layer | Folder | Purpose | Mode-aware | Who overrides it |
|---|---|---|---|---|
| **Primitive** | `tokens/primitive/` | Raw scales: color ramps, spacing, radius, type sizes, durations | no | Brands add their own primitives (`brands/<id>/primitive.json`) |
| **Semantic** | `tokens/semantic/{light,dark}.json`, `typography.json` | Roles: `color.bg.surface`, `color.text.primary`, `typography.screen-title` | **yes** | **Brands override here.** This is the white-label seam |
| **Component** | `tokens/component/<id>.json` | Per-component decisions: `habit-card.radius-top` | inherits | Only the design system; brands change them through semantic tokens |

Resolution order for one brand and one mode (later wins):
`primitive` → `brand primitive` → `semantic typography` → `semantic <mode>` → `brand typography` → `brand semantic <mode>` → `component`.

Rules: components reference only semantic/component tokens; component color tokens may not be literals.

## Surfaces
`brand.yaml` declares which surfaces a brand supports (`app`, `watch`, `widget`, `landing`). Only `app` is specified in v1;
the field exists so tokens can later diverge per surface without restructuring.

## Typography
- `font.family.sans` (single family) and `font.family.display.{ios,android,web}` (the display face can differ per platform; Plan de Vida uses the bundled Yrsa on all three).
- Composite text styles live under `typography.*`. In them, `fontFamily` is a **role** (`sans` or `display`); consumers resolve it with `font.family.<role>[.platform]`. This is a deliberate small deviation from DTCG so one style works on every platform.

## Outputs (`dist/<brand>/`)
| File | Use |
|---|---|
| `theme.js`, `theme.d.ts`, `theme.json` | `light` and `dark` theme objects. Dimensions are unitless numbers (React Native). Raw primitive colors are **not** exported on purpose |
| `tokens.css` | CSS variables `--bh-*`. Light is `:root`; dark is `.dark` or `[data-theme="dark"]` (only values that differ) |
| `bithabit-compat.css` | The app's own `--color-*` variables (`:root` and `.dark:root`), generated from the tokens. Drop-in for the color block of `global.css`. Verified identical to `Bakia/plan-de-vida` |
| `tailwind.preset.cjs` | Tailwind/NativeWind preset using the **BitHabit names** the app already uses (`foreground`, `background`, `surface`, `muted`, `border`...) plus extra roles (`accent-text`, `on-accent`, `destructive-text`, `positive`...). Colors read CSS variables, so dark mode follows `.dark` |
| `../manifest.json` | Components (version, status, tokens, content hash, sources), brands (token hash) |

> The app uses NativeWind 4 and Tailwind 3.4 with `darkMode: 'class'` (decision D-12, verified in code). Public names are defined in `tokens/compat.yaml` (D-19).

## Why a custom build script instead of Style Dictionary
We need per-brand, per-mode resolution, composite tokens and a manifest. A ~150-line, dependency-light resolver (`scripts/lib.mjs`)
is easier for Claude and designers to audit than a Style Dictionary config with custom transforms. The source format is standard DTCG,
so migrating to Style Dictionary later is a build-script swap, not a token rewrite.
