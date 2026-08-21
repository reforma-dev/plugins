# Reforma plugins

Marketplace plugins for Reforma. Each plugin is a folder with `.reforma-plugin/plugin.json`. Cursor (`.cursor-plugin`), Codex (`.codex-plugin`), and Claude manifests are a fallback.

## Plugins

| name | Plugin | Author | Category | description |
| --- | --- | --- | --- | --- |
| demo-kit | [Demo Kit](reforma/demo-kit) | Reforma | Demo | Test card: several agents and skills. No auth. |
| demo-skills | [Demo Skills](reforma/demo-skills) | Reforma | Demo | Test card: bundled skills, no auth. |
| demo-stdio | [Demo Stdio](reforma/demo-stdio) | Reforma | Demo | Stdio MCP: command/args stay as written. Variables substitute into env at connect. |
| demo-system | [Demo System](reforma/demo-system) | Reforma | Demo | Always-on test card. Cannot disable or uninstall. |
| context7 | [Context7](third_party/context7) | Reforma | Documentation | Up-to-date library docs and code examples. MCP with an API key. |
| google-drive | [Google Drive](third_party/google-drive) | Reforma | Files | Search, read, create, and share files across Drive. |
| notion-workspace | [Notion Workspace](https://github.com/makenotion/cursor-notion-plugin) | Notion Labs | — | Notion Skills + Notion MCP server packaged as a Cursor plugin. |
| dropbox | [Dropbox](https://github.com/dropbox/dropbox-ai-plugins/tree/main/codex) | Dropbox | — | Access, save and share files with Dropbox. |

Author is `plugin.json` `author.name` when present, else Reforma. Category is the Reforma marketplace id; `—` means the upstream manifest has no `.reforma-plugin` category.

## Repository structure

Root `marketplace.json` lists plugins. `source` is a path in this repo or a GitHub `tree/…` URL.

```
plugins/
├── marketplace.json           # categories + plugin index
├── reforma/<name>/            # first-party
│   ├── .reforma-plugin/
│   │   └── plugin.json
│   ├── mcp.json               # optional
│   ├── skills/                # optional, SKILL.md per folder
│   └── agents/                # optional
├── third_party/<name>/        # vendored
└── scripts/pack.ts            # snapshot for the API
```

```sh
bun run pack              # writes dist/catalog + dist/catalog.tar.gz
```

Push to `main` or `dev` publishes a `catalog-<7-char-sha>` GitHub Release (keeps the newest 10). Reforma API on local/staging tries `dev`, then `main`. Prod bakes `main`.
