---
description: Deploy application to staging or production environments
---

Deploy the full-stack Angular + Node.js LMS application to specified environment with comprehensive pre-deployment checks and health verification.

## Objective

Safely deploy the application with automated testing, building, and deployment to staging or production environments.

## Usage

```bash
/deploy staging    # Deploy to staging environment
/deploy production # Deploy to production environment
/deploy --help     # Show deployment options
```

## Deployment Flow

### Phase 1: Pre-Deployment Checks ✅
Ensure code quality and security before deployment.

**Steps:**
1. **Code Quality Check**
   - Run linting on frontend and backend
   - Check for TypeScript compilation errors
   - Verify code formatting

2. **Security Audit**
   - Run security scanner
   - Check for hardcoded secrets
   - Verify npm audit passes
   - Scan for OWASP vulnerabilities

3. **Test Suite**
   - Run unit tests (frontend + backend)
   - Run integration tests
   - Check test coverage meets threshold (>70%)
   - Verify all tests pass

4. **Environment Validation**
   - Verify environment variables are set
   - Check database connection settings
   - Validate SSL certificates (production only)
   - Verify domain configuration

**Success Criteria:**
- ✅ All linting passes
- ✅ All tests pass
- ✅ No critical security vulnerabilities
- ✅ Environment properly configured

**If checks fail:** Deployment is aborted with detailed error report.

### Phase 2: Build Application 🏗️
Create optimized production builds.

**Steps:**
1. **Frontend Build**
   ```bash
   npm run build --prod
   ```
   - Bundle optimization
   - Tree shaking
   - Minification
   - Source map generation (staging only)
   - Cache busting

2. **Backend Build**
   ```bash
   cd backend && npm run build
   ```
   - TypeScript compilation
   - Remove dev dependencies
   - Optimize imports

3. **Docker Image Build** (if using Docker)
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```
   - Multi-stage build
   - Layer caching
   - Security scanning
   - Tag with version

**Outputs:**
- `dist/` folder with optimized frontend
- `backend/dist/` with compiled backend
- Docker images tagged and ready

### Phase 3: Database Migration 🗄️
Update database schema if needed.

**Steps:**
1. **Backup Database**
   - Create timestamped backup
   - Store in secure location
   - Verify backup integrity

2. **Check Pending Migrations**
   ```bash
   cd backend && npm run typeorm migration:show
   ```

3. **Run Migrations**
   ```bash
   npm run typeorm migration:run
   ```
   - Execute migrations in order
   - Verify each migration succeeds
   - Rollback on failure

4. **Verify Schema**
   - Check all tables exist
   - Verify indexes created
   - Confirm data integrity

**Safety:**
- Automatic backup before migrations
- Rollback capability
- Dry-run option available

### Phase 4: Deployment 🚀
Deploy to target environment.

#### Staging Deployment
```bash
# SSH to staging server
ssh deploy@staging.example.com

# Pull latest code
cd /var/www/lms-staging
git pull origin develop

# Install dependencies
npm ci
cd backend && npm ci

# Build application
npm run build
cd backend && npm run build

# Restart services
pm2 restart lms-staging-frontend
pm2 restart lms-staging-backend

# Run migrations
npm run typeorm migration:run
```

#### Production Deployment
```bash
# SSH to production server
ssh deploy@production.example.com

# Pull latest code
cd /var/www/lms-production
git pull origin main

# Install dependencies
npm ci --only=production
cd backend && npm ci --only=production

# Build application
npm run build --prod
cd backend && npm run build

# Zero-downtime deployment with PM2
pm2 reload lms-prod-frontend
pm2 reload lms-prod-backend

# Run migrations
npm run typeorm migration:run
```

#### Docker Deployment
```bash
# Build and push images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy to server
ssh deploy@production.example.com
cd /var/www/lms-production
docker-compose pull
docker-compose up -d --no-deps --build backend frontend

# Run migrations
docker-compose exec backend npm run typeorm migration:run
```

**Deployment Options:**
- **Blue-Green:** Zero downtime, instant rollback
- **Rolling:** Gradual update, minimal downtime
- **Recreate:** Simple, brief downtime

### Phase 5: Post-Deployment Verification ✅
Ensure deployment succeeded and app is healthy.

**Steps:**
1. **Health Checks**
   ```bash
   # API health
   curl -f https://api.example.com/health

   # Frontend accessibility
   curl -f https://app.example.com

   # Database connection
   curl -f https://api.example.com/health/db
   ```

2. **Smoke Tests**
   - Login functionality
   - Course listing loads
   - Enrollment works
   - Quiz taking works
   - API endpoints respond

3. **Performance Check**
   - Page load time < 3s
   - API response time < 500ms
   - No 5xx errors
   - Database query time acceptable

4. **Monitoring Check**
   - Application logs streaming
   - Error tracking active
   - Metrics collecting
   - Alerts configured

**Success Criteria:**
- ✅ All services running
- ✅ Health checks pass
- ✅ Smoke tests pass
- ✅ Performance within limits
- ✅ No errors in logs

### Phase 6: Notification & Documentation 📢
Inform team and document deployment.

**Steps:**
1. **Send Notifications**
   - Slack/Discord notification
   - Email to stakeholders
   - Update status page

2. **Update Documentation**
   - Record deployment time
   - Log changes deployed
   - Update changelog
   - Document any issues

3. **Create Deployment Record**
   ```markdown
   # Deployment Record
   - Date: 2023-11-14 15:30:00 UTC
   - Environment: Production
   - Version: v1.5.0
   - Deployed by: CI/CD Pipeline
   - Git commit: abc123f
   - Duration: 8m 45s
   - Status: ✅ Success
   - Migrations run: 2
   - Issues: None
   ```

## Environment-Specific Configuration

### Development
- Auto-deploy on commit (optional)
- No pre-deployment checks required
- Detailed logging
- Source maps enabled
- Hot reload enabled

### Staging
- Deploy on merge to develop branch
- Required checks: lint, test
- Moderate security scanning
- Source maps enabled
- Same data structure as production
- Test payment integration
- Full feature testing

### Production
- Deploy on merge to main or manual trigger
- **Strict requirements:**
  - All tests must pass
  - Security audit must pass
  - Code review approved
  - Manual approval required
- Zero-downtime deployment
- Automatic rollback on failure
- Health monitoring
- Performance tracking
- Error alerting

## Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

### During Deployment
- [ ] Pre-deployment checks pass
- [ ] Build successful
- [ ] Migrations run without errors
- [ ] Services deployed
- [ ] Health checks pass
- [ ] Smoke tests pass

### After Deployment
- [ ] Application accessible
- [ ] Core features working
- [ ] No errors in logs
- [ ] Performance metrics normal
- [ ] Users notified
- [ ] Documentation updated
- [ ] Deployment record created

## Rollback Procedure

If deployment fails or issues detected:

```bash
# Immediate rollback
git revert <commit-hash>
/deploy production

