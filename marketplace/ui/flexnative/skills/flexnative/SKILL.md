---
name: flexnative
disable-user-invocation: true
description: >-
  Installs Flexnative blocks, patterns, and intents from the @flx registry. Use
  when the Flexnative kit is installed and a needed @flx item is missing.
---

# Flexnative

Opt-in kit on top of the shadcn / Tailwind system. Blocks, patterns, and intents — not a second primitive set. Official shadcn stays the default for `components/ui`.

Registry: `@flx` → `https://ui.flexnative.com/r/{name}.json`. Browse: `https://ui.flexnative.com`.

## Register

The **Install** hook writes `@flx` into `components.json`. If that key is missing, add `@flx` → `https://ui.flexnative.com/r/{name}.json`, then continue.

## Find

Prefer a matching local file first.

MCP `search_items_in_registries` — `query` plus `registries: ["@flx"]`. Then `view_items_in_registries` or `get_item_examples_from_registries`.

## Install

1. **Bash:** `bunx shadcn add @flx/<name> -y` (optional: `--dry-run` / `--view` first).
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Match the new file to neighboring primitives and Reforma tokens (`app/tokens/`). No raw hex.
