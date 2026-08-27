#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
[ -f components.json ] || exit 0
bun -e '
const p = "components.json";
const j = JSON.parse(await Bun.file(p).text());
if (!j.registries?.["@tailark-oss"]) process.exit(0);
delete j.registries["@tailark-oss"];
if (Object.keys(j.registries).length === 0) delete j.registries;
await Bun.write(p, JSON.stringify(j, null, 4) + "\n");
'
