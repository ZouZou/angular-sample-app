import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { UserSeeder } from './loaders/UserSeeder';
import { CourseSeeder } from './loaders/CourseSeeder';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * Main seed orchestrator
 * Coordinates the seeding of all data modules
 */
export class SeedOrchestrator {
  constructor(private dataSource: typeof AppDataSource) {}

  async run(): Promise<void> {
    try {
      logger.info('========================================');
      logger.info('Starting database seeding...');
      logger.info('========================================\n');

      // Connect to database
      logger.debug('Connecting to database...');
      await this.dataSource.initialize();
      logger.info('✓ Database connected successfully\n');

      // Clear existing data
      await this.clearData();

      // Seed users
      logger.info('========================================');
      logger.info('Seeding Users');
      logger.info('========================================');
      const userSeeder = new UserSeeder(this.dataSource);
      const users = await userSeeder.seed();
      logger.info(`✓ Created ${users.length} users\n`);

      // Seed courses
      logger.info('========================================');
      logger.info('Seeding Courses');
      logger.info('========================================');
      const courseSeeder = new CourseSeeder(this.dataSource);
      await courseSeeder.seed();
      logger.info('✓ Courses seeded successfully\n');

      logger.info('========================================');
      logger.info('Seeding completed successfully!');
      logger.info('========================================\n');

      logger.info('Summary:');
      logger.info(`- Users: ${users.length}`);
      logger.info('- Courses: Check course data files for details');
      logger.info('- Sections, Lessons, Quizzes: Loaded from course content files\n');

      await this.dataSource.destroy();
      process.exit(0);
    } catch (error) {
      logger.error('Error seeding database:', error);
      process.exit(1);
    }
  }

  private async clearData(): Promise<void> {
    logger.debug('Clearing existing data...');

    // Clear in correct order for foreign key constraints
    await this.dataSource.query(
      'TRUNCATE TABLE quiz_options, quiz_questions, quizzes, lessons, course_sections, courses, users, user_progress, quiz_attempts, user_answers, enrollments RESTART IDENTITY CASCADE'
    );

    logger.info('✓ Existing data cleared\n');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const orchestrator = new SeedOrchestrator(AppDataSource);
  orchestrator.run();
}
