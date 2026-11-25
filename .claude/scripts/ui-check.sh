#!/bin/bash
# Every check a UI change must pass before it is pushed, in one run.
#   1. design-system guard (tokens, scoping, copy, icons, images)
#   2. unit tests
#   3. typecheck + production build
#   4. browser guardrails + e2e on desktop and phone (against the build)
# Stops at the first failure and says which step it was.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

step() { printf '\n== %s\n' "$1"; }
fail() { printf '\nui-check FAILED at: %s\n' "$1" >&2; exit 1; }

step "design-system guard"
npx vitest run src/__tests__/designSystemHolds.test.ts --reporter=dot || fail "design-system guard"

step "unit tests"
npx vitest run --reporter=dot || fail "unit tests"

step "typecheck + build"
npm run build --silent >/dev/null || fail "build"

step "browser guardrails + e2e (desktop, tablet, phone)"
npx playwright test --trace off --reporter=line || fail "browser guardrails / e2e"

printf '\nui-check passed.\n'
