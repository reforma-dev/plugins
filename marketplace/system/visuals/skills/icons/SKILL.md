---
name: icons
disable-user-invocation: true
description: >-
  Picks UI chrome glyphs from the project icon pack. Use when adding a
  chevron, search, close, spinner, status, or other interface icon.
---

# Icons

Chevrons, search, close, spinners, status, and other chrome: an **icon pack
already in the project**. Starter is Lucide —
`import { SearchIcon } from 'lucide-react'` (suffix `Icon`, same as
`components/ui`). Pack name: `components.json` → `iconLibrary`. A different
pack already in `package.json` — that import, not a second pack.

A new pack only when the user named it → **InstallDependencies**. No inline SVG
for a glyph a pack already has. No icon CDNs.

App mark, favicon, or a drawing that is not chrome: **Skill** `svg`.

Done when the glyph is an import from that pack.
