---
name: svg
description: >-
  Crafts an app mark, favicon, or inline SVG illustration. Use when the user
  wants a logo, favicon, or a custom SVG drawing.
---

# SVG

UI chrome icons: **Skill** `icons`.

## Mark

Favicon, app symbol, or a drawing that is not chrome. Photo-like art: installed
Recraft / Quiver skill.

Geometric `path` / `circle` / `rect`. `viewBox` set. `fill="currentColor"` (or
a token class). No `<text>` — letters in the header are HTML + **Skill**
`fonts`. Color values: **Skill** `tokens`.

`d` commands: **uppercase = absolute**, lowercase = relative. Each command
takes exactly those args.

| Cmd | Job              | Args                              |
| --- | ---------------- | --------------------------------- |
| `M` | Move             | `x y`                             |
| `L` | Line             | `x y`                             |
| `H` | Horizontal       | `x`                               |
| `V` | Vertical         | `y`                               |
| `C` | Cubic bézier     | `x1 y1 x2 y2 x y`                 |
| `S` | Smooth cubic     | `x2 y2 x y`                       |
| `Q` | Quadratic        | `x1 y1 x y`                       |
| `T` | Smooth quadratic | `x y`                             |
| `A` | Arc              | `rx ry x-rot large-arc sweep x y` |
| `Z` | Close            | —                                 |

`A`: `large-arc` 0 = short, 1 = >180°. `sweep` 0 = CCW, 1 = CW. `C`: first
control = leave, second = arrive.

Tab icon: `app/icon.svg`. In-app: `components/logo.tsx` with
`cn('size-8', className)`.

```tsx
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <path fill="currentColor" d="M16 4 28 16 16 28 4 16z" />
    </svg>
  );
}
```

Done when it reads at **16px** and at **512px**.

## Motion

Property animation (draw-on, SMIL, morph): [animate.md](animate.md). Page
choreography: installed **Skill** `motion` / `gsap`. SVG timeline editor:
installed **Skill** `svgator`.
