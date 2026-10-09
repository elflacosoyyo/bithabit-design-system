# Component spec format

Each component lives in `components/<id>/` with two files that are always kept together:

| File | Reader | Contains |
|---|---|---|
| `<id>.spec.yaml` | machines, dev's Claude, Storybook (planned) | Facts: anatomy, props, variants, states, tokens used, accessibility, behavior, sources, open questions, changelog |
| `<id>.usage.md` | humans and Claude | Judgment: when to use / not to use, do / don't, content rules, implementation notes for React Native, brand notes, contract example |

Validated by `schemas/component.schema.json` and by `npm run validate` (token existence, changelog, inventory consistency).

## Required `usage.md` sections
`# Name`, `## What it is`, `## When to use`, `## When not to use`, `## Do`, `## Don't` (plus the optional ones used by the existing docs).

## Lifecycle
- `draft`: contract written from references; has `open_questions`.
- `stable`: verified against production code; no open questions.
- `deprecated`: kept for apps still on it; `changelog` says what replaces it.

## Versioning
Semver per component. Major = removed/renamed prop or changed meaning. Minor = new prop, state or token. Patch = wording or doc fixes.
The manifest exposes `contentHash` (spec + usage) so tooling can detect a change even when someone forgot to bump the version.

## code_gaps and open_questions
- `code_gaps`: known differences between the production code and the contract (for example "no accessibilityRole", "hit area 40pt, contract 48pt"). They are not blockers; the `ds-sync` skill will report them to developers as suggestions.
- `open_questions`: facts nobody knows yet or decisions the designer still owes. A component cannot be `stable` while any remain.

## Sources
`sources` records where each fact came from: `figma`, `claude_design`, `videos`, `code`. `code[].verified: true` means a maintainer read the file at the recorded `commit`; `false` means the path was inferred and not read.
