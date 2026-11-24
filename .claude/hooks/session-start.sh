#!/bin/bash
# Installs dependencies so tests and builds work at the start of a Claude Code session.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  npm ci --no-audit --no-fund >/dev/null
fi
