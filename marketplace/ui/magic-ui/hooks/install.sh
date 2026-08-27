#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
[ -f components.json ] || exit 0
if bun -e 'const j = JSON.parse(await Bun.file("components.json").text()); process.exit(j.registries?.["@magicui"] ? 0 : 1)'; then
  exit 0
fi
bunx shadcn registry add '@magicui=https://magicui.design/r/{name}.json' --silent
