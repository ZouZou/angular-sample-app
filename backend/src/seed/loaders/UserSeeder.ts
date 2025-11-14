import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../entities/User';
import { SeedDataFactory } from '../factories/SeedDataFactory';

interface UserSeedData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'instructor';
}

export class UserSeeder extends SeedDataFactory<User> {
  protected getEntityClass() {
    return User;
  }

  protected async loadData(): Promise<UserSeedData[]> {
    const dataPath = path.join(__dirname, '../data/users.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(fileContent);
  }

  protected createEntities(data: UserSeedData[]): User[] {
    const repository = this.getRepository();
    const users = data.map(userData =>
      repository.create({
        name: userData.name,
        email: userData.email,
        passwordHash: '', // Will be set in seed method
        role: userData.role
      })
    );
    return users as User[];
  }

  async seed(): Promise<User[]> {
    const data = await this.loadData();
    const repository = this.getRepository();

    const users = await Promise.all(
      data.map(async (userData) => {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        return repository.create({
          name: userData.name,
          email: userData.email,
          passwordHash,
          role: userData.role
        });
      })
    );

    const savedUsers = await repository.save(users);
    return savedUsers as User[];
  }
}
