---
description: Comprehensive code quality and metrics analysis
---

Analyze codebase for quality metrics, technical debt, dependencies, test coverage, and generate actionable insights.

## Objective

Provide comprehensive analysis of code quality, architecture, dependencies, test coverage, and technical debt to guide refactoring and improvement efforts.

## Usage

```bash
/analyze              # Run full analysis
/analyze quality      # Code quality metrics only
/analyze dependencies # Dependency analysis
/analyze coverage     # Test coverage analysis
/analyze debt         # Technical debt assessment
```

## Analysis Workflow

### Phase 1: Code Metrics 📊

**Lines of Code (LOC) Analysis:**
```
Frontend (Angular):
- Total LOC: 18,542
- TypeScript: 14,230 (77%)
- HTML: 2,845 (15%)
- CSS/SCSS: 1,467 (8%)
- Test files: 3,245 (18% of TS)

Backend (Node.js):
- Total LOC: 12,387
- TypeScript: 11,234 (91%)
- Test files: 1,153 (10%)

Comments:
- Comment ratio: 12% (target: >15%)
- Documentation coverage: 68% (target: >80%)
```

**Cyclomatic Complexity:**
```
High Complexity Functions (>10):
🔴 src/app/course/services/course.service.ts:calculateProgress() - 15
🔴 backend/src/services/quizService.ts:gradeQuiz() - 18
🟡 src/app/quiz/quiz-player.component.ts:submitQuiz() - 12
🟡 backend/src/controllers/authController.ts:login() - 11

Recommendations:
- Refactor gradeQuiz() - split into smaller functions
- Extract validation logic from login() into separate method
- Consider strategy pattern for calculateProgress()
```

**Code Duplication:**
```
Duplicated Code Blocks Found: 8

🔴 HIGH: Course validation logic duplicated in 3 files
   Files:
   - src/app/course/course-form.component.ts:45-68
   - src/app/course/course-edit.component.ts:52-75
   - backend/src/validators/courseValidator.ts:12-35
   Suggestion: Extract to shared validator service

🟡 MEDIUM: HTTP error handling duplicated in 12 services
   Pattern: try-catch with same error mapping
   Suggestion: Create HTTP error interceptor
```

### Phase 2: Dependency Analysis 🔗

**Frontend Dependencies:**
```
Total Dependencies: 45
- Direct: 28
- Dev: 17
- Outdated: 7
- Vulnerable: 2 (1 high, 1 moderate)

Largest Dependencies:
1. @angular/core (2.1 MB)
2. @angular/material (1.8 MB)
3. rxjs (891 KB)
4. chart.js (245 KB)
5. lodash-es (142 KB)

Unused Dependencies:
- moment (use date-fns instead)
- jquery (not needed with Angular)
- bootstrap (using Material Design)

Vulnerable Packages:
🔴 HIGH: axios@0.21.1 (CVE-2021-3749)
   Fix: npm install axios@latest
🟡 MODERATE: minimist@1.2.5 (CVE-2021-44906)
   Fix: npm update minimist
```

**Backend Dependencies:**
```
Total Dependencies: 32
- Direct: 24
- Dev: 8
- Outdated: 5
- Vulnerable: 1

Circular Dependencies: 3 found
🔴 auth.service.ts → user.service.ts → auth.service.ts
🟡 course.service.ts → enrollment.service.ts → course.service.ts
```

**Dependency Tree Visualization:**
```
myapp
├── @angular/core@20.3.10
│   ├── rxjs@7.8.2
│   └── zone.js@0.15.0
├── @angular/material@20.2.11
│   ├── @angular/cdk@20.2.11
│   └── @angular/animations@20.3.10
└── typeorm@0.3.20
    ├── pg@8.11.3
    └── reflect-metadata@0.2.1
```

### Phase 3: Test Coverage Analysis 🧪

