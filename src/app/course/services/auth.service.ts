import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(user);
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
    return this.currentUserValue !== null && !!localStorage.getItem('token');
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
   * Register a new user
   */
  register(name: string, email: string, password: string, role: 'student' | 'instructor' | 'admin' = 'student'): Observable<User> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { name, email, password, role })
      .pipe(
        tap(response => {
          // Store token and user
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token and user
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user profile from server
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(data: { name?: string; avatarUrl?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data)
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: User['role']): boolean {
    return this.currentUserValue?.role === role;
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  /**
   * Get user by ID (admin only)
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  /**
   * Create new user (admin only)
   */
  createUser(userData: { name: string; email: string; password: string; role: 'student' | 'instructor' | 'admin'; avatarUrl?: string }): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, userData);
  }

  /**
   * Update user (admin only)
   */
  updateUser(id: number, updates: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, updates);
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }
}
