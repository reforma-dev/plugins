---
name: web-design-guidelines
disable-user-invocation: true
description: >-
  Audits UI code against Vercel Web Interface Guidelines (a11y, focus, forms).
  Use when reviewing UI, checking accessibility, auditing design or UX, or
  checking the site against web best practices.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Web Interface Guidelines

Starter is `app/` (no `src/`), bun.

Review files for compliance with Web Interface Guidelines.

## How It Works

1. **Fetch** the latest guidelines from the source URL below
2. Read the files they changed this turn, or the route they named. If still unclear, ask.
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format
5. **PageScreenshot** the audited route once (default `/`). On timeout or error, note it and stop.

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use **Fetch** to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines
5. **PageScreenshot** that route once
