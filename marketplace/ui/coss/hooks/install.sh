#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bunx shadcn registry add '@coss=https://coss.com/ui/r/{name}.json' --silent
