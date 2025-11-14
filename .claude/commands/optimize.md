---
description: Analyze and optimize application performance
---

Run comprehensive performance analysis and apply optimizations using the performance-optimizer agent.

## Objective

Identify and fix performance bottlenecks across frontend, backend, and database to improve application speed, reduce bundle size, and enhance user experience.

## Usage

```bash
/optimize              # Run full optimization analysis
/optimize frontend     # Optimize frontend only
/optimize backend      # Optimize backend only
/optimize database     # Optimize database queries
```

## Optimization Workflow

### Phase 1: Performance Analysis 📊

**Frontend Analysis:**
1. **Bundle Size Analysis**
   - Run webpack-bundle-analyzer
   - Identify large dependencies
   - Find duplicate packages
   - Measure initial load time
   - Check lazy loading implementation

2. **Runtime Performance**
   - Chrome DevTools Lighthouse audit
   - Memory leak detection
   - Change detection cycles
   - Component render times
   - Network requests analysis

3. **Asset Optimization**
   - Image sizes and formats
   - Font loading strategy
   - CSS bundle size
   - Unused CSS detection

**Backend Analysis:**
1. **API Performance**
   - Endpoint response times
   - Slow query detection
   - N+1 query problems
   - Memory usage patterns
   - CPU utilization

2. **Database Performance**
   - Missing indexes
   - Slow queries (> 100ms)
   - Query execution plans
   - Connection pool usage
   - Table sizes and growth

**Metrics Collected:**
```markdown
## Performance Baseline
- Initial page load: 3.5s (target: < 2s)
- First Contentful Paint: 2.1s (target: < 1.8s)
- Time to Interactive: 4.2s (target: < 3.9s)
- Bundle size: 4.2 MB (target: < 3 MB)
- API average response: 450ms (target: < 300ms)
- Database queries: Avg 180ms (target: < 100ms)
```

### Phase 2: Issue Identification 🔍

**Critical Issues (Fix Immediately):**
```
🔴 CRITICAL: Entire lodash library imported
   Location: src/app/shared/utils.ts:3
   Impact: +450KB to bundle
   Current: import * as _ from 'lodash'
   Fix: import { debounce, throttle } from 'lodash-es'
   Savings: ~400KB

🔴 CRITICAL: N+1 Query in getCourseWithSections
   Location: backend/src/services/course.service.ts:45
   Impact: 51 queries instead of 1
   Current time: 450ms
   Fix: Use relations: ['sections', 'sections.lessons']
   Expected: <50ms (90% faster)

🔴 CRITICAL: No OnPush change detection
   Location: src/app/course/course-list.component.ts
   Impact: Unnecessary re-renders
   Fix: Add changeDetection: ChangeDetectionStrategy.OnPush
   Performance gain: 30% faster rendering
```

**High Priority Issues:**
```
🟠 HIGH: Missing index on enrollments.user_id
   Location: Database schema
   Current query time: 180ms
   Fix: CREATE INDEX idx_enrollments_user_id ON enrollments(user_id)
   Expected: <20ms

🟠 HIGH: Large image files not optimized
   Location: Course thumbnails
   Average size: 2.5MB
   Fix: Resize to 800x600, convert to WebP
   Savings: ~2MB per image
```

**Medium Priority Issues:**
```
🟡 MEDIUM: No HTTP caching headers
   Impact: Repeated downloads of static assets
   Fix: Add Cache-Control headers
   Savings: 40% reduction in bandwidth

🟡 MEDIUM: Unoptimized Material module imports
   Impact: +200KB unused code
   Fix: Import only used modules
   Savings: ~180KB
```

### Phase 3: Apply Optimizations ⚡

**Automatic Optimizations (Applied Automatically):**
1. ✅ Replace lodash with lodash-es specific imports
2. ✅ Add database indexes for common queries
3. ✅ Enable gzip compression
4. ✅ Add Cache-Control headers
5. ✅ Optimize Material module imports

**Manual Review Required:**
1. ⚠️ Implement lazy loading for quiz module
2. ⚠️ Add OnPush change detection to components
3. ⚠️ Fix N+1 queries in course service
4. ⚠️ Optimize image assets
5. ⚠️ Implement Redis caching for frequent queries

**Database Optimizations:**
```sql
-- Add missing indexes
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_courses_category_published ON courses(category, published);

-- Analyze slow queries
EXPLAIN ANALYZE
SELECT * FROM courses
WHERE published = true
ORDER BY created_at DESC
LIMIT 20;
```

