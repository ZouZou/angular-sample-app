---
description: Run comprehensive security audit on codebase
---

Perform a comprehensive security audit of the Angular frontend and Node.js backend using the security-auditor agent.

## Objective

Identify security vulnerabilities, authentication issues, authorization flaws, input validation gaps, and OWASP Top 10 vulnerabilities across the entire codebase.

## Audit Scope

### 1. Authentication & Authorization
- JWT token implementation and security
- Password hashing and storage (bcrypt configuration)
- Login/logout flows
- Session management
- Role-based access control (RBAC)
- Authorization guards (frontend and backend)
- Token expiration and refresh mechanisms

### 2. Input Validation & Sanitization
- API endpoint input validation
- Frontend form validation
- File upload validation
- SQL injection prevention (TypeORM usage)
- XSS prevention (Angular sanitization)
- Data type validation
- Length and range checks

### 3. Secrets & Credential Management
- Hardcoded credentials scan
- Environment variable usage
- .env file configuration
- API keys protection
- Database credentials security
- JWT secrets strength

### 4. API Security
- CORS configuration
- Rate limiting implementation
- HTTP method security
- Error message exposure
- Sensitive data in responses
- Authentication on protected endpoints
- Authorization checks

### 5. Data Protection
- HTTPS enforcement
- Sensitive data encryption
- Password reset security
- Personal data handling (GDPR)
- Data in localStorage vs httpOnly cookies
- Logging of sensitive information

### 6. Frontend Security
- Token storage security
- XSS vulnerabilities
- CSRF protection
- Angular security features usage
- Sensitive data in client code
- Production build configuration

### 7. Database Security
- Parameterized queries (TypeORM)
- Database user privileges
- Connection security
- Migration safety
- Sensitive data encryption

### 8. Dependency Security
- npm audit results
- Outdated packages
- Known vulnerabilities
- Dependency risk assessment

## Execution Steps

1. **Launch Security Auditor Agent**
   - Use Task tool with security-auditor agent
   - Provide full codebase context
   - Focus on high-risk areas first

2. **Scan Priority Areas**
   - Authentication controllers and services
   - API endpoints with user input
   - Database query implementations
   - Environment configuration files
   - Password and credential handling

3. **Check Security Configuration**
   - Review .env.example for secrets
   - Check CORS settings in backend
   - Verify helmet.js or security headers
   - Review Angular security settings

4. **Dependency Audit**
   - Run `npm audit` for both frontend and backend
   - Check for critical/high vulnerabilities
   - Review dependency tree for risks

5. **Generate Security Report**
   - Categorize findings by severity (Critical, High, Medium, Low)
   - Provide file locations with line numbers
   - Include fix recommendations
   - Calculate security score

## Expected Deliverables

### Security Audit Report Format:

```markdown
# Security Audit Report
**Date:** [timestamp]
**Auditor:** security-auditor agent
**Scope:** Full-stack Angular + Node.js application

## Executive Summary
- Total Issues: [count]
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]
- Security Score: [X/10]

## Critical Issues (Fix Immediately)
[Detailed list with locations and fixes]

## High Priority Issues (Fix Before Production)
[Detailed list with locations and fixes]

## Medium Priority Issues (Should Fix)
[Detailed list with locations and fixes]

## Low Priority Issues (Best Practices)
[Detailed list with locations and fixes]

## Security Strengths
[What's done well]

## Recommended Actions
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## Compliance Status
- OWASP Top 10: [status]
- GDPR: [status]
- Data Protection: [status]
```

## Files to Audit

### Backend Priority Files:
- `backend/src/controllers/authController.ts` - Authentication logic
- `backend/src/services/authService.ts` - Auth business logic
- `backend/src/middleware/auth.ts` - Auth middleware
- `backend/src/config/jwt.ts` - JWT configuration
- `backend/src/config/database.ts` - Database configuration
- `backend/.env.example` - Environment template
- `backend/src/app.ts` - App configuration (CORS, security headers)
- All controller files - Input validation
- All entity files - Data models

### Frontend Priority Files:
- `src/app/core/interceptors/*` - HTTP interceptors
- `src/app/core/guards/*` - Route guards
- `src/app/course/services/auth.service.ts` - Auth service
- `src/environments/*` - Environment configurations
- All form components - Input validation
- Any components using innerHTML or bypassSecurity

### Configuration Files:
- `.gitignore` - Ensure .env files ignored
- `package.json` (both) - Dependencies
- `tsconfig.json` - TypeScript security settings
- `angular.json` - Production build settings

## Common Issues to Check

### Backend:
```typescript
// ❌ BAD: Hardcoded secret
const token = jwt.sign(payload, 'my-secret-key');

// ✅ GOOD: Environment variable
const token = jwt.sign(payload, process.env.JWT_SECRET);

// ❌ BAD: No input validation
app.post('/users', async (req, res) => {
  await userRepository.save(req.body);
});

// ✅ GOOD: Input validation
app.post('/users', validateInput, async (req, res) => {
  const { email, name } = req.body;
  // ... validation logic
});

// ❌ BAD: CORS wildcard in production
app.use(cors({ origin: '*' }));

// ✅ GOOD: Specific origins
app.use(cors({ origin: process.env.FRONTEND_URL }));
```

### Frontend:
```typescript
// ❌ BAD: Token in localStorage
localStorage.setItem('token', token);

// ✅ GOOD: httpOnly cookie (set by backend)
// Token automatically sent with requests

// ❌ BAD: Sensitive data in code
const apiKey = 'sk_live_12345...';

// ✅ GOOD: Environment variable
const apiUrl = environment.apiUrl;
```

## Post-Audit Actions

1. **Review Report** - Read all findings carefully
2. **Prioritize Fixes** - Address critical issues first
3. **Create Tickets** - Track remediation work
4. **Fix Issues** - Implement recommended solutions
5. **Re-Audit** - Run security scan again after fixes
6. **Document** - Update security documentation

## Frequency Recommendation

- **Before Production:** Always run security audit
- **Before Merges:** Run on significant changes
- **Weekly:** Run on development branch
- **After Dependency Updates:** Check for new vulnerabilities
- **Quarterly:** Full comprehensive audit

## Integration with Workflow

```bash
# Manual execution
/security

# Before deployment (recommended)
/security && /build && /test

# Full quality check
/lint && /security && /test && /build
```

## Success Criteria

✅ Security audit completes successfully
✅ No critical vulnerabilities found
✅ No hardcoded secrets detected
✅ npm audit shows 0 high/critical vulnerabilities
✅ All authentication/authorization properly implemented
✅ Input validation on all endpoints
✅ OWASP Top 10 covered

## Notes

- This command uses the `security-auditor` agent
- Audit focuses on common vulnerabilities
- Provides actionable fix recommendations
- Does not replace professional penetration testing
- Should be run regularly, not just once

---

**Remember:** Security is an ongoing process, not a one-time check. Regular audits help maintain a secure application.
