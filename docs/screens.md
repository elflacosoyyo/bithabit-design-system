# Screens: real app screens in the catalog

The catalog recreates screens of the app **from design-system components**, so you can see how the components behave together, write notes on what you see, and discover the components that are still missing. Screens are documentation: they are not part of `dist/` or the manifest that apps read.

## What you get
- **Prototype**: the app as one phone. The menu button opens the drawer, the drawer moves between sections, cards can be completed, swiped, deleted (with the confirmation alert) and opened. Sections that are not recreated yet show a visible placeholder, so a gap never looks like a finished screen. What you change stays while you move between catalog pages (**Reset demo data** restores it).
- **One page per screen** (Home, Menu) with three tabs:
  - **Screen**: the phone, a selector of states (with norms, empty, all completed, detail open) and the annotations. Numbered pins sit on the elements; the list on the right has the same ids. Press a pin or a note to highlight its element. **Annotations** shows or hides the pins.
  - **All brands**: the same screen in every brand, light and dark.
  - **Notes**: the screen's contract rendered as a page: components used (linked to their specs), what is not recreated yet, states, annotations and sources.

## Annotations
Four kinds, with a color each:

| Kind | Use it for |
|---|---|
| **Note** | Something worth knowing about how the screen works |
| **Gap** | The production code does something different from the contract |
| **Question** | Something nobody knows yet |
| **Decision** | A choice the designer has to make; it points at a `D-xx` row in `audit/decisions.md` |

They live in `screens/<id>/<id>.screen.yaml`, so they are versioned with the repo. The catalog is a static file and cannot save them by itself: **tell Claude what to write** (or comment on the published page) and it adds them to the YAML and rebuilds. Each annotation says which element it is attached to (`target`) and, optionally, which component it is about.

## How a screen is built
1. The contract: `screens/<id>/<id>.screen.yaml` (validated by `npm run validate` against `schemas/screen.schema.json`). Every component it lists must exist in `components/inventory.yaml`; a component that has no contract yet gives a warning.
2. The composition: `catalog-src/screens/` (for example `HomeScreen.tsx`) uses only `src/components/*`. `AppPhone.tsx` joins the screens with the drawer, the sheets and the alerts, and every page starts from it.
3. The page: `catalog-src/pages/screens/<Name>.tsx`, registered in `catalog-src/registry.tsx`.

If a screen needs something the system does not have, **the component is created first** (inventory, spec, tokens, reference component, catalog page) and only then used. Home and Menu produced five: `icon-button`, `nav-header`, `header-bar`, `empty-state` and `drawer-menu`, and the swipeable variant of `habit-card`.

## What the recreation is not
- It is not the production code: it uses the reference components, drawn with `react-native-web`.
- The operating system's alert is emulated in neutral colors (`NativeAlert`); it is not a component of the system.
- Drag to reorder, the entrance animation and the content of the habit detail are not recreated. They are listed under `pending` in each screen file.
- The status bar is a static drawing (9:41), so the file is deterministic.
