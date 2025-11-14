import { DataSource } from 'typeorm';

/**
 * Base factory class for creating seed data
 * Provides common utilities and structure for seed data creation
 */
export abstract class SeedDataFactory<T> {
  constructor(protected dataSource: DataSource) {}

  /**
   * Get the repository for the entity
   */
  protected getRepository() {
    return this.dataSource.getRepository(this.getEntityClass());
  }

  /**
   * Abstract method to get the entity class
   */
  protected abstract getEntityClass(): any;

  /**
   * Load data from JSON configuration
   */
  protected abstract loadData(): Promise<any[]>;

  /**
   * Create entity instances from data
   */
  protected abstract createEntities(data: any[]): T[];

  /**
   * Seed the database with entities
   */
  async seed(): Promise<T[]> {
    const data = await this.loadData();
    const entities = this.createEntities(data);
    const repository = this.getRepository();
    return await repository.save(entities);
  }

  /**
   * Clear all data from the entity table
   */
  async clear(): Promise<void> {
    const repository = this.getRepository();
    await repository.clear();
  }
}
