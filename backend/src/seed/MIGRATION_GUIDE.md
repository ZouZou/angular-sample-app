# Seed Data Migration Guide

## Overview

The original `seedData.ts` file (4,576 lines) has been refactored into a modular, maintainable structure. This guide explains the new structure and how to use it.

## Old vs New Structure

### Old Structure (Monolithic)
```
backend/src/utils/seedData.ts  (4,576 lines)
└── All seed data in one file
```

### New Structure (Modular)
```
backend/src/seed/
├── index.ts                    # Main orchestrator
├── factories/
│   └── SeedDataFactory.ts     # Base factory class
├── loaders/
│   ├── UserSeeder.ts          # User data seeder
│   └── CourseSeeder.ts        # Course data seeder
└── data/
    ├── users.json             # User configuration
    ├── courses.json           # Course metadata
    └── courses/
        ├── README.md          # Content file structure
        ├── angular-content.json
        ├── react-content.json
        ├── nodejs-content.json
        └── openedge-content.json
```

## Benefits

### 1. Maintainability
- Each module is in its own file
- Easy to find and update specific data
- Changes don't require recompiling TypeScript

### 2. Separation of Concerns
- User data separate from course data
- Course metadata separate from content
- Clear responsibility for each module

### 3. Scalability
- Easy to add new courses
- Simple to extend with new data types
- Modular structure supports growth

### 4. Version Control
- Smaller, focused commits
- Easier code reviews
- Better diff visualization

### 5. Reusability
- Factory pattern can be used for other entities
- Loaders can be used independently
- Data files can be shared or duplicated

## How to Use

### Running the Seeder

```bash
# Using the new modular seeder
npm run seed

# Or directly
node dist/seed/index.js
```

### Adding New Users

Edit `backend/src/seed/data/users.json`:

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "student"
}
```

### Adding New Courses

1. Add course metadata to `backend/src/seed/data/courses.json`:

```json
{
  "id": "my-new-course",
  "title": "My New Course",
  "description": "Course description",
  "instructor": "Instructor Name",
  "duration": 1200,
  "price": 49.99,
  "category": "Programming",
  "level": "Beginner",
  "contentFile": "courses/my-new-course-content.json"
}
```

2. Create content file `backend/src/seed/data/courses/my-new-course-content.json`:

```json
{
  "sections": [
    {
      "title": "Section 1",
      "description": "First section",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson 1",
          "description": "First lesson",
          "type": "video",
          "duration": 30,
          "order": 1,
          "videoUrl": "https://example.com/video.mp4"
        }
      ]
    }
  ],
  "quizzes": [
    {
      "title": "Quiz 1",
      "description": "Test your knowledge",
      "passingScore": 70,
      "timeLimit": 30,
      "questions": [
        {
          "question": "What is 2+2?",
          "type": "multiple-choice",
          "points": 10,
          "order": 1,
          "options": [
            {
              "text": "3",
              "isCorrect": false,
              "order": 1
            },
            {
              "text": "4",
              "isCorrect": true,
              "order": 2
            }
          ],
          "explanation": "2+2 equals 4"
        }
      ]
    }
  ]
}
```

## Creating Custom Seeders

To create a seeder for a new entity:

1. Create a factory (if needed):

```typescript
import { SeedDataFactory } from '../factories/SeedDataFactory';
import { MyEntity } from '../../entities/MyEntity';

export class MyEntitySeeder extends SeedDataFactory<MyEntity> {
  protected getEntityClass() {
    return MyEntity;
  }

  protected async loadData() {
    // Load data from JSON or other source
  }

  protected createEntities(data: any[]) {
    // Create entity instances
  }
}
```

2. Add to orchestrator in `backend/src/seed/index.ts`:

```typescript
import { MyEntitySeeder } from './loaders/MyEntitySeeder';

// In the run() method:
const myEntitySeeder = new MyEntitySeeder(this.dataSource);
await myEntitySeeder.seed();
```

## Migration Checklist

- [ ] Backup original seedData.ts
- [ ] Test new seeder with existing data
- [ ] Verify all entities are created correctly
- [ ] Update package.json scripts
- [ ] Update documentation
- [ ] Train team on new structure

## Rollback Plan

If needed, the original `seedData.ts` can be restored:

```bash
# Restore original file
git checkout HEAD~1 backend/src/utils/seedData.ts

# Run original seeder
npm run seed:old
```

## Support

For issues or questions about the new seed structure:
1. Check this migration guide
2. Review the README files in data directories
3. Examine the factory and loader implementations
4. Contact the development team
