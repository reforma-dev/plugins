#!/bin/sh
# demo-kit: block obvious rm -rf via Bash PreToolUse (exit 2 = deny).
input=$(cat)
case "$input" in
    *"rm -rf"*)
        printf '%s\n' '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"[demo-kit] blocked rm -rf"}}' >&2
        exit 2
        ;;
esac
exit 0