**Coverage Report:**
```
Frontend Coverage:
- Statements: 68% (target: >80%)
- Branches: 62% (target: >75%)
- Functions: 71% (target: >80%)
- Lines: 69% (target: >80%)

Backend Coverage:
- Statements: 75% (target: >80%)
- Branches: 68% (target: >75%)
- Functions: 72% (target: >80%)
- Lines: 76% (target: >80%)

Uncovered Critical Files:
🔴 auth.service.ts - 45% coverage
🔴 payment.service.ts - 38% coverage
🟡 course.service.ts - 72% coverage
🟡 quiz.service.ts - 68% coverage
```

**Coverage by Module:**
```
| Module        | Statements | Branches | Functions | Lines |
|---------------|------------|----------|-----------|-------|
| Auth          | 65%        | 58%      | 67%       | 66%   |
| Course        | 78%        | 72%      | 82%       | 79%   |
| Quiz          | 71%        | 65%      | 73%       | 72%   |
| Enrollment    | 82%        | 76%      | 85%       | 83%   |
| Payment       | 42%        | 35%      | 45%       | 43%   |
```

**Test Quality Metrics:**
```
Total Tests: 245
- Unit tests: 189 (77%)
- Integration tests: 42 (17%)
- E2E tests: 14 (6%)

Test Execution Time: 18.5s
- Fast tests (<100ms): 201 (82%)
- Slow tests (>1s): 12 (5%)

Flaky Tests: 3
⚠️ course-list.component.spec.ts - fails intermittently
⚠️ quiz-submission.spec.ts - timing issues
```

### Phase 4: Technical Debt Assessment 💳

**Debt Indicators:**
```
TODO Comments: 47
- Critical: 8
- High: 15
- Medium: 18
- Low: 6

FIXME Comments: 12
🔴 Fix authentication race condition (auth.service.ts:145)
🔴 Handle concurrent quiz submissions (quiz.controller.ts:78)
🟡 Optimize course search query (search.service.ts:234)

Deprecated API Usage: 6
⚠️ Using deprecated TypeORM findOne syntax in 4 files
⚠️ Using deprecated Angular HttpModule in 2 files

Code Smells:
- Long methods (>50 lines): 23
- Large classes (>500 lines): 4
- Deep nesting (>4 levels): 8
- Magic numbers: 34
```

**Technical Debt Score:**
```
Overall Debt Score: 6.8/10 (Good)

Breakdown:
- Code Quality: 7.2/10
- Test Coverage: 6.8/10
- Documentation: 6.5/10
- Dependencies: 7.5/10
- Architecture: 7.8/10

Estimated Effort to Resolve:
- Critical issues: 16 hours
- High priority: 32 hours
- Medium priority: 48 hours
- Total: 96 hours (12 days)
```

### Phase 5: Architecture Analysis 🏗️

**Module Structure:**
```
Modules: 8
- Core Module: ✅ Single instance
- Shared Module: ✅ Properly exported
- Feature Modules: 6
  - Course Module: ✅ Lazy loaded
  - Quiz Module: ⚠️ Not lazy loaded
  - Auth Module: ✅ Lazy loaded
  - Dashboard Module: ⚠️ Not lazy loaded
  - Admin Module: ✅ Lazy loaded
  - Payment Module: ✅ Lazy loaded

Coupling Issues:
🔴 HIGH: Shared module depends on feature module (anti-pattern)
🟡 MEDIUM: Circular dependency between course and enrollment modules
```

**Design Patterns Usage:**
```
Identified Patterns:
✅ Singleton (Services)
✅ Observer (RxJS Observables)
✅ Factory (Component factories)
✅ Dependency Injection
⚠️ Missing Repository pattern (database layer)
⚠️ Missing Strategy pattern (payment processing)
```

**SOLID Principles Violations:**
```
Single Responsibility:
🔴 CourseService handles business logic + database + caching (3 responsibilities)
🟡 AuthController handles auth + user management + email (3 responsibilities)

Open/Closed:
🟡 Payment processing not extensible for new providers

Dependency Inversion:
🔴 Controllers directly depend on concrete database repositories
```

