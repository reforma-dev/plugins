#!/bin/sh
# Demo fixture: block obviously destructive Bash (exit 2 = deny).
input=$(cat)
case "$input" in
    *"rm -rf"*)
        printf '%s\n' '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"[demo-hooks] blocked rm -rf"}}' >&2
        exit 2
        ;;
esac
exit 0
