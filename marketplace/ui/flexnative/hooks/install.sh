#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bunx shadcn registry add '@flx=https://ui.flexnative.com/r/{name}.json' --silent
