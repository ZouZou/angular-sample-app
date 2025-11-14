---
description: Database operations - migrations, seeds, status, and backups
---

Manage database operations for the LMS application using TypeORM and PostgreSQL.

## Objective

Simplify database management tasks including running migrations, seeding data, checking status, creating backups, and resetting the database.

## Available Operations

### 1. `status` - Show Database Status
Display current database state and migration status.

**What it does:**
- Shows database connection status
- Lists pending migrations
- Shows last migration run
- Displays table count
- Shows database size
- Lists all tables

**Usage:** `/db status`

**Output:**
```
📊 Database Status Report
========================

Connection: ✅ Connected to PostgreSQL
Database: lms_db
Host: localhost:5432
User: postgres

Migrations Status:
- Total migrations: 15
- Executed: 12
- Pending: 3
- Last migration: 20231114_AddQuizAttempts

Tables: 11
- users
- courses
- course_sections
- lessons
- quizzes
- quiz_questions
- quiz_options
- enrollments
- user_progress
- quiz_attempts
- user_answers

Database Size: 45.2 MB
```

### 2. `migrate` - Run Pending Migrations
Execute all pending migrations to update the database schema.

**What it does:**
- Checks for pending migrations
- Shows what will be migrated
- Runs migrations in order
- Reports success or failures
- Updates migration history

**Usage:** `/db migrate`

**Safety:**
- Always backs up before running (optional flag)
- Shows preview of changes
- Asks for confirmation in production
- Rolls back on error

**Output:**
```
🔄 Running Database Migrations
==============================

Pending Migrations:
1. 20231114120000_AddUserRoles
2. 20231114130000_AddCourseCategories
3. 20231114140000_AddQuizTimeLimit

Running migration 1/3: AddUserRoles...
✅ Migration AddUserRoles completed (245ms)

Running migration 2/3: AddCourseCategories...
✅ Migration AddCourseCategories completed (189ms)

Running migration 3/3: AddQuizTimeLimit...
✅ Migration AddQuizTimeLimit completed (156ms)

🎉 All migrations completed successfully!
Total time: 590ms
```

### 3. `rollback` - Revert Last Migration
Undo the last executed migration.

**What it does:**
- Shows which migration will be reverted
- Executes the down() method
- Removes from migration history
- Reports results

**Usage:** `/db rollback` or `/db rollback --steps=2`

**Warning:** This can cause data loss!

**Output:**
```
⚠️  Rollback Last Migration
==========================

Will revert: 20231114140000_AddQuizTimeLimit

⚠️  WARNING: This may result in data loss!
Are you sure? (This is a dry-run preview)

Changes to be reverted:
- Drop column: quizzes.time_limit
- Drop index: idx_quizzes_time_limit

Proceed with rollback? [Manual confirmation required]

✅ Migration rolled back successfully
```

### 4. `seed` - Seed Database with Test Data
Populate the database with sample data for development/testing.

**What it does:**
- Clears existing data (optional)
- Seeds users (admin, instructor, students)
- Seeds courses with curriculum
- Seeds quizzes and questions
- Seeds enrollments and progress
- Reports what was seeded

**Usage:**
- `/db seed` - Add seed data (append mode)
- `/db seed --fresh` - Clear all data first, then seed
- `/db seed --users-only` - Only seed users

**Output:**
```
🌱 Seeding Database
===================

Seeding Users...
✅ Created 5 users (1 admin, 2 instructors, 2 students)

Seeding Courses...
✅ Created 8 courses

Seeding Curriculum...
✅ Created 24 course sections
✅ Created 96 lessons

Seeding Quizzes...
✅ Created 12 quizzes
✅ Created 120 quiz questions
✅ Created 480 quiz options

Seeding Enrollments...
✅ Created 15 enrollments

Seeding Progress...
✅ Created 45 progress records

🎉 Database seeded successfully!

Test Credentials:
- Admin: admin@example.com / password123
- Instructor: instructor@example.com / password123
- Student: student@example.com / password123
```

