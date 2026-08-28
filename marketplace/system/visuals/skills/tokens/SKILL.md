---
name: tokens
disable-user-invocation: true
description: >-
  Wires project color and theme tokens. Use when adding or changing a color,
  palette, dark mode, radius, or other --color-* / collection CSS.
---

# Tokens

Read `app/tokens/collections.json` → `active` → `file`. That `col_*.css` is
the only file to edit for design values.

| Path                      | Role                                           |
| ------------------------- | ---------------------------------------------- |
| `app/tokens/tailwind.css` | Framework bootstrap. Do not add design colors. |
| `app/tokens/index.css`    | Generated re-export. Do not edit.              |
| `app/globals.css`         | Imports the two sheets. No `@theme` here.      |

Light lives in `@theme`. Dark overrides in `.dark`. Pages use semantic
utilities (`bg-background`, `text-muted-foreground`) — they map from
`--color-*`. No raw hex in `className`. No `dark:bg-gray-950`.

Canonical name is `--color-<name>`. shadcn short aliases stay in lockstep:

```css
--color-brand: oklch(0.55 0.12 250);
--brand: var(--color-brand);
```

New color: both `@theme` and `.dark` if it must switch. Match neighboring
`oklch(...)`. Font roles: **Skill** `fonts`.

Done when the page uses the utility or `var(--color-*)` and the collection
file holds the value.
