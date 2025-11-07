import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock current user - for demo purposes
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
    // Initialize with a mock user
    const mockUser: User = {
      id: 1,
      name: 'John Student',
      email: 'john@example.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=John+Student&background=random',
      role: 'student'
    };

    this.currentUserSubject = new BehaviorSubject<User | null>(mockUser);
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
   * Mock login
   */
  login(email: string, password: string): Observable<User> {
    // In a real app, this would call an API
    const mockUser: User = {
      id: 1,
      name: 'John Student',
      email: email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
      role: 'student'
    };

    this.currentUserSubject.next(mockUser);
    return new BehaviorSubject(mockUser).asObservable();
  }

  /**
   * Mock logout
   */
  logout(): void {
    this.currentUserSubject.next(null);
  }
}
