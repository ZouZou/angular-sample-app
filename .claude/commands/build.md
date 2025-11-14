---
description: Build frontend and backend with error reporting
---

Build both the Angular frontend and Node.js backend, reporting any compilation errors or warnings.

## Steps

1. **Build Angular Frontend**
   - Execute: `npm run build`
   - Check for TypeScript compilation errors
   - Check for template errors
   - Check for bundle size warnings
   - Report build success or failure

2. **Build Backend** (TypeScript compilation)
   - Navigate to backend directory
   - Execute: `cd backend && npx tsc --noEmit`
   - Check for TypeScript errors
   - Report compilation success or failure

3. **Provide Summary**
   - Build status for frontend and backend
   - Any errors with file locations (file:line format)
   - Any warnings that should be addressed
   - Bundle size information for frontend
   - Suggestions for fixing errors if any

If build fails:
- Show exact error messages
- Highlight file locations
- Suggest potential fixes
- Prioritize errors by severity