## Output Format

```markdown
📈 Code Analysis Report
=======================

## Executive Summary
- Overall Code Quality: B+ (83/100)
- Technical Debt: Low-Medium
- Test Coverage: 72% (target: 80%)
- Dependencies: 7 outdated, 2 vulnerable
- Critical Issues: 5
- Recommended Actions: 12

## Key Metrics

| Category              | Score  | Status | Target |
|-----------------------|--------|--------|--------|
| Code Quality          | 7.2/10 | 🟢     | >7.0   |
| Test Coverage         | 72%    | 🟡     | >80%   |
| Documentation         | 68%    | 🟡     | >80%   |
| Dependency Health     | 85%    | 🟢     | >80%   |
| Performance Score     | 92     | 🟢     | >90    |

## Critical Issues

### 🔴 High Complexity in gradeQuiz()
**File:** backend/src/services/quizService.ts:45
**Complexity:** 18 (threshold: 10)
**Impact:** Hard to maintain and test
**Recommendation:** Refactor into smaller functions
**Effort:** 4 hours

### 🔴 Security Vulnerability in axios
**Package:** axios@0.21.1
**Severity:** HIGH
**CVE:** CVE-2021-3749
**Fix:** npm install axios@latest
**Effort:** 15 minutes

### 🔴 Missing Test Coverage in PaymentService
**Coverage:** 38% (target: >80%)
**Missing:** Error scenarios, webhook handling, refund logic
**Recommendation:** Add unit tests for all payment flows
**Effort:** 8 hours

## Dependency Report

### Outdated Packages (7)
- @angular/core: 20.3.10 → 20.3.12 (patch)
- typeorm: 0.3.20 → 0.3.22 (minor)
- pg: 8.11.3 → 8.12.0 (minor)

### Vulnerable Packages (2)
- axios: HIGH severity - update to latest
- minimist: MODERATE severity - update via npm audit fix

### Unused Packages (3)
- moment (336 KB) - remove, using date-fns
- jquery (88 KB) - not needed
- bootstrap (200 KB) - using Material Design

## Technical Debt

### TODO/FIXME Summary
- Total: 59 comments
- Critical: 8 items
- Estimated effort: 96 hours

### Top 3 Debt Items
1. Refactor authentication race condition (8h)
2. Add comprehensive payment tests (16h)
3. Extract duplicate validation logic (12h)

## Recommendations

### Immediate Actions (This Week)
1. ✅ Fix security vulnerabilities (npm audit fix)
2. ✅ Remove unused dependencies
3. ✅ Add tests for PaymentService
4. ✅ Refactor high-complexity functions

### Short-term (This Month)
1. Increase test coverage to 80%
2. Lazy load all feature modules
3. Extract duplicate code blocks
4. Update documentation

### Long-term (This Quarter)
1. Implement repository pattern
2. Add E2E test coverage
3. Set up automated code quality checks
4. Establish performance budgets

## Trends

| Metric           | Last Month | This Month | Change  |
|------------------|------------|------------|---------|
| LOC              | 28,450     | 30,929     | +8.7%   |
| Test Coverage    | 68%        | 72%        | +4%     |
| Dependencies     | 74         | 77         | +4.1%   |
| Tech Debt Score  | 6.5        | 6.8        | +4.6%   |
```

## Integration with Workflow

```bash
# Weekly quality check
/analyze

# Before PR merge
/lint && /test && /analyze quality

# Monthly debt review
/analyze debt

# Dependency audit
/analyze dependencies && npm audit
```

## Success Criteria

✅ Code quality score > 7.0
✅ Test coverage > 80%
✅ No critical vulnerabilities
✅ Technical debt score > 7.0
✅ Cyclomatic complexity < 10
✅ No circular dependencies
✅ Documentation coverage > 80%

---

**Remember:** Regular analysis helps maintain code quality and prevents technical debt accumulation.
