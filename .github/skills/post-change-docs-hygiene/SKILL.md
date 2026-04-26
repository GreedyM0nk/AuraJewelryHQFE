---
name: post-change-docs-hygiene
description: "Use when: adding/removing features, routes, pages, APIs, scripts, or project structure. Ensures README and .gitignore are updated before finishing the task."
---

# Post-Change Docs Hygiene

## Purpose
Keep project documentation and ignore rules aligned whenever implementation changes are made.

## Trigger Keywords
- add feature
- remove feature
- structural change
- new route
- new page
- new API
- update docs
- update readme
- update gitignore

## Required Workflow
1. Detect scope of code change:
- New/removed files or folders
- New/removed routes or endpoints
- New/removed scripts or commands
- New generated artifacts or local-only files

2. Update README after implementation:
- Routes table
- Folder structure
- API/modules summary
- Setup/test/run commands (if changed)

3. Update `.gitignore` only when needed:
- Add generated artifacts, caches, coverage outputs, local env files
- Avoid broad ignore patterns that hide source files

4. Verify consistency:
- README reflects the current file tree and behavior
- `.gitignore` excludes only non-source local/generated files
- Mention both updates in the task summary

## Guardrails
- Never ignore source directories (`src`, `app`, `backend/app`, etc.)
- Never remove existing ignore rules unless obsolete and confirmed
- Keep README concise and accurate; avoid speculative content
