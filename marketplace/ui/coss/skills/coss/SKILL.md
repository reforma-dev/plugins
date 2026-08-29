---
name: coss
disable-user-invocation: true
description: >-
  Installs coss primitives and particles from the @coss registry. Use when the
  coss kit is installed and a needed @coss component or particle is missing.
---

# coss

Opt-in kit on top of the shadcn / Tailwind system. Official shadcn stays the default for primitives already in `components/ui`.

Registry: `@coss` → `https://coss.com/ui/r/{name}.json`. Docs: `https://coss.com/ui/llms.txt`. Particles: names `p-…`.

Do not add `@coss/ui` or `@coss/style` wholesale (fights the starter theme). One name at a time.

## Register

The **Install** hook runs `bunx shadcn registry add`. If `@coss` is missing, run `bunx shadcn registry add '@coss=https://coss.com/ui/r/{name}.json'`, then continue.

## Find

Prefer a matching local `components/ui/*` first.

MCP `search_items_in_registries` — `query` plus `registries: ["@coss"]`. Then `view_items_in_registries` or `get_item_examples_from_registries`.

## Install

1. **Bash:** `bunx shadcn add @coss/<name> -y` (optional: `--dry-run` / `--view` first).
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Match the new file to neighboring primitives and Reforma tokens (`app/tokens/`). No raw hex.
