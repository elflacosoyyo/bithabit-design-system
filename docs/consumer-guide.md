# Consumer guide (for app developers and their Claude)

## Install (private repo)
```bash
npm i github:elflacosoyyo/bithabit-design-system#v0.1.0
```
Requires GitHub access to the repo. The package ships `dist/`, `components/` (specs and usage docs), `brands/` and `schemas/`.

## Adopt it in a NativeWind app (no class renames)
The generated files use the same names the app already has, so adoption is a swap of configuration, not of components.

1. **Colors.** Replace the `--color-*` block inside `@layer base` in `global.css` with `dist/<brand>/bithabit-compat.css` (also importable as `@bakia/bithabit-design-system/css-compat/<brand>`). For Plan de Vida the values are identical to today's.
2. **Tailwind.** In `tailwind.config.js` add the preset after `nativewind/preset`:
```js
presets: [require('nativewind/preset'), require('@bakia/bithabit-design-system/tailwind-preset/plandevida')],
```
   It provides `foreground`, `background`, `surface`, `muted`, `accent`, `destructive`, `border`... plus new roles such as `accent-text`, `on-accent`, `destructive-text`, `positive`. Keep the app-specific numeric spacings (`9`, `10`, `30`, `43`) in the app until they become component tokens.
3. **Extra variables.** Import `css/<brand>` (`tokens.css`) if you use the new `--bh-*` roles.

## Use tokens from code
```ts
import { light, dark } from '@bakia/bithabit-design-system/themes/plandevida';
// light.color.bg.surface, light.habitCard.radiusTop, light.typography.screenTitle ...
```

## What Claude should read before touching a component
1. `node_modules/@bakia/bithabit-design-system/dist/manifest.json`: which components exist, their version, status and `contentHash`.
2. `components/<id>/<id>.usage.md`: intent and rules.
3. `components/<id>/<id>.spec.yaml`: props, states, tokens, accessibility contract.

## Keep the app aligned (Code Connect)
The app keeps its own mapping file, `.bithabit/connect.yaml`, and Claude compares it with the manifest and **suggests** changes
("HabitCard went from 0.1.0 to 0.2.0: new `disabled` state; your component has no `accessibilityRole`"). Nothing is changed without the developer's approval.
Setup, commands and the meaning of every finding: `docs/code-connect.md`. Template: `integration/connect.template.yaml`. Example: `integration/examples/plan-de-vida.connect.yaml`.

## Rules of thumb
- Prefer a theme token over a literal. If a value you need has no token, ask the design system to add one instead of hardcoding it.
- Specs marked `draft` may change; read their `open_questions` before relying on them.
- Dark mode is part of the contract, not an extra.
