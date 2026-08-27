---
name: fonts
disable-user-invocation: true
description: >-
  Wires project fonts. Use when adding, replacing, or removing a font, or when
  a --font-* role must point at a different face.
---

# Fonts

Import WOFF2/TTF with ImportAsset. Read `app/fonts/index.ts` first.

Touch only `app/fonts/` and the active collection CSS
(`app/tokens/collections.json` → `active` → `file`). No `next/font` elsewhere,
no CDN `<link>`, no `@import` for fonts.

| Path                       | Role                              |
| -------------------------- | --------------------------------- |
| `app/fonts/index.ts`       | Connected faces + `fontVariables` |
| `app/fonts/manifest.json`  | Custom font library               |
| `app/fonts/assets/*.woff2` | Custom files                      |
| active `col_*.css`         | Role tokens only                  |

## Face vs role

A **face** is a `next/font` export. It owns a CSS variable
(`--font-sans`, `--font-playfair-display`, …). `next/font` sets that variable.
Do not assign a face variable in collection CSS.

A **role** is what UI uses: `--font-body` / `--font-heading` / `--font-display`
(`font-body` / `font-heading` / `font-display`). Not `next/font` `className`.

A connected face does nothing until a role (or other file) contains the
literal `var(--that-face-variable)`. Never `` `--font-${family}` ``,
`'--font-' + name`, or `import * as fonts`.

If the collection has `--font-sans: var(--font-body)`, delete that line — it
overwrites the face. Point roles at the face:

```css
--font-body: var(--font-sans);
--font-heading: var(--font-sans);
--font-display: var(--font-sans);
```

## `index.ts`

Keep it static and literal. No helpers, spreads, template strings, `import *`.

- Google: named imports from `next/font/google`. Family spaces → `_`
  (`Playfair Display` → `Playfair_Display`).
- Custom files: `import localFont from 'next/font/local'`.
- One `export const` per face. Binding is camelCase (`playfairDisplay`).
- `export const fontVariables = [a.variable, b.variable].join(' ')` — every
  connected face, in that form.
- Always `display: 'swap'`, `preload: false`.
- `subsets: ['latin']`. Add `'cyrillic'` or `'latin-ext'` when copy needs it.

`weight`: omit it on variable Google families (Inter, Geist, Roboto Flex, …).
Every other Google family: `weight: ['400', '700']` (strings). Add more
weights only if you use them. If the dev overlay says a weight is missing,
drop that weight. If it says `weight` is required, add `['400', '700']`.

New face: `Playfair Display` → import `Playfair_Display`, binding
`playfairDisplay`, variable `--font-playfair-display`. Two faces must not
share a `variable`.

### Replace vs add

**Replace** the font behind an existing role: swap the loader. Keep the same
`variable`. Rename the binding to the new family (`inter` → `roboto`) and
update `fontVariables`. Inter uses `--font-sans` — keep that variable when
replacing Inter. Do not write `export const inter = Roboto(…)`.

**Add** a face: new binding, new `--font-<kebab>`, append to `fontVariables`,
point a role at `var(--font-…)`:

```css
--font-heading: var(--font-playfair-display);
```

Replace Inter with Roboto (keep `--font-sans`) and add Playfair:

```ts
import { Roboto, Playfair_Display } from "next/font/google";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair-display",
  display: "swap",
  preload: false,
});

export const fontVariables = [roboto.variable, playfairDisplay.variable].join(
  " ",
);
```

## Stop using vs delete

**Stop using** a face: point the role at another connected face so that face's
`--font-…` string is gone from tokens. Do not remove the `index.ts` export —
unused connections are stripped from `index.ts` when the project is saved.
`manifest.json` and `assets/` stay.

**Delete** a custom font (user asked to remove it from the project): drop the
`index.ts` export, the manifest row, and the WOFF2 together. Leave other
families.

## Custom local

Three path forms for the same file:

| Where       | Path                                   |
| ----------- | -------------------------------------- |
| ImportAsset | `app/fonts/assets/brand-regular.woff2` |
| `manifest`  | `brand-regular.woff2` (basename)       |
| `localFont` | `./assets/brand-regular.woff2`         |

Basename: `[a-z0-9][a-z0-9._-]*\.woff2`. No spaces. Lowercase if the source
name has capitals.

1. If `manifest.json` already lists that family, reuse its `binding` /
   `variable` — only connect in `index.ts`.
2. Else `ImportAsset` with `destination: "filesystem"` and
   `path: "app/fonts/assets/<name>.woff2"`.
3. Add a manifest row and a `localFont` export. `binding` (the `export const`
   name) and `variable` must be identical in both files. Each file needs
   `style`: `"normal"` or `"italic"`. Variable font: one file,
   `weight: "100 900"` in both the manifest and `src`.

```json
{
  "version": 1,
  "fonts": [
    {
      "binding": "brand",
      "family": "Brand",
      "variable": "--font-brand",
      "files": [
        { "path": "brand-regular.woff2", "weight": "400", "style": "normal" }
      ]
    }
  ]
}
```

```ts
import localFont from "next/font/local";

export const brand = localFont({
  src: [
    { path: "./assets/brand-regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-brand",
  display: "swap",
  preload: false,
});
```
