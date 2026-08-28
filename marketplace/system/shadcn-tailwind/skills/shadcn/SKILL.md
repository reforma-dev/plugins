---
name: shadcn
disable-user-invocation: true
description: >-
  Installs and composes official shadcn/ui primitives. Use when a needed
  component is missing from components/ui, when running the shadcn CLI or MCP,
  or when editing components.json.
---

# shadcn

Starter already has `components.json`, Tailwind 4, shadcn v4 (Base UI), and Reforma tokens. Do not re-init. Do not add a second UI framework.

Official registry is the default. Other `@ns` kit registries only when that kit's card is installed — the kit **Install** hook writes `registries` in `components.json`. MCP reads every registry in that file.

Layout classes, `gap-*`, `size-*`, token CSS: **Skill** `tailwind`.

## Find

Prefer a matching local `components/ui/*` if it already exists.

1. MCP `search_items_in_registries` — `query` plus optional `registries` / `types`.
2. MCP `view_items_in_registries` or `get_item_examples_from_registries` for files and demos.

## Install

1. **Bash:** `bunx shadcn add <name> -y` (optional: `--dry-run` / `--diff` first). MCP `get_add_command_for_items` only returns the command — still run it.
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Read the added file. Match neighboring primitives — reuse their class patterns / compose with existing `Button` / `Input` / `Field`. `cn` from `@/lib/utils`. Colors: active collection CSS (`app/tokens/collections.json` → `active` → `file`), not `tokens/tailwind.css`. No raw hex.

## Compose

Existing components first. Variants before custom classes. `className` on a primitive is layout (`max-w-md`, `mt-4`), not a color/type restyle.

Forms: `FieldGroup` + `Field` (`data-invalid` on `Field`, `aria-invalid` on the control). Icons in `Button`: `data-icon="inline-start"` / `inline-end`, no sizing classes on the icon. Overlays need a Title (`DialogTitle`, `SheetTitle`, `DrawerTitle`). Do not set `z-*` on Dialog / Sheet / Drawer / Popover — they stack themselves.
