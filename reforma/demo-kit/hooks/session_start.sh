#!/bin/sh
# demo-kit: inject SessionStart context for QA.
printf '%s\n' '{"hookSpecificOutput":{"additionalContext":"[demo-kit] SessionStart"}}'
