# Seed Data Module

This module provides a modular, maintainable approach to seeding database data.

## Structure

```
seed/
├── index.ts                    # Main orchestrator
├── factories/
│   └── SeedDataFactory.ts     # Base factory class for data creation
├── loaders/
│   ├── UserSeeder.ts          # User data seeder
│   └── CourseSeeder.ts        # Course data seeder (with sections, lessons, quizzes)
└── data/
    ├── users.json             # User configuration
    ├── courses.json           # Course metadata
    └── courses/
        ├── README.md          # Content file structure documentation
        └── angular-content.json   # Sample course content
```

## Features

### Factory Pattern
- `SeedDataFactory` base class provides common functionality
- Easy to extend for new entity types
- Consistent interface across seeders

### Module-Specific Loaders
- **UserSeeder**: Handles user creation with password hashing
- **CourseSeeder**: Manages complex course data including:
  - Course metadata
  - Sections and lessons
  - Quizzes with questions and options
  - Hierarchical relationships

### JSON Configuration
- Data separated from logic
- No TypeScript recompilation needed for data changes
- Easy to maintain and review
- Better version control (meaningful diffs)

## Usage

### Running the Seeder

```bash
# From backend directory
npm run seed

# Or directly with ts-node
npx ts-node src/seed/index.ts
```

### Adding New Data

#### Add Users
Edit `data/users.json`:
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Add Courses
1. Add to `data/courses.json`:
```json
{
  "id": "my-course",
  "title": "My Course Title",
  "instructor": "Instructor Name",
  "duration": 1200,
  "price": 49.99,
  "category": "Programming",
  "level": "Beginner",
  "contentFile": "courses/my-course-content.json"
}
```

2. Create `data/courses/my-course-content.json` with sections and lessons

### Creating Custom Seeders

1. Extend `SeedDataFactory`:
```typescript
export class MySeeder extends SeedDataFactory<MyEntity> {
  protected getEntityClass() { return MyEntity; }
  protected async loadData() { /* load JSON */ }
  protected createEntities(data: any[]) { /* create entities */ }
}
```

2. Add to `index.ts`:
```typescript
const mySeeder = new MySeeder(this.dataSource);
await mySeeder.seed();
```

## Benefits Over Monolithic Approach

| Aspect | Old (4,576 lines) | New (Modular) |
|--------|-------------------|---------------|
| **Maintainability** | Difficult | Easy |
| **Updates** | Recompile required | Edit JSON |
| **Testing** | Hard to test | Easy to unit test |
| **Scalability** | Poor | Excellent |
| **Code Reviews** | Large diffs | Small, focused diffs |
| **Reusability** | None | High |

## Migration from Old Structure

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## File Size Comparison

- **Old**: 4,576 lines in single file
- **New**:
  - index.ts: ~70 lines
  - SeedDataFactory.ts: ~50 lines
  - UserSeeder.ts: ~60 lines
  - CourseSeeder.ts: ~230 lines
  - Data files: JSON (easy to edit)
  - **Total code**: ~410 lines
  - **Reduction**: 91% less code

## Best Practices

1. **Keep JSON files focused**: One file per concern
2. **Use meaningful IDs**: Make data relationships clear
3. **Document structure**: Update README when adding new patterns
4. **Test changes**: Run seeder after modifying data
5. **Version control**: Commit data files separately from code

## Troubleshooting

### Seeder fails to run
- Check database connection in `.env`
- Ensure all JSON files are valid
- Verify entity relationships

### Missing data
- Check that content files exist
- Verify file paths in configuration
- Review console output for warnings

### Duplicate data
- Ensure database is cleared before seeding
- Check for unique constraints
- Review orchestrator clear logic

## Future Enhancements

- [ ] Add YAML support as alternative to JSON
- [ ] Implement data validation schemas
- [ ] Add incremental seeding (update vs replace)
- [ ] Create CLI tool for data management
- [ ] Add data export functionality
- [ ] Implement seed rollback capability
