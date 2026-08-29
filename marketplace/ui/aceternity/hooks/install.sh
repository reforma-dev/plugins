#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bunx shadcn registry add '@aceternity=https://ui.aceternity.com/registry/{name}.json' --silent