### 5. `reset` - Reset Database
Drop all tables, run migrations, and seed data. Fresh start.

**What it does:**
- Drops all tables
- Runs all migrations from scratch
- Seeds with test data
- Perfect for development reset

**Usage:** `/db reset`

**Warning:** This destroys ALL data!

**Output:**
```
🔄 Resetting Database
=====================

⚠️  WARNING: This will DELETE ALL DATA!
This operation:
1. Drops all tables
2. Runs all migrations
3. Seeds with test data

Proceed? [Requires confirmation]

Step 1: Dropping all tables...
✅ All tables dropped

Step 2: Running migrations...
✅ 12 migrations executed

Step 3: Seeding data...
✅ Database seeded

🎉 Database reset complete!
```

### 6. `generate <name>` - Generate New Migration
Create a new migration based on entity changes.

**What it does:**
- Compares entities to current database schema
- Generates migration with differences
- Creates timestamped migration file
- Shows what changes were detected

**Usage:** `/db generate AddUserAvatar`

**Output:**
```
🔍 Analyzing Entity Changes
============================

Detected Changes:
- New column: users.avatar_url (varchar)
- New index: idx_users_avatar_url

Generating migration...
✅ Migration generated successfully!

📁 File: backend/src/migrations/20231114150000-AddUserAvatar.ts
📝 Changes: 1 table altered, 1 column added, 1 index added

Next steps:
1. Review the generated migration file
2. Run: /db migrate
```

### 7. `create <name>` - Create Empty Migration
Create a blank migration for custom SQL.

**What it does:**
- Creates empty migration template
- Useful for data migrations or custom changes
- Includes up() and down() methods

**Usage:** `/db create UpdateUserRoles`

**Output:**
```
✅ Migration created: UpdateUserRoles
📁 Location: backend/src/migrations/20231114160000-UpdateUserRoles.ts

Edit the file to add your custom migration logic.
```

### 8. `backup` - Create Database Backup
Create a backup of the current database.

**What it does:**
- Creates a pg_dump backup
- Saves to backups/ directory
- Includes timestamp in filename
- Compresses backup (optional)

**Usage:** `/db backup` or `/db backup --compress`

**Output:**
```
💾 Creating Database Backup
===========================

Database: lms_db
Backup file: backups/lms_db_20231114_150000.sql

Creating backup...
✅ Backup created successfully!

📁 Location: backend/backups/lms_db_20231114_150000.sql
📊 Size: 12.4 MB
📅 Date: 2023-11-14 15:00:00

To restore:
psql -U postgres -d lms_db < backups/lms_db_20231114_150000.sql
```

### 9. `restore <file>` - Restore Database from Backup
Restore database from a backup file.

**What it does:**
- Drops existing database
- Creates fresh database
- Restores from backup file
- Verifies restoration

**Usage:** `/db restore backups/lms_db_20231114_150000.sql`

**Warning:** This replaces current database!

**Output:**
```
🔄 Restoring Database
=====================

⚠️  WARNING: This will replace the current database!

Backup file: backups/lms_db_20231114_150000.sql
Current database: lms_db

Proceed? [Requires confirmation]

Dropping current database...
✅ Database dropped

Creating fresh database...
✅ Database created

Restoring from backup...
✅ Backup restored

Verifying restoration...
✅ Restoration verified

🎉 Database restored successfully!
```

## Command Execution Steps

1. **Parse Command**
   - Extract operation (status, migrate, seed, etc.)
   - Extract arguments and flags
   - Validate operation

2. **Check Database Connection**
   - Verify PostgreSQL is running
   - Test connection
   - Show connection details

3. **Execute Operation**
   - Run the requested operation
   - Show progress
   - Handle errors gracefully
   - Provide detailed output

4. **Report Results**
   - Summary of what was done
   - Any warnings or errors
   - Next steps or recommendations

