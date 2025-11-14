---
description: Perform comprehensive code review on recent changes
---

Perform a comprehensive code quality review using the code-reviewer agent.

## What to Review

Use the `code-reviewer` agent to analyze:

1. **Recent Git Changes**
   - Run: `git diff HEAD~1` to see latest changes
   - Or review uncommitted changes: `git diff`
   - Focus on files that have been modified

2. **Review Focus**
   - Security vulnerabilities (OWASP top 10)
   - Performance issues
   - TypeScript best practices
   - Angular/React patterns
   - Backend API security
   - Accessibility compliance
   - Error handling
   - Code maintainability

3. **Output Format**
   - 🔴 Critical Issues (security, breaking changes)
   - 🟡 Important Issues (performance, best practices)
   - 🟢 Suggestions (code quality improvements)
   - ✅ Positive observations

**Usage:**
- Review specific file: Provide the file path to review
- Review recent changes: Reviews latest git diff
- Review specific component/service: Provide component name
