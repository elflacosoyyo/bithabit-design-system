# Decisions and audit log

Status: **CLOSED** (decided by the designer or settled by the code) · **PROPOSED** (maintainer proposal, needs approval) · **OPEN** (needs a decision).
Source priority: designer decision > production code > Figma > Claude Design export > reference videos.
Production code = `Bakia/plan-de-vida` @ `cdfea70` (2026-10-08), read-only.

## Closed

| ID | Topic | Decision | Alternatives seen |
|---|---|---|---|
| D-00 | Scope of customization v1 | **Visual only** (tokens, fonts, logo, icons) | Component variants per brand: later |
| D-01 | Accent color (Plan de Vida) | **`#EDA96D`**. Confirmed by `global.css` | Videos show about `#EB9E62`, a color-profile shift in the recording |
| D-02 | Ink / text | **`#030213`** (app). Confirmed by `global.css` | `#1A1A1A` (landing) |
| D-03 | Surface | **`#FAF8F2`** (app). Confirmed by `global.css` | `#FDF5EB` (landing) |
| D-04 | Splash color | **`#D77D2D`**. Confirmed by `global.css` | `#D4893A` (landing stylesheet) |
| D-05 | Display serif | **Yrsa** (decided 2026-10-09). Production bundles it (OFL, weights 300–700, iOS and Android) | Kefa III: an Apple system font that cannot be bundled and does not exist on Android |
| D-23 | Visual catalog | **One self-contained HTML file** (`catalog/index.html`), committed to the repo. No Storybook, no Chromatic. Decided 2026-10-09 to avoid external dependencies and accounts | Storybook (+ Chromatic for hosting and visual regression); Storybook without Chromatic |
| D-06 | Navigation | **Left drawer** (`expo-router/drawer`, confirmed in code) | Bottom tab bar appears only in the Stats exploration |
| D-12 | Styling stack | **NativeWind 4.2 + Tailwind 3.4, `darkMode: 'class'`, CSS variables in `global.css`.** The build emits a preset and a CSS file that use the app's existing names (`tokens/compat.yaml`) | n/a |
| D-16 | Code access | **Granted.** Specs verified against the code | n/a |
| D-19 | Token names | BitHabit names (`foreground`, `background`, `surface`, `muted`...) stay the **public Tailwind/CSS names**. Design-system roles (`color.text.primary`...) are the source and are mapped in `tokens/compat.yaml`. Generated values match the app's `global.css` 1:1 (32 variables, 0 differences) | Renaming classes in the app |

## Needs the designer: OPEN

| ID | Topic | What the code says | Recommendation |
|---|---|---|---|
| D-08 | Selector duplication | Settings uses chips (Light/Dark/System, EN/ES/PT); habit detail uses the pill SegmentedControl | Standardize on SegmentedControl; keep chips only if there is a design reason |
| D-10 | Accessibility debt in light mode | See the contrast table below (W1, W4, W5, W6, W7) | Add text-only variants (darker tan, darker red, ink on tan fills) through `color.text.*` without touching fills |
| D-17 | Checkbox size | `HabitCard` uses a 24pt box, `FooterAction` a 32pt box (same 24pt glyph) | One size. Proposal: 24pt with a bigger hit area |
| D-18 | Stat number sizes | `StatNumber` uses 20/30 (type-scale tokens) and 32/34/54 (literals) | Add `font.size.stat` tokens for 32/34/54 or round to the scale |
| D-20 | Bottom sheet backdrop | Code uses the foreground color at 0.5 opacity, so it is **cream in dark mode**. A `--color-overlay` token exists but is unused | Use `bg.overlay` in both modes |
| D-24 | **Button variant names and structure** | Code names the variants primary / outline / destructive / text (four components, `ButtonText` has the tones default, destructive and link). Figma names the components primary / secondary / tertiary / text, and has a compact "tertiary" (105 by 44) that the code does not have | Keep the code names (the contract in `components/button/` uses them) and confirm what Figma's "tertiary" is. Move the app to one `Button` with a `variant` prop |
| D-25 | **Current section in the menu** | The drawer shows the current section only by an accent colored label (Plan de Vida: tan on cream, 1.88:1, waived as PDV-W1) | Add a marker that does not depend on color (a bar or a weight change) |
| D-26 | **Empty state on Home and Norms** | Home shows a small sans sentence at the top; Norms shows a larger serif sentence centered in the screen | Pick one placement for both; `empty-state` keeps both as variants until then |
| D-21 | Pressed feedback | `TouchableOpacity` default (0.2) in HabitCard and SegmentedControl; 0.7 in FooterAction | One value: `opacity.pressed` = 0.7 |
| D-22 | Accessibility props | HabitCard, Checkbox, BottomSheet, SegmentedControl and all four button components have no role/label/busy state; MetricCard has an optional label; ButtonDestructive sets `disabled` state | Add the roles and labels listed in each spec's `code_gaps` |
| D-07 | Photography | The Figma paywall uses a photo; the Claude Design README says "no photography in the brand" | Allow it only on marketing/conversion surfaces (paywall, onboarding) |
| D-09 | BITHABIT default identity | Not defined anywhere | Neutral grays + white + blue (`#2563EB` light / `#60A5FA` dark); mark is a placeholder |
| D-13 | Light-mode canvas in recordings | Code defines `#FFFFFF`; the recording shows `#F6F5F7` on some screens | Unexplained; tokens mirror the code. Check on a device |
| D-15 | Watch / widget | Explorations exist, not specified | After the app surface is stable |

## Contrast audit (WCAG 2.2 AA)
Computed by `npm run validate` from each brand's own values. BITHABIT passes every check in both modes. Plan de Vida dark passes except the logotype pair.

| Waiver | Pair (Plan de Vida, light) | Ratio | Needed | Status |
|---|---|---|---|---|
| PDV-W1 | Tan text on white / cream (outline buttons, "Back", metric values) | 2.00 / 1.88 | 4.5 | needs decision |
| PDV-W2 | Tan fill on white / cream / alt (history strip, rings) | 2.00 / 1.88 / 1.71 | 3.0 | accepted: decorative, the check glyph carries state |
| PDV-W3 | Splash mark on splash color | about 2.6 | 3.0 | accepted: logotype exemption |
| PDV-W4 | Muted text on input fill | 4.32 | 4.5 | needs decision |
| PDV-W5 | Destructive text on white / cream | 3.75 / 3.54 | 4.5 | needs decision |
| PDV-W6 | **White label on tan fill and on destructive fill** (ButtonPrimary, ButtonDestructive, swipe actions; production uses `text-background`) | 2.00 / about 3.8 | 4.5 | needs decision. Ink `#030213` on tan is about 9:1 |
| PDV-W7 | Brand-orange positive change on cream | about 3 | 4.5 | needs decision |

## Findings from reading the production code
- `HabitCard.history` is the completion of the **last 7 days** (not a streak), oldest first, today last.
- `BottomSheet` has no snap points, no keyboard handling and opens with timing, not a spring.
- `SegmentedControl` API is `labels` / `selectedIndex` / `onSelect`; the thumb does not slide.
- The `MetricCard` delta is a separate `ChangeIndicator`, inline in `month-metrics.tsx`; positive uses the brand orange.
- Hard-coded values that bypass tokens: `text-white` on the calendar "today" circle, `#FFFFFF` icon color in ButtonDestructive, stat font sizes 32/34/54.
- The Claude Design export listed 19 components; the code has about 45 component files (inventory updated).
- Primary-button label color is `text-background` (white in light mode, near-black in dark mode).
