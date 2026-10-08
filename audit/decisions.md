# Decisions and audit log

Status: **CLOSED** (decided by the designer) · **PROPOSED** (made by the maintainer, needs approval) · **OPEN** (needs a decision).
Source priority: designer decision > production code > Figma > Claude Design export > reference videos.

## Closed

| ID | Topic | Decision | Alternatives seen |
|---|---|---|---|
| D-01 | Accent color (Plan de Vida) | **`#EDA96D`** (code value) | Videos show about `#EB9E62`; likely a color-profile shift in the screen recording |
| D-02 | Ink / text (Plan de Vida) | **`#030213`** (app) | `#1A1A1A` (landing) |
| D-03 | Surface (Plan de Vida) | **`#FAF8F2`** (app) | `#FDF5EB` (landing) |
| D-04 | Splash color | **`#D77D2D`** | `#D4893A` (landing stylesheet) |
| D-05a | Display serif | **Kefa III** | Georgia (app fallback), Crimson Pro (Claude Design substitute) |
| D-06 | Navigation | **Left drawer (production)** | Bottom tab bar appears only in the Stats exploration; deferred |
| D-00 | Scope of customization v1 | **Visual only** (tokens, fonts, logo, icons) | Component variants per brand: later |

## Proposed (maintainer decision, pending approval)

| ID | Topic | Proposal |
|---|---|---|
| D-05b | Serif where Kefa III is unavailable | Android/web/Storybook use **Crimson Pro**. iOS uses Kefa III. Needs the exact PostScript name for RN |
| D-07 | Photography | Allowed only on marketing/conversion surfaces (paywall, onboarding), never inside the product. The Claude Design README says "no photography in the brand", but the Figma paywall uses a photo |
| D-09 | BITHABIT default identity | Neutral grays + white + blue (`#2563EB` light / `#60A5FA` dark). Tailwind-compatible values. Mark is a placeholder |
| D-11 | Token naming | New names (`color.bg.surface`) replace the app's legacy CSS names. Mapping in `brands/plandevida/legacy-token-map.yaml` |

## Open

| ID | Topic | Why it matters | Recommendation |
|---|---|---|---|
| D-08 | **Selector duplication**: Settings uses chips (Light/Dark/System, EN/ES/PT); the habit detail uses a pill SegmentedControl | Two patterns for the same job | Standardize on SegmentedControl; keep chips only if a design reason exists |
| D-10 | **Accessibility debt in Plan de Vida light mode** (waivers PDV-W1, W4, W5) | See below | Add text-only variants (darker tan, darker red) via `color.text.accent` / `color.text.destructive` without touching fills |
| D-12 | NativeWind in the app | Determines whether the Tailwind preset is useful as built | Verify in `Bakia/plan-de-vida/tailwind.config.js` once access exists |
| D-13 | Light-mode canvas | Videos measure `#F6F5F7` (canvas) and `#EFEDE8` (surface); code says `#FFFFFF` and `#FAF8F2`. Probably iOS grouped-background in Settings, but unverified | Confirm on device or in code |
| D-14 | `text.disabled` in Plan de Vida | Inherits the cool gray from BITHABIT in a warm brand | Add a warm disabled tone to the brand |
| D-15 | Navigation for Watch / widget | Explorations exist but are out of v1 | Spec after the app surface is stable |
| D-16 | Code access | `Bakia/plan-de-vida` is not readable from this environment, so every component is `draft` | Grant access or provide the component files |

## Contrast audit (WCAG 2.2 AA), Plan de Vida light mode
Computed by `npm run validate` from the brand's own values. BITHABIT passes every check in both modes; Plan de Vida dark passes except the logotype pair.

| Waiver | Pair | Ratio | Needed | Status |
|---|---|---|---|---|
| PDV-W1 | Tan text on white / cream (`text.accent`) | 2.00 / 1.88 | 4.5 | needs decision (outline buttons, "Back" link, stat values) |
| PDV-W2 | Tan fill on white / cream / alt (streak strip, rings) | 2.00 / 1.88 / 1.71 | 3.0 | accepted: decorative, check glyph carries state |
| PDV-W3 | Splash mark on splash color | 2.61 | 3.0 | accepted: logotype exemption (SC 1.4.3) |
| PDV-W4 | Muted text on input fill | 4.32 | 4.5 | needs decision |
| PDV-W5 | Destructive text on white / cream | 3.75 / 3.54 | 4.5 | needs decision ("Delete norm", delete account) |

## Inconsistencies found in the sources
- Two neutral backgrounds in light mode (cool `#F6F5F7` vs warm cream `#FAF8F2`).
- Two selector patterns (D-08).
- Accent differs between code and recordings (D-01, resolved).
- Ink `#030213` (app) vs `#1A1A1A` (landing); surface `#FAF8F2` vs `#FDF5EB` (resolved to the app).
- Primary-button label color is unknown (white on tan would be about 2:1; the spec assumes dark ink on accent). Verify.
