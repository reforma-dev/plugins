# Reforma plugins

> **Developer documentation:** For the complete guide to authoring plugins, manifests, skills, rules, tools, and MCP servers, visit **[docs.reforma.ai/integrations](https://docs.reforma.ai/integrations)**.

Source repository for the Reforma plugin catalog.

Plugins use the [Agent Plugins](https://agent-plugins.org/) format: a root `plugin.json`, optional capability folders, and Reforma-specific manifest fields under `extensions.reforma`.

This repository contains:

- the catalog index in `marketplace.json`
- first-party and vendored plugin sources under `marketplace/`
- pinned plugins sourced from external GitHub repositories
- the packer that normalizes those sources into the catalog consumed by Reforma

## Repository structure

```text
plugins/
├── marketplace.json
├── marketplace/
│   ├── _brand/
│   └── <category>/
│       └── <plugin>/
├── scripts/
│   └── pack/
└── dist/                 # generated
```

`marketplace.json` is the source of truth for which plugins are included in the catalog and which category each plugin belongs to.

A local plugin usually looks like:

```text
marketplace/<category>/<name>/
├── plugin.json
├── assets/
│   └── logo.svg
├── skills/
├── rules/
├── agents/
├── hooks/
├── tools/
└── mcp.json
```

Only `plugin.json` is required. Add only the capabilities the plugin needs.

## Setup

```sh
bun install
bun run pack
```

`bun run pack` writes:

```text
dist/catalog/
dist/catalog.tar.gz
```

Treat `dist/` as generated output.

## Add a plugin

Add the plugin to a category in `marketplace.json`:

```json
{
  "id": "files",
  "name": "Files",
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./marketplace/files/my-plugin"
    }
  ]
}
```

`source` can point to either:

```text
./marketplace/<category>/<name>
```

or a pinned GitHub tree:

```text
https://github.com/owner/repo/tree/<commit>/<path>
```

The parent category in `marketplace.json` becomes the plugin's catalog category. Do not maintain a separate category in the source manifest.

Set `"disabled": true` on a listing to keep it in the repository while excluding it from the packed catalog.

For externally maintained plugins, a listing can also provide catalog presentation overrides such as `displayName`, `description`, `brandColor`, and logo assets.

## Source format

New Reforma plugins should use the canonical Agent Plugins layout directly:

```text
plugin.json
skills/<name>/SKILL.md
rules/*.md
agents/*.md
mcp.json
hooks/hooks.json
tools/*.ts
```

Convention paths do not need to be declared in source `plugin.json`.

Portable Agent Plugins fields stay at the top level of the manifest. Reforma-specific metadata lives under:

```json
{
  "extensions": {
    "reforma": {}
  }
}
```

See the Reforma developer documentation for the authoring contract and capability-specific formats.

## Packing

The packer is a normalization step between plugin source and the catalog consumed by Reforma.

For each catalog entry it:

1. resolves the local or remote source
2. normalizes supported vendor layouts
3. rewrites the manifest into the canonical Reforma catalog form
4. normalizes capability paths
5. normalizes hooks
6. bundles Reforma tools
7. applies catalog presentation overlays
8. normalizes logos
9. discovers available metadata from reachable HTTP MCP servers
10. stamps generated catalog metadata such as category and agent discovery data

The packed representation is a build artifact. Do not use it as the preferred authoring format.

### Compatibility

The packer accepts several layouts used by other agent clients so compatible third-party plugins can be consumed without being forked solely for Reforma.

Supported normalization includes:

- `.cursor-plugin`, `.codex-plugin`, `.claude-plugin`, and legacy `.reforma-plugin` layouts
- custom skill, agent, rule, MCP, hook, and tool paths
- Cursor `rules/*.mdc`
- `.cursor/rules/`
- `instructions/`
- `.mcp.json`

Those formats are compatibility inputs. New Reforma-owned plugins should use the canonical source layout.

### Tools

Source tools under `tools/` are bundled into one `tools.mjs`.

`@reforma/plugin-sdk`, `ai`, and `zod` remain external and are provided by the Reforma runtime.

The packer also generates tool metadata for the catalog UI.

### MCP metadata

For reachable HTTP MCP servers, the packer can discover missing tool, resource, and resource-template metadata for the packed catalog.

It does not pack resource bodies.

Stdio MCP servers are not probed.

## Branding overlays

`marketplace/_brand/<name>/` is used to supply local catalog artwork for externally maintained plugins when the upstream source does not contain suitable Reforma presentation assets.

Prefer keeping branding in the plugin itself when Reforma controls the source.

## Publishing

Pushes to `dev` and `main` build immutable catalog snapshots and publish a GitHub Release named from the commit SHA.

- `dev` is used for development and staging catalog updates.
- `main` is the production catalog source.

CI also publishes catalog logo assets to the public CDN and stamps their final URLs into the packed manifests.

Local `bun run pack` builds the catalog structure but does not reproduce the production CDN publishing step.

## Documentation

Plugin authoring behavior is documented separately in the Reforma developer documentation:

- [Build a plugin](https://docs.reforma.ai/integrations)
- [Plugin format](https://docs.reforma.ai/integrations/manifest)
- [MCP servers](https://docs.reforma.ai/integrations/mcp)
- [Skills](https://docs.reforma.ai/integrations/skills)
- [Rules](https://docs.reforma.ai/integrations/rules)
- [Tools](https://docs.reforma.ai/integrations/tools)
- [Hooks](https://docs.reforma.ai/integrations/hooks)

Keep this README focused on the repository and its build/publishing workflow. Capability semantics belong in the developer documentation.
