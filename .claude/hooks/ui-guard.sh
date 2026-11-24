#!/bin/bash
# PostToolUse: after Claude edits anything under src/, run the design-system
# guard so a broken rule is caught at the edit that broke it. Silent when it
# passes; on failure prints what broke to stderr and exits 2, which hands the
# message back to Claude to fix. Rules: .claude/skills/ui-change/SKILL.md
set -uo pipefail

path=$(python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
t = d.get("tool_input") or {}
print(t.get("file_path") or t.get("path") or "")
' 2>/dev/null)

case "$path" in
  */src/*.css|*/src/*.tsx|*/src/*.ts|*/src/assets/*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}" || exit 0
[ -d node_modules ] || exit 0

out=$(npx vitest run src/__tests__/designSystemHolds.test.ts 2>&1)
if [ $? -ne 0 ]; then
  {
    echo "Design guardrail broken by the edit to ${path#"$PWD"/}:"
    printf '%s\n' "$out" | sed 's/\x1b\[[0-9;]*m//g' \
      | grep -E '^\s*(\+ +"|FAIL|AssertionError)' | sed 's/^\s*+ *//' | head -20
    echo "Fix the code (tokens, scoped selectors, copy in content.ts), never the guard."
    echo "See .claude/skills/ui-change/SKILL.md and docs/design.md."
  } >&2
  exit 2
fi
exit 0
