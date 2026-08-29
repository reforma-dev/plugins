#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bunx shadcn registry add '@magicui=https://magicui.design/r/{name}.json' --silent
