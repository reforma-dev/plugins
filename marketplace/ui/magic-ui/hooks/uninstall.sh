#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bun -e '
const ns = "@magicui";
for (const p of ["components.json", "package.json"]) {
  if (!await Bun.file(p).exists()) continue;
  const j = JSON.parse(await Bun.file(p).text());
  if (!j.registries?.[ns]) continue;
  delete j.registries[ns];
  if (Object.keys(j.registries).length === 0) delete j.registries;
  await Bun.write(p, JSON.stringify(j, null, 2) + "\n");
}
'
