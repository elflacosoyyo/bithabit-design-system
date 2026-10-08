# Consumer guide (for app developers and their Claude)

> Status: the Code Connect layer (`connect.yaml` + `ds-sync` skill) is **planned (Phase 4)**. What exists today is everything it will read.

## Install (private repo)
```bash
npm i github:elflacosoyyo/bithabit-design-system#v0.1.0
```
Requires GitHub access to the repo. The package ships `dist/`, `components/` (specs and usage docs), `brands/` and `schemas/`.

## Use tokens
```ts
import { light, dark } from '@bakia/bithabit-design-system/themes/plandevida';
// light.color.bg.surface, light.habitCard.radiusTop, light.typography.screenTitle ...
```
```js
// tailwind.config.js (NativeWind)
presets: [require('@bakia/bithabit-design-system/tailwind-preset/plandevida')],
```
```css
/* global.css */
@import '@bakia/bithabit-design-system/css/plandevida';
```

## What Claude should read before touching a component
1. `node_modules/@bakia/bithabit-design-system/dist/manifest.json`: which components exist, their version, status and `contentHash`.
2. `components/<id>/<id>.usage.md`: intent and rules.
3. `components/<id>/<id>.spec.yaml`: props, states, tokens, accessibility contract.

## How an app maps its components (Phase 4 preview)
The app keeps its own mapping file, for example `.bithabit/connect.yaml`:
```yaml
designSystem: "@bakia/bithabit-design-system"
brand: plandevida
mappings:
  habit-card:
    component: src/components/habit-card.tsx
    props: { title: title, completed: completed, streakDays: streak }
```
A Claude skill will compare this file with the manifest and **suggest** changes ("HabitCard went from 0.1.0 to 0.2.0: new `disabled` state").
Suggestions only; nothing is changed without the developer's approval.

## Rules of thumb
- Prefer a theme token over a literal. If a value you need has no token, ask the design system to add one instead of hardcoding it.
- Specs marked `draft` may change; read their `open_questions` before relying on them.
- Dark mode is part of the contract, not an extra.
