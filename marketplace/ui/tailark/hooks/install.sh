#!/bin/sh
set -e
cd "${REFORMA_PROJECT_DIR:?}"
bunx shadcn registry add '@tailark-oss=https://oss.tailark.com/r/{name}.json' --silent