# Or manual rollback
ssh deploy@production.example.com
cd /var/www/lms-production

# Restore previous version
git reset --hard HEAD~1

# Rollback database
npm run typeorm migration:revert

# Restart services
pm2 reload all

# Verify health
curl -f https://api.example.com/health
```

## Output Format

```markdown
🚀 Deployment to Production
===========================

Phase 1: Pre-Deployment Checks
✅ Linting passed
✅ Tests passed (245/245)
✅ Security audit passed
✅ Environment validated

Phase 2: Build Application
✅ Frontend build completed (2m 15s)
   - Bundle size: 2.4 MB (gzipped: 645 KB)
   - Chunks: 12
✅ Backend build completed (45s)
✅ Docker images built and tagged

Phase 3: Database Migration
✅ Database backup created
✅ 2 pending migrations found
✅ Migrations executed successfully
   - AddUserRoles
   - AddCourseCategories

Phase 4: Deployment
✅ Deployed to production server
✅ Services restarted
   - Frontend: ✅ Running (2 instances)
   - Backend: ✅ Running (4 instances)
   - Database: ✅ Connected

Phase 5: Verification
✅ Health checks passed
✅ Smoke tests passed (8/8)
✅ Performance check passed
   - Page load: 1.2s
   - API response: 245ms

Phase 6: Notification
✅ Team notified via Slack
✅ Deployment record created
✅ Changelog updated

🎉 Deployment Successful!
========================

Environment: Production
Version: v1.5.0
Duration: 8m 45s
Deployed at: 2023-11-14 15:30:00 UTC
Git commit: abc123f

Changes Deployed:
- Added user role management
- Enhanced course categorization
- Fixed quiz scoring bug
- Performance improvements

URLs:
- Frontend: https://app.example.com
- Backend API: https://api.example.com
- Admin: https://app.example.com/admin

Next Steps:
- Monitor application for 30 minutes
- Check error logs for issues
- Verify user feedback
```

## Failure Handling

### Build Failure
```markdown
❌ Deployment Failed: Build Error
==================================

Phase: Build Application
Component: Frontend
Error: TypeScript compilation error

src/app/course/course-player.component.ts:45:12
  Property 'sections' does not exist on type 'Course'

Action Required:
1. Fix TypeScript error
2. Run: npm run build
3. Commit and push fix
4. Retry deployment

Deployment aborted. No changes made to production.
```

### Health Check Failure
```markdown
❌ Deployment Failed: Health Check
==================================

Phase: Post-Deployment Verification
Service: Backend API
Error: Health check endpoint not responding

Health Check Results:
- Frontend: ✅ Responding
- Backend: ❌ Timeout after 30s
- Database: ✅ Connected

Action Taken:
- Automatic rollback initiated
- Previous version restored
- Services restarted

Current Status:
- ✅ Rollback successful
- ✅ Application restored
- ✅ Users not affected

Next Steps:
1. Check backend logs for errors
2. Fix health check endpoint
3. Test locally
4. Retry deployment
```

## Common Deployment Issues

### Issue 1: Environment Variables Missing
```bash
# Solution: Verify .env file
ssh deploy@server
cd /var/www/app
cat .env | grep -E "DB_|JWT_|API_"
```

### Issue 2: Port Already in Use
```bash
# Solution: Kill process or change port
lsof -ti:3000 | xargs kill -9
```

### Issue 3: Database Migration Failed
```bash
# Solution: Rollback and investigate
npm run typeorm migration:revert
npm run typeorm migration:show
```

### Issue 4: Out of Disk Space
```bash
# Solution: Clean old builds and logs
docker system prune -a
rm -rf logs/*.log
```

## Best Practices

✅ **DO:**
- Deploy during low-traffic hours
- Always run tests before deploying
- Create database backups
- Use zero-downtime deployment
- Monitor after deployment
- Have rollback plan ready
- Document all deployments
- Notify team of deployments

❌ **DON'T:**
- Deploy on Fridays (unless critical)
- Skip pre-deployment checks
- Deploy without testing
- Ignore health check failures
- Deploy breaking changes without migration plan
- Forget to run migrations
- Deploy without backup

## Integration with Other Commands

```bash
# Full pre-deployment workflow
/lint && /test && /security && /build && /deploy staging

# After successful staging
/deploy production

# Emergency rollback
git revert HEAD && /deploy production
```

---

**Remember:** Successful deployments are repeatable, automated, and safe. When in doubt, don't deploy.
