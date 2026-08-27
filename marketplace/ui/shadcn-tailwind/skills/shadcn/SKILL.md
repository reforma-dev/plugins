---
name: shadcn
disable-user-invocation: true
description: >-
  Installs and composes official shadcn/ui primitives on Tailwind. Use when a
  needed component is missing from components/ui, when running the shadcn CLI
  or MCP, or when editing components.json / Tailwind classes in the project.
---

# shadcn / Tailwind

Starter already has `components.json`, Tailwind 4, shadcn v4 (Base UI), and Reforma tokens. Do not re-init. Do not add a second UI framework.

Official registry is the default. Other `@ns` kit registries only when that kit's card is installed. MCP reads every registry in `components.json`.

## Find

Prefer a matching local `components/ui/*` if it already exists.

1. MCP `search_items_in_registries` — `query` plus optional `registries` / `types`.
2. MCP `view_items_in_registries` or `get_item_examples_from_registries` for files and demos.

## Install

1. **Bash:** `bunx shadcn add <name> -y` (optional: `--dry-run` / `--diff` first). MCP `get_add_command_for_items` only returns the command — still run it.
2. If `package.json` / lockfile changed → **InstallDependencies**.
3. Read the added file. Match neighboring primitives — reuse their class patterns / compose with existing `Button` / `Input` / `Field`. Tokens: theme rule (`app/tokens/`). No raw hex.

## Compose

Existing components first. Variants before custom classes. Semantic colors (`bg-background`, `text-muted-foreground`). `cn()` for conditionals. `flex` + `gap-*`, not `space-y-*`. Equal width/height → `size-*`.

Forms: `FieldGroup` + `Field` (`data-invalid` on `Field`, `aria-invalid` on the control). Icons in `Button`: `data-icon="inline-start"` / `inline-end`, no sizing classes on the icon. Overlays need a Title (`DialogTitle`, `SheetTitle`, `DrawerTitle`).
