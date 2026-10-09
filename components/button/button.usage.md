# Button

> Spec: [`button.spec.yaml`](./button.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
The action button of the product: a 48pt-high control with a short sentence-case label, an optional leading icon and a loading state.
It comes in four visual variants (six counting the text tones). The variant says **how important and how risky** the action is;
everything else (size, radius, type, disabled behavior) is shared so all actions look like one family.

In the app today it exists as four components (`ButtonPrimary`, `ButtonOutline`, `ButtonDestructive`, `ButtonText`). The contract treats them
as one `Button` with a `variant`; `ds-sync` maps each variant to the matching component.

## Variants at a glance
| Variant | Use it for | Example |
|---|---|---|
| `primary` | The one main action of the screen | "Continue", "Continue with Apple" |
| `outline` | A secondary action, or the main action when the screen already has a heavier element | "Add norm", "Log out" |
| `destructive` | Deleting or removing data | "Delete selected (3)" |
| `text` | A low-emphasis action next to a stronger one | "Cancel", "Sign in" |
| `text-destructive` | A low-emphasis destructive action | "Delete account" |
| `text-link` | Leaving the flow to manage something | "Manage subscriptions" |

## When to use
- Any action the user triggers on purpose: submit, continue, add, remove, sign in, log out.
- Footers of screens and sheets, where a full-width button is the clearest target.

## When not to use
- Navigating between app areas: use the drawer and header actions.
- Toggling a state (done today, on/off): use a [Checkbox](../checkbox/checkbox.usage.md) or a switch.
- Choosing between views of the same content: use a [SegmentedControl](../segmented-control/segmented-control.usage.md).
- Rows that open something inside a list: those are list items with a chevron.

## Do
- Use **one primary button per screen**; give the alternative an outline or text button.
- Start labels with a verb and name the result ("Add norm", "Delete selected (3)").
- Keep labels in sentence case, short enough for one line.
- Put a short confirmation (alert or sheet) before an irreversible destructive action; the button does not confirm itself.
- Show `loading` while an async action runs, instead of letting the button look idle.
- Disable the button, rather than hiding it, when the action is not available yet (for example nothing is selected).

## Don't
- Don't put two primary buttons on the same screen.
- Don't use destructive styling for a harmless action, or primary styling for a deletion.
- Don't add emoji or exclamation marks to labels.
- Don't use an icon on text variants.
- Don't recolor a variant or add shadows; depth comes from fill and border.
- Don't rely on color alone: the destructive and link text variants are underlined for that reason.

## Content
- Sentence case, verb first: "Add norm", "Continue", "Log out".
- Counts go in parentheses at the end: "Delete selected (3)".
- Spanish (Plan de Vida): "Agregar norma", "Cancelar", "Eliminar cuenta"; the same rules apply.

## Implementation notes (React Native)
- Production: `TouchableOpacity` with `h-2xl flex-row items-center justify-center gap-sm rounded-md px-md`; label `font-sans text-body font-semibold`.
  Primary adds `bg-accent`, outline adds `border-1.5 border-accent`, destructive adds `bg-destructive`. Disabled and loading add `opacity-50`.
- Labels on the fills use `text-background` today (white in light mode). The contract names the role `text.on-accent`.
- Icons are 18pt: AntDesign on primary and outline, Feather on destructive. Keep them in the label color.
- Add `accessibilityRole="button"`, `accessibilityState={{ disabled, busy: loading }}` and let the visible label be the accessible name.
- Press feedback: the contract is a dim to `opacity.pressed` (0.7); production uses the `TouchableOpacity` default (0.2).

## Brand notes
- **BITHABIT:** blue fill with white label; every combination passes WCAG AA in light and dark.
- **Plan de Vida:** tan fill. The white label on tan (2.0:1) and the tan labels on white (outline and text) are below AA in light mode; they are documented waivers (PDV-W6 and PDV-W1) waiting for a design decision. Dark mode passes.

## Contract example
```tsx
<Button variant="primary" label="Continue" onPress={onContinue} />
<Button variant="outline" label="Add norm" onPress={addHabit} disabled={isLoading} />
<Button variant="destructive" label={`Delete selected (${count})`} icon={<TrashIcon />} disabled={!count} onPress={removeSelected} />
<Button variant="text-destructive" label="Delete account" onPress={askToDelete} />
```
