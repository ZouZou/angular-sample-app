import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.interface';

export interface UserCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  // Mock user database with credentials
  private mockUsers: Array<User & { password: string }> = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'admin123',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=667eea',
      role: 'admin'
    },
    {
      id: 2,
      name: 'John Student',
      email: 'john@lms.com',
      password: 'student123',
      avatarUrl: 'https://ui-avatars.com/api/?name=John+Student&background=42b983',
      role: 'student'
    },
    {
      id: 3,
      name: 'Jane Instructor',
      email: 'jane@lms.com',
      password: 'instructor123',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Instructor&background=f59e0b',
      role: 'instructor'
    },
    {
      id: 4,
      name: 'Alice Student',
      email: 'alice@lms.com',
      password: 'student123',
      avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Student&background=ec4899',
      role: 'student'
    }
  ];

  constructor() {
    // Try to restore user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user ID
   */
  get currentUserId(): number | null {
    return this.currentUserValue?.id || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Check if user is a student
   */
  isStudent(): boolean {
    return this.currentUserValue?.role === 'student';
  }

  /**
   * Check if user is an instructor
   */
  isInstructor(): boolean {
    return this.currentUserValue?.role === 'instructor';
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: User['role']): boolean {
    return this.currentUserValue?.role === role;
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User> {
    // Simulate API call delay
    const user = this.mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;

      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      // Update current user
      this.currentUserSubject.next(userWithoutPassword);

      return of(userWithoutPassword).pipe(delay(500)); // Simulate network delay
    } else {
      return throwError(() => new Error('Invalid email or password')).pipe(delay(500));
    }
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    // Return users without passwords
    const users = this.mockUsers.map(({ password: _, ...user }) => user);
    return of(users).pipe(delay(300));
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return of(userWithoutPassword).pipe(delay(200));
    }
    return of(undefined).pipe(delay(200));
  }

  /**
   * Create new user (admin only)
   */
  createUser(userData: Omit<User, 'id'> & { password: string }): Observable<User> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    // Check if email already exists
    if (this.mockUsers.some(u => u.email === userData.email)) {
      return throwError(() => new Error('Email already exists'));
    }

    const newUser = {
      ...userData,
      id: Math.max(...this.mockUsers.map(u => u.id)) + 1,
      avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
    };

    this.mockUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return of(userWithoutPassword).pipe(delay(300));
  }

  /**
   * Update user (admin only)
   */
  updateUser(id: number, updates: Partial<User> & { password?: string }): Observable<User> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    // Check if email is being changed to an existing email
    if (updates.email && updates.email !== this.mockUsers[userIndex].email) {
      if (this.mockUsers.some(u => u.email === updates.email && u.id !== id)) {
        return throwError(() => new Error('Email already exists'));
      }
    }

    this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...updates };

    const { password: _, ...userWithoutPassword } = this.mockUsers[userIndex];
    return of(userWithoutPassword).pipe(delay(300));
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(id: number): Observable<void> {
    if (!this.isAdmin()) {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    // Prevent deleting the current user
    if (id === this.currentUserId) {
      return throwError(() => new Error('Cannot delete your own account'));
    }

    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found'));
    }

    this.mockUsers.splice(userIndex, 1);
    return of(void 0).pipe(delay(300));
  }
}
