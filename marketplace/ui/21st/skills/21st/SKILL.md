---
name: 21st
disable-user-invocation: true
description: >-
  Searches and installs UI from the 21st.dev catalog. Use when the user wants
  a 21st component, theme, or template, or a marketplace block that is not in
  local components/ui or an installed kit registry.
---

# 21st

Starter is `app/` (no `src/`), bun. Official shadcn and installed kit registries stay the default for primitives already in `components/ui`.

MCP **21st**: `search` then `get_component` (or `get_theme`). `generate` only when they asked to generate — it spends their 21st credits.

## Wire

After code lands:

- Tokens: `app/tokens/`. Semantic colors, no raw hex from the dump.
- Existing shadcn primitives first. Do not add a second UI kit.
- Skip iframe / `srcDoc` widgets unless they asked for that embed.
- If `package.json` / lockfile changed → **InstallDependencies**.
- **PageScreenshot** the page once. On timeout, stop.

Do not `shadcn init`. Do not publish or edit their 21st profile / catalog listings unless they asked.
