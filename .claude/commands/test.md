---
description: Run all tests for frontend and backend
---

Run the complete test suite for both Angular frontend and backend API.

## Steps

1. **Run Angular Frontend Tests**
   - Execute: `npm test -- --watch=false --browsers=ChromeHeadless`
   - Report any test failures with file locations and error details
   - Show test coverage summary

2. **Run Backend Tests** (if backend tests exist)
   - Navigate to backend directory
   - Execute: `cd backend && npm test`
   - Report any test failures with details
   - Show test coverage summary

3. **Provide Summary**
   - Total tests run (frontend + backend)
   - Passed/Failed counts
   - Coverage percentages
   - Any actionable issues found

If tests fail, provide:
- Specific test names that failed
- Error messages and stack traces
- File locations (file:line format)
- Suggested fixes if obvious