**Code Optimizations:**
```typescript
// Before: Heavy imports
import * as _ from 'lodash';
import { MatButtonModule, MatCardModule, ... } from '@angular/material';

// After: Specific imports
import { debounce } from 'lodash-es';
import { MatButtonModule } from '@angular/material/button';

// Before: No trackBy
<div *ngFor="let item of items">

// After: With trackBy
<div *ngFor="let item of items; trackBy: trackById">

// Before: N+1 queries
const courses = await courseRepository.find();
for (const course of courses) {
  course.sections = await sectionRepository.find({ courseId: course.id });
}

// After: Single query with relations
const courses = await courseRepository.find({
  relations: ['sections', 'sections.lessons'],
  cache: { id: 'courses_with_sections', milliseconds: 60000 }
});
```

### Phase 4: Verification & Results ✅

**Performance After Optimization:**
```markdown
## Performance Improvements

### Frontend
- Bundle size: 4.2 MB → 2.8 MB (-33%)
- Initial load: 3.5s → 2.1s (-40%)
- First Contentful Paint: 2.1s → 1.3s (-38%)
- Lighthouse score: 75 → 92 (+23%)

### Backend
- Average API response: 450ms → 150ms (-67%)
- Database queries: 51 → 1 (-98%)
- Memory usage: 450MB → 320MB (-29%)

### Database
- Course list query: 180ms → 18ms (-90%)
- Enrollment query: 245ms → 32ms (-87%)
- Index utilization: 45% → 89% (+98%)

### Overall Impact
- Page load time: -40%
- API responsiveness: -67%
- Database performance: -90%
- User satisfaction: +85%
```

**Load Testing Results:**
```bash
# Before optimization
ab -n 1000 -c 10 http://localhost:3000/api/courses
Requests per second: 22.45
Time per request: 445ms

# After optimization
ab -n 1000 -c 10 http://localhost:3000/api/courses
Requests per second: 89.12 (+ 297%)
Time per request: 112ms (-75%)
```

## Optimization Checklist

### Frontend ✅
- [ ] Bundle size reduced by at least 20%
- [ ] Lazy loading implemented for all feature modules
- [ ] OnPush change detection where applicable
- [ ] TrackBy functions for all ngFor loops
- [ ] Images optimized (WebP, lazy loading)
- [ ] Unused dependencies removed
- [ ] Service workers for caching
- [ ] Virtual scrolling for long lists

### Backend ✅
- [ ] N+1 queries eliminated
- [ ] Database indexes added
- [ ] Response compression enabled
- [ ] HTTP caching headers set
- [ ] Connection pooling optimized
- [ ] Redis caching implemented
- [ ] Rate limiting configured
- [ ] Pagination on all list endpoints

### Database ✅
- [ ] All foreign keys indexed
- [ ] Common query patterns indexed
- [ ] Slow queries identified and fixed
- [ ] Query execution plans reviewed
- [ ] Unused indexes removed
- [ ] Statistics updated
- [ ] Connection pool sized correctly

## Output Format

```markdown
📊 Performance Optimization Report
===================================

## Executive Summary
- Overall performance improvement: 45%
- Critical issues found: 3
- High priority issues: 4
- Optimizations applied: 12
- Estimated cost savings: $450/month (reduced server load)

## Before vs After

| Metric                | Before  | After   | Improvement |
|-----------------------|---------|---------|-------------|
| Bundle Size           | 4.2 MB  | 2.8 MB  | -33%        |
| Initial Load Time     | 3.5s    | 2.1s    | -40%        |
| API Response Time     | 450ms   | 150ms   | -67%        |
| Database Query Time   | 180ms   | 18ms    | -90%        |
| Lighthouse Score      | 75      | 92      | +23%        |

## Critical Issues Fixed
✅ Lodash bundle size reduced (-400KB)
✅ N+1 query eliminated (-98% queries)
✅ OnPush change detection added (+30% render speed)

## Recommended Next Steps
1. Monitor performance metrics for 1 week
2. Implement Redis caching for user sessions
3. Add CDN for static assets
4. Consider server-side rendering for SEO
5. Implement progressive web app features

## Performance Budget
Set performance budgets to prevent regression:
- Bundle size: < 3 MB
- Initial load: < 2.5s
- API response: < 300ms
- Database queries: < 100ms
```

## Integration with Workflow

```bash
# Weekly performance check
/optimize

# Before deployment
/test && /optimize && /deploy staging

# After major feature
/optimize frontend
/optimize database
```

## Monitoring Setup

After optimization, set up continuous monitoring:

```typescript
// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 500) {
      logger.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }
  });

  next();
});
```

## Success Criteria

✅ All metrics within target ranges
✅ No critical performance issues
✅ Lighthouse score > 90
✅ Bundle size < 3 MB
✅ API response time < 300ms
✅ Database queries < 100ms
✅ User-perceived performance improved

---

**Remember:** Performance is an ongoing process. Run /optimize regularly to catch regressions early.
