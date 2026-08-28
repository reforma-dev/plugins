# Animate

Mark motion lives on the SVG nodes. Page choreography: installed **Skill** `motion` / `gsap`. Timeline editor: installed **Skill** `svgator`.

Inline in `components/logo.tsx` → CSS. `app/icon.svg` / `<img>` / `background-image` → SMIL in the markup (CSS cannot reach). Rest pose is frame 0.

`transform` and `opacity` composite. `d`, `r`, `cx`, `points` repaint — spare. `transform-origin: center` — SVG default is `0 0`.

`@media (prefers-reduced-motion: reduce)` → no CSS animation. SMIL: omit `<animate*>`.

Done when the still frame is the logo, then the property the user named actually moves.

## CSS properties

These interpolate as CSS: `fill`, `stroke`, `opacity`, `transform`, `stroke-dasharray`, `stroke-dashoffset`. Color = `currentColor` or a token class.

```css
.mark {
  transform-origin: center;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    transform: scale(1.08);
    opacity: 0.85;
  }
}
```

**Draw-on.** `pathLength="1"` — do not guess dash length.

```tsx
<path
  d="…"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  pathLength={1}
  className="draw"
/>
```

```css
.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1.2s ease forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

Stagger siblings with `animation-delay`. Morph `d` in CSS only when both paths have the **same commands in the same order**:

```css
path {
  d: path("M 4 16 L 28 16");
  transition: d 0.3s ease;
}
path:hover {
  d: path("M 8 8 L 24 24");
}
```

## SMIL

Child of the shape. `fill="freeze"` keeps the end state.

```svg
<circle cx="16" cy="16" r="8" fill="currentColor">
  <animate attributeName="r" values="8;11;8" dur="2s"
           calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
           repeatCount="indefinite" />
</circle>
```

| Element                   | Job                                                          |
| ------------------------- | ------------------------------------------------------------ |
| `<animate attributeName>` | Any attr (`r`, `cx`, `d`, `stroke-dashoffset`, `stop-color`) |
| `<animateTransform>`      | `translate` / `scale` / `rotate` / `skewX` / `skewY`         |
| `<animateMotion>`         | Follow a path; `rotate="auto"` = tangent                     |
| `<set>`                   | Jump an attr at `begin`                                      |

Chain: `id` on the first, `begin="first.end"` or `begin="first.end + 0.3s"`. Also `begin="click"` / `begin="2s"`.

Easing: `calcMode="spline"` + `keySplines="0.42 0 0.58 1"` (one spline per interval).

Morph: identical command count and types (table in SKILL.md). Same letters, same argument counts, same order.

```svg
<path fill="currentColor">
  <animate attributeName="d" dur="2s" repeatCount="indefinite" fill="freeze"
           values="M 16 4 L 28 16 L 16 28 L 4 16 Z;
                   M 16 8 L 24 16 L 16 24 L 8 16 Z;
                   M 16 4 L 28 16 L 16 28 L 4 16 Z" />
</path>
```

Motion path:

```svg
<circle r="2" fill="currentColor">
  <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
    <mpath href="#orbit" />
  </animateMotion>
</circle>
<path id="orbit" d="M 8 16 C 8 8 24 8 24 16 S 8 24 8 16" fill="none" />
```
