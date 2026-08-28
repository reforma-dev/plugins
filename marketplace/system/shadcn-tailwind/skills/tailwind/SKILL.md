---
name: tailwind
disable-user-invocation: true
description: >-
  Tailwind v4 layout and utilities on the Reforma starter. Use when writing or
  editing className, spacing, or size — not when adding a shadcn primitive
  (Skill shadcn).
---

# Tailwind

Starter is Tailwind **4** (`@tailwindcss/postcss`, no `tailwind.config.*`).
`cn` is `import { cn } from '@/lib/utils'` (`clsx` + `tailwind-merge`). Fonts:
**Skill** `fonts`. Color and collection CSS: **Skill** `tokens`.

## Layout

`flex` + `gap-*`, not `space-y-*` / `space-x-*`. Equal width and height →
`size-*`. Ellipsis → `truncate`. Conditionals → `cn()`.

`className` on shadcn primitives is layout (`max-w-md`, `mx-auto`, `mt-4`).
Variants and semantic tokens change look.

```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex flex-col gap-4", className)}>
  <Avatar className="size-10" />
</div>;
```
