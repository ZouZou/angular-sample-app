/**
 * Refactored Seed Data Entry Point
 *
 * This file replaces the monolithic seedData.ts (4576 lines)
 * with a modular, maintainable structure.
 *
 * New Structure:
 * - backend/src/seed/data/ - JSON configuration files
 * - backend/src/seed/loaders/ - Module-specific seeders
 * - backend/src/seed/factories/ - Factory pattern for data creation
 * - backend/src/seed/index.ts - Main orchestrator
 *
 * Benefits:
 * - Easy to maintain and update
 * - Separation of concerns
 * - Reusable components
 * - No need to recompile for data changes
 * - Better version control (smaller diffs)
 */

import { SeedOrchestrator } from '../seed';
import { AppDataSource } from '../config/database';

// Run the new modular seeder
const orchestrator = new SeedOrchestrator(AppDataSource);
orchestrator.run();
