# Reforma plugins

Marketplace for Reforma integrations. Each plugin is a folder with `.reforma-plugin/plugin.json` (Cursor/Codex/Claude manifests are a fallback).

```text
marketplace.json          # categories + plugin index
reforma/<name>/           # first-party plugins
third_party/<name>/       # vendored plugins
```

`source` in `marketplace.json` is a path in this repo (`./reforma/demo-kit`) or a GitHub tree URL. Pack resolves remotes into a snapshot; the API never fetches GitHub at runtime.

```sh
bun run pack              # writes dist/catalog + dist/catalog.tar.gz
```

Push to `main` or `dev` publishes a `catalog-<sha>` GitHub Release. Local and staging API try `dev`, then `main`. Prod bakes `main`.
