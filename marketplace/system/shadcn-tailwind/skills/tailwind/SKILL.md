---
name: tailwind
disable-user-invocation: true
description: >-
  Tailwind v4 layout and utilities on the Reforma starter. Use when writing or
  editing className, spacing, size, or token CSS — not when adding a shadcn
  primitive (Skill shadcn).
---

# Tailwind

Starter is Tailwind **4** (`@tailwindcss/postcss`, no `tailwind.config.*`). `cn` is `import { cn } from '@/lib/utils'` (`clsx` + `tailwind-merge`). Fonts: **Skill** `fonts`.

## Files

`app/globals.css` only imports the two token sheets. Do not put `@theme` there.

| Path | Role |
| --- | --- |
| `app/tokens/tailwind.css` | Framework bootstrap (`@import 'tailwindcss'`). `--color-*: initial` drops default palettes (`bg-blue-500` does not exist). Do not add design colors here. |
| `app/tokens/index.css` | Generated re-export of the active collection. Do not edit. |
| `app/tokens/collections.json` → `active` → `file` | Project tokens (`col_*.css`). Light in `@theme`, dark in `.dark`. |

Pages: semantic utilities (`bg-background`, `text-muted-foreground`). Those map from `--color-*` in the collection. No raw hex. New color: add `--color-<name>` in the collection file (both `@theme` and `.dark` if it must switch).

## Layout

`flex` + `gap-*`, not `space-y-*` / `space-x-*`. Equal width and height → `size-*`. Ellipsis → `truncate`. Conditionals → `cn()`.

`className` on shadcn primitives is layout (`max-w-md`, `mx-auto`, `mt-4`). Variants and semantic tokens change look. No `dark:bg-gray-950` — `.dark` in the collection already switches.

```tsx
import { cn } from '@/lib/utils'

<div className={cn('flex flex-col gap-4', className)}>
  <Avatar className="size-10" />
</div>
```
