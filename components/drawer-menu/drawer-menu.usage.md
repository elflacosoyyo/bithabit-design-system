# DrawerMenu

> Spec: [`drawer-menu.spec.yaml`](./drawer-menu.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
The app's side menu. A surface-colored panel slides over the screen, the rest dims, and the user picks a section. "Contact us" follows the sections and "My account" is pinned to the bottom.

## When to use
- The app's top-level navigation between its sections.

## When not to use
- Navigation inside a flow (use a back button) or choosing a value (use a sheet or a segmented control).
- Actions that belong to the current screen: use its header action.

## Do
- Keep section names to one or two words in sentence case.
- Close the menu after a selection.
- Keep "My account" at the bottom and "Contact us" after the sections.

## Don't
- Don't add icons, badges or counters to the rows.
- Don't nest a second level in the menu.
- Don't show developer-only sections (Demo) in production builds.

## Implementation notes (React Native)
- Production: `DrawerContent` passed as `drawerContent` to the Expo Router `Drawer`. It renders the title, the navigator's `DrawerItemList`, `ContactUsItem` and `MyAccountItem`. Section rows are drawn by the library.
- The content animates itself (`translateX` -20 to 0 with `SPRING_CONFIG`, plus a 300ms fade) when `useDrawerStatus()` becomes `open`.
- The reference draws its own overlay and panel inside the nearest positioned parent, like the BottomSheet's inline presentation.

## Brand notes
Reads `color.bg.surface` for the panel and `color.text.accent` for the current row. Plan de Vida's accent on its surface is a waived contrast pair (PDV-W1); see the contrast audit.

## Contract example
```tsx
<DrawerMenu
  isOpen={isOpen}
  onClose={close}
  title={t('nav.menu')}
  items={[{ id: 'home', label: t('nav.home') }, { id: 'habits', label: t('nav.habits') }]}
  activeId={current}
  onSelect={go}
  contactLabel={t('nav.contactUs')}
  onContact={contact}
  accountLabel={t('nav.myAccount')}
  onAccount={account}
/>
```
