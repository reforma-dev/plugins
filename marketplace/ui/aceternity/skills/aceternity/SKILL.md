---
name: aceternity
disable-user-invocation: true
description: >-
  Installs Aceternity blocks and effects from the @aceternity registry. Use
  when the Aceternity kit is installed and a needed @aceternity item is missing.
---

# Aceternity

Opt-in kit on top of the shadcn / Tailwind system. Motion-rich blocks and effects — not a second primitive set. Official shadcn stays the default for `components/ui`.

Registry: `@aceternity` → `https://ui.aceternity.com/registry/{name}.json`. Browse: `https://ui.aceternity.com`.

Some items on the site are paid. Install only names the registry actually returns.

## Register

The **Install** hook runs `bunx shadcn registry add`. If `@aceternity` is missing, run `bunx shadcn registry add '@aceternity=https://ui.aceternity.com/registry/{name}.json'`, then continue.

## Find

Prefer a matching local file first.

MCP `search_items_in_registries` — `query` plus `registries: ["@aceternity"]`. Then `view_items_in_registries` or `get_item_examples_from_registries`.

## Install

1. **Bash:** `bunx shadcn add @aceternity/<name> -y` (optional: `--dry-run` / `--view` first).
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Match the new file to neighboring primitives and Reforma tokens (`app/tokens/`). No raw hex.
