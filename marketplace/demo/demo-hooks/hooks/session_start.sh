#!/bin/sh
# Demo fixture: inject visible SessionStart context for manual QA.
printf '%s\n' '{"hookSpecificOutput":{"additionalContext":"[demo-hooks] SessionStart"}}'
