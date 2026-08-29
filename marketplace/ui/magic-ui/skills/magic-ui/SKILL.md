---
name: magic-ui
disable-user-invocation: true
description: >-
  Installs Magic UI components from the @magicui registry. Use when the Magic
  UI kit is installed and a needed @magicui item is missing.
---

# Magic UI

Opt-in kit on top of the shadcn / Tailwind system. Animated marketing pieces (shine, marquee, shimmer) — not a second primitive set and not full page sections. Official shadcn stays the default for `components/ui`.

Registry: `@magicui` → `https://magicui.design/r/{name}.json`. Browse: `https://magicui.design`.

## Register

The **Install** hook runs `bunx shadcn registry add`. If `@magicui` is missing, run `bunx shadcn registry add '@magicui=https://magicui.design/r/{name}.json'`, then continue.

## Find

Prefer a matching local file first.

MCP `search_items_in_registries` — `query` plus `registries: ["@magicui"]`. Then `view_items_in_registries` or `get_item_examples_from_registries`.

## Install

1. **Bash:** `bunx shadcn add @magicui/<name> -y` (optional: `--dry-run` / `--view` first).
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Match the new file to neighboring primitives and Reforma tokens (`app/tokens/`). No raw hex.
