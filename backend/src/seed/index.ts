import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { UserSeeder } from './loaders/UserSeeder';
import { CourseSeeder } from './loaders/CourseSeeder';

dotenv.config();

/**
 * Main seed orchestrator
 * Coordinates the seeding of all data modules
 */
export class SeedOrchestrator {
  constructor(private dataSource: typeof AppDataSource) {}

  async run(): Promise<void> {
    try {
      console.log('========================================');
      console.log('Starting database seeding...');
      console.log('========================================\n');

      // Connect to database
      console.log('Connecting to database...');
      await this.dataSource.initialize();
      console.log('✓ Database connected successfully\n');

      // Clear existing data
      await this.clearData();

      // Seed users
      console.log('========================================');
      console.log('Seeding Users');
      console.log('========================================');
      const userSeeder = new UserSeeder(this.dataSource);
      const users = await userSeeder.seed();
      console.log(`✓ Created ${users.length} users\n`);

      // Seed courses
      console.log('========================================');
      console.log('Seeding Courses');
      console.log('========================================');
      const courseSeeder = new CourseSeeder(this.dataSource);
      await courseSeeder.seed();
      console.log('✓ Courses seeded successfully\n');

      console.log('========================================');
      console.log('Seeding completed successfully!');
      console.log('========================================\n');

      console.log('Summary:');
      console.log(`- Users: ${users.length}`);
      console.log('- Courses: Check course data files for details');
      console.log('- Sections, Lessons, Quizzes: Loaded from course content files\n');

      await this.dataSource.destroy();
      process.exit(0);
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  }

  private async clearData(): Promise<void> {
    console.log('Clearing existing data...');

    // Clear in correct order for foreign key constraints
    await this.dataSource.query(
      'TRUNCATE TABLE quiz_options, quiz_questions, quizzes, lessons, course_sections, courses, users, user_progress, quiz_attempts, user_answers, enrollments RESTART IDENTITY CASCADE'
    );

    console.log('✓ Existing data cleared\n');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const orchestrator = new SeedOrchestrator(AppDataSource);
  orchestrator.run();
}
