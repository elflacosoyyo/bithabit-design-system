# EmptyState

> Spec: [`empty-state.spec.yaml`](./empty-state.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A single muted sentence that replaces an empty list. No illustration, no button, no apology.

## When to use
- A list that can legitimately be empty (today's norms, the Norms list).

## When not to use
- Errors or loading: those are different states and need their own treatment.
- A first-run experience that needs guidance: that is onboarding.

## Do
- Say what is true in one sentence ("No hay normas programadas para hoy").
- Use `inline` at the top of a list and `centered` when the list fills the screen.

## Don't
- Don't add an illustration, an icon or an exclamation mark.
- Don't add a call to action. The screen's own header action is how to add one.
- Don't apologize.

## Content
- Plain, quiet, present tense. Written in the brand's voice (Plan de Vida says "normas").

## Implementation notes (React Native)
- Home: `ListEmptyComponent` with `View items-center px-lg pt-2xl` and `Text font-sans text-sm text-muted`.
- Norms: a component with `flex-1 items-center justify-center px-xl py-2xl` and `Text text-center font-serif text-lg text-muted`.

## Brand notes
Muted text follows `text.secondary`, which is contrast-checked on the canvas.

## Contract example
```tsx
<EmptyState message={t('screens.home.emptyState')} />
<EmptyState variant="centered" message={t('habitsScreen.empty')} />
```
