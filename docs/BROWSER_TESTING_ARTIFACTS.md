# Browser Testing & Screenshots Skill

**Purpose**: Prevent browser testing artifacts (screenshots, traces, HAR files) from being accidentally committed to version control.

## Overview

When running browser automation tests or verification scripts (using Playwright, Puppeteer, Chrome DevTools, etc.), temporary files are generated that should never be committed to Git:
- **Screenshots**: `.png`, `.jpg`, `.jpeg`, `.gif`
- **Performance traces**: `trace.json`, `trace.json.gz`
- **Network logs**: `*.har`
- **Playwright artifacts**: `.playwright-mcp/` directory

## .gitignore Configuration

The repository `.gitignore` includes the following patterns:

```gitignore
# Browser Testing & Screenshots
*.png
*.jpg
*.jpeg
*.gif
.playwright-mcp/
page-*.{png,jpg,jpeg}
screenshot-*.{png,jpg,jpeg}
trace.json
trace.json.gz
*.har
```

## Common Browser Testing Tools & Artifacts

### Playwright (with MCP)
- **Screenshot files**: `page-2026-04-25T12-47-31-727Z.{png,jpg}`
- **Snapshot files**: `.playwright-mcp/page-*.yml`
- **Output**: Saved to current directory or specified path

**When taking screenshots:**
```javascript
// Good - Saves to temp/ignored directory
await page.screenshot({ path: '.playwright-artifacts/page.png' });

// Also good - Use relative temp paths
await page.screenshot({ path: 'screenshots/page.png' });
```

### Chrome DevTools Protocol
- **Performance traces**: `trace.json`, `trace.json.gz`
- **HAR files**: Network logs ending in `.har`

**When recording traces:**
```bash
# Traces should be saved to ignored paths
node my-script.js --trace-output .trace-cache/
```

## Best Practices

1. **Always verify before committing**: Run `git status` to check for unintended screenshot files
2. **Use meaningful ignore patterns**: Group related artifacts and comment why they're ignored
3. **Create temp directories**: If taking screenshots in tests, output to `.playwright-mcp/`, `screenshots/`, or `traces/` directories
4. **Document the practice**: Keep this skill file updated as new artifact types are discovered
5. **Review .gitignore periodically**: After adding new testing tools, update patterns if needed

## Verification

To check if screenshots are properly ignored:

```bash
# List ignored files
git check-ignore -v *.png *.jpg trace.json

# Verify nothing unintended is staged
git status
```

## Related Files

- `.gitignore` - Main git ignore configuration
- `.github/workflows/db-health-check.yml` - Uses browser testing for API verification
- `frontend/` - Frontend browser tests may generate artifacts

## When to Update

Add new patterns when:
- A new browser testing library is introduced
- New artifact file types are discovered
- Build/test processes generate new temporary files
