---
description: Check code quality and formatting for frontend and backend
---

Run linting and code quality checks on both Angular frontend and Node.js backend.

## Steps

1. **Lint Angular Frontend**
   - Execute: `npx ng lint` (if ESLint is configured)
   - Or check manually for common issues:
     - Unused imports
     - Console.log statements
     - Any types usage
     - Missing type annotations
     - Inconsistent formatting

2. **Lint Backend**
   - Navigate to backend directory
   - Execute: `cd backend && npx eslint src --ext .ts` (if ESLint is configured)
   - Or check manually for common issues:
     - Unused imports
     - Console.log statements
     - Any types usage
     - Missing error handling
     - Security issues

3. **Check TypeScript Strict Mode**
   - Verify strict mode is enabled in tsconfig.json
   - Report any non-strict configurations

4. **Provide Summary**
   - Total linting issues found
   - Breakdown by severity (errors, warnings)
   - File locations for each issue (file:line format)
   - Auto-fixable issues (if any)
   - Suggestions for configuration improvements

**Common Issues to Report:**
- `any` type usage (should use proper types)
- Unused variables or imports
- console.log statements (use proper logging)
- Missing error handling
- Inconsistent code style
- Security vulnerabilities (hardcoded secrets, SQL injection risks)