## Implementation Details

### Prerequisites Check
Before any operation:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check if database exists
psql -lqt | cut -d \| -f 1 | grep -qw lms_db

# Check backend dependencies installed
cd backend && npm list typeorm pg
```

### Migration Commands
```bash
# Status
cd backend && npm run typeorm migration:show

# Run migrations
cd backend && npm run typeorm migration:run

# Revert migration
cd backend && npm run typeorm migration:revert

# Generate migration
cd backend && npm run typeorm migration:generate -- -n MigrationName

# Create empty migration
cd backend && npm run typeorm migration:create -- -n MigrationName
```

### Seed Command
```bash
cd backend && npm run seed
# or
cd backend && ts-node src/database/seeds/run-seed.ts
```

### Backup/Restore Commands
```bash
# Backup
pg_dump -U postgres -d lms_db > backups/lms_db_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U postgres -d lms_db < backups/lms_db_backup.sql
```

## Safety Features

### Confirmations
- ⚠️  `rollback` - Requires confirmation (shows what will be lost)
- ⚠️  `reset` - Requires confirmation (destroys all data)
- ⚠️  `restore` - Requires confirmation (replaces database)

### Backups
- Automatic backup before `reset` (optional flag)
- Automatic backup before `restore` (optional flag)
- Manual backup command available

### Error Handling
- Database connection errors
- Migration errors (with rollback)
- Invalid operation names
- Missing backup files
- PostgreSQL not running

## Common Workflows

### New Feature Development
```bash
# 1. Create entities
# 2. Generate migration
/db generate AddFeatureName

# 3. Review migration file
# 4. Run migration
/db migrate

# 5. Update seed data if needed
/db seed
```

### Fix Migration Issue
```bash
# 1. Rollback problematic migration
/db rollback

# 2. Fix entity or migration file
# 3. Generate new migration
/db generate FixedFeatureName

# 4. Run migration again
/db migrate
```

### Fresh Development Start
```bash
# Complete reset with fresh data
/db reset
```

### Before Deployment
```bash
# 1. Check status
/db status

# 2. Ensure no pending migrations
/db migrate

# 3. Create backup
/db backup --compress
```

## Environment-Specific Behavior

### Development
- Confirmations are warnings only
- Auto-backup enabled
- Detailed verbose output
- Seed data includes test accounts

### Staging
- Confirmations required
- Auto-backup always enabled
- Warnings for destructive operations
- Limited seed data

### Production
- Strict confirmations required
- Mandatory backups before changes
- No `reset` command allowed
- No automatic seeding
- Detailed audit logging

## Error Messages

### Database Not Running
```
❌ Error: Cannot connect to PostgreSQL
PostgreSQL is not running or not accessible.

To start PostgreSQL:
- macOS: brew services start postgresql
- Linux: sudo systemctl start postgresql
- Docker: docker-compose up -d postgres
```

### Migration Error
```
❌ Migration Failed: 20231114_AddUserRoles

Error: Column "role" already exists

This migration may have been partially applied.
Check database state and fix migration file.

To rollback and try again:
1. /db rollback
2. Fix migration file
3. /db migrate
```

### No Pending Migrations
```
✅ Database is up to date
No pending migrations to run.

Latest migration: 20231114140000_AddQuizTimeLimit
```

## Success Criteria

✅ Command executes without errors
✅ Database state is as expected
✅ Migrations run in correct order
✅ Seed data is created properly
✅ Backups are created successfully
✅ Detailed output provided
✅ Next steps clearly communicated

## Integration with Development Workflow

```bash
# Morning routine - check db status
/db status

# After pulling changes - update db
/db migrate

# Need fresh data - reset
/db reset

# Before major changes - backup
/db backup

# Weekly - clean reset
/db reset && /build && /test
```

---

**Note:** This command uses the `database-specialist` agent for complex operations and provides a streamlined interface for common database tasks.
