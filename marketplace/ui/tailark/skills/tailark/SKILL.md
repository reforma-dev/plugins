---
name: tailark
disable-user-invocation: true
description: >-
  Installs Tailark marketing blocks and pages from the @tailark-oss registry.
  Use when the Tailark kit is installed and a needed @tailark-oss item is
  missing.
---

# Tailark

Opt-in kit on top of the shadcn / Tailwind system. Marketing blocks and pages (heroes, pricing, footers) — not a second primitive set. Official shadcn stays the default for `components/ui`.

This starter is shadcn v4 / Base UI. Register the free OSS namespace first.

Registry: `@tailark-oss` → `https://oss.tailark.com/r/{name}.json` (Mist, Dusk, Veil — no account). Docs: `https://tailark.com/docs`.

Do not add the Radix path (`…/r/radix/{name}.json`) unless this project actually uses Radix primitives.

Paid Quartz content is a separate namespace (`@tailark` → `https://tailark.com/r/{name}.json`) and needs their API key. Skip it unless the user already has a key.

## Register

The **Install** hook runs `bunx shadcn registry add`. If `@tailark-oss` is missing, run `bunx shadcn registry add '@tailark-oss=https://oss.tailark.com/r/{name}.json'`, then continue.

## Find

Prefer a matching local file first.

MCP `search_items_in_registries` — `query` plus `registries: ["@tailark-oss"]`. Then `view_items_in_registries` or `get_item_examples_from_registries`.

## Install

1. **Bash:** `bunx shadcn add @tailark-oss/<name> -y` (optional: `--dry-run` / `--view` first).
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Match the new file to neighboring primitives and Reforma tokens (`app/tokens/`). No raw hex.
