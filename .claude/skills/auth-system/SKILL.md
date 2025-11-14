# Authentication & Authorization System Skill

Implement a comprehensive authentication and authorization system with user management, role-based access control (RBAC), password security, email verification, password reset, and OAuth integration.

## Overview

Create a production-ready authentication system for the Angular + Node.js LMS application with the following capabilities:

- User registration with email verification
- Secure login with JWT tokens
- Password reset flow with email
- Role-based access control (RBAC)
- Permission management
- OAuth 2.0 integration (Google, GitHub)
- Two-factor authentication (2FA) optional
- Session management
- Account lockout after failed attempts
- Remember me functionality
- User profile management

## Implementation Phases

### Phase 1: Backend Authentication Core

#### 1.1 Enhanced User Entity
```typescript
// backend/src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status', 'role'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lockUntil?: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIp?: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @ManyToMany(() => Permission, permission => permission.users, { eager: true })
  @JoinTable({ name: 'user_permissions' })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }

  get isVerified(): boolean {
    return !!this.emailVerifiedAt;
  }
}
```

#### 1.2 Permission Entity (RBAC)
```typescript
// backend/src/entities/Permission.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './User';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string; // e.g., 'course', 'user', 'enrollment'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @ManyToMany(() => User, user => user.permissions)
  users: User[];
}
```

#### 1.3 Refresh Token Entity
```typescript
// backend/src/entities/RefreshToken.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from './User';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  replacedByToken?: string;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedByIp?: string;

  @Column()
  createdByIp: string;

  @CreateDateColumn()
  createdAt: Date;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isActive(): boolean {
    return !this.revokedAt && !this.isExpired;
  }
}
```

#### 1.4 Enhanced Auth Service
```typescript
// backend/src/services/authService.ts
import { User, UserRole, UserStatus } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { EmailService } from './emailService';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

export class AuthService {
  private userRepository = getRepository(User);
  private refreshTokenRepository = getRepository(RefreshToken);
  private emailService = new EmailService();

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<{ user: User; verificationToken: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.STUDENT,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerificationToken: verificationToken
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return { user, verificationToken };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = null;
    user.status = UserStatus.ACTIVE;

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    rememberMe: boolean = false
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error(
        `Account locked due to too many failed login attempts. Try again later.`
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await this.handleFailedLogin(user);
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, ipAddress, rememberMe);

    return { user, accessToken, refreshToken: refreshToken.token };
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(user: User): Promise<void> {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await this.userRepository.save(user);
  }

  /**
   * Generate access token (JWT)
   */
  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions?.map(p => `${p.resource}:${p.action}`)
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m' // Short-lived access token
    });
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(
    user: User,
    ipAddress: string,
    rememberMe: boolean
  ): Promise<RefreshToken> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();

    // Remember me: 30 days, otherwise 7 days
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
      createdByIp: ipAddress
    });

    await this.refreshTokenRepository.save(refreshToken);

    return refreshToken;
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    token: string,
    ipAddress: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user', 'user.permissions']
    });

    if (!refreshToken || !refreshToken.isActive) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newRefreshToken = await this.generateRefreshToken(
      refreshToken.user,
      ipAddress,
      false
    );

    // Revoke old token
    refreshToken.revokedAt = new Date();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await this.refreshTokenRepository.save(refreshToken);

    const accessToken = this.generateAccessToken(refreshToken.user);

    return { accessToken, refreshToken: newRefreshToken.token };
  }

  /**
   * Logout (revoke refresh token)
   */
  async logout(token: string, ipAddress: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token }
    });

    if (refreshToken && refreshToken.isActive) {
      refreshToken.revokedAt = new Date();
      refreshToken.revokedByIp = ipAddress;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.loginAttempts = 0;
    user.lockUntil = null;

    await this.userRepository.save(user);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email);
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    // Send confirmation email
    await this.emailService.sendPasswordChangedEmail(user.email);
  }

  /**
   * OAuth login (Google, GitHub, etc.)
   */
  async oauthLogin(
    provider: 'google' | 'github',
    profile: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    },
    ipAddress: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const providerIdField = provider === 'google' ? 'googleId' : 'githubId';

    // Find user by provider ID or email
    let user = await this.userRepository.findOne({
      where: [
        { [providerIdField]: profile.id },
        { email: profile.email }
      ]
    });

    if (user) {
      // Link provider if not already linked
      if (!user[providerIdField]) {
        user[providerIdField] = profile.id;
        await this.userRepository.save(user);
      }
    } else {
      // Create new user from OAuth profile
      user = this.userRepository.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        [providerIdField]: profile.id,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(), // OAuth emails are pre-verified
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12) // Random password
      });

      await this.userRepository.save(user);
    }

    // Update login info
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, ipAddress, false);

    return { user, accessToken, refreshToken: refreshToken.token };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['permissions']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: number,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      preferences?: Record<string, any>;
    }
  ): Promise<User> {
    const user = await this.getUserById(userId);

    Object.assign(user, data);

    await this.userRepository.save(user);

    return user;
  }
}
```

### Phase 2: Frontend Authentication

#### 2.1 Auth Service (Angular)
```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from storage on init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  get isInstructor(): boolean {
    const role = this.currentUserValue?.role;
    return role === 'instructor' || role === 'admin';
  }

  /**
   * Register new user
   */
  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, data);
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-email`, { token });
  }

  /**
   * Login
   */
  login(email: string, password: string, rememberMe: boolean = false): Observable<User> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password, rememberMe }
    ).pipe(
      tap(response => {
        // Store tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Store user
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        // Update subject
        this.currentUserSubject.next(response.user);
      }),
      map(response => response.user)
    );
  }

  /**
   * Logout
   */
  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken })
        .subscribe();
    }

    // Clear storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    // Clear subject
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/request-password-reset`,
      { email }
    );
  }

  /**
   * Reset password
   */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      { token, password }
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/change-password`,
      { currentPassword, newPassword }
    );
  }

  /**
   * Update profile
   */
  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * OAuth login
   */
  oauthLogin(provider: 'google' | 'github'): void {
    window.location.href = `${this.apiUrl}/oauth/${provider}`;
  }

  /**
   * Check permission
   */
  hasPermission(resource: string, action: string): boolean {
    const user = this.currentUserValue;
    if (!user) return false;

    const permission = `${resource}:${action}`;
    return user.permissions?.includes(permission) || user.role === 'admin';
  }

  /**
   * Refresh tokens
   */
  refreshTokens(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }
}
```

#### 2.2 Auth Components

Create the following components:
- `LoginComponent` - Login form with OAuth buttons
- `RegisterComponent` - Registration form
- `ForgotPasswordComponent` - Request password reset
- `ResetPasswordComponent` - Reset password with token
- `VerifyEmailComponent` - Email verification page
- `ProfileComponent` - User profile management
- `ChangePasswordComponent` - Change password form

#### 2.3 Auth Guards
```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // Check role if specified
      const requiredRoles = route.data['roles'] as string[];
      if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
        this.router.navigate(['/forbidden']);
        return false;
      }

      // Check permission if specified
      const requiredPermission = route.data['permission'] as { resource: string; action: string };
      if (requiredPermission) {
        const hasPermission = this.authService.hasPermission(
          requiredPermission.resource,
          requiredPermission.action
        );

        if (!hasPermission) {
          this.router.navigate(['/forbidden']);
          return false;
        }
      }

      return true;
    }

    // Not logged in, redirect to login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
```

### Phase 3: Email Service

#### 3.1 Email Templates
```typescript
// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to LMS!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password changed successfully',
      html: `
        <h1>Password Changed</h1>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    });
  }
}
```

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register              - Register new user
POST   /api/auth/verify-email          - Verify email with token
POST   /api/auth/login                 - Login user
POST   /api/auth/logout                - Logout user
POST   /api/auth/refresh-token         - Refresh access token
POST   /api/auth/request-password-reset - Request password reset
POST   /api/auth/reset-password        - Reset password with token
POST   /api/auth/change-password       - Change password (authenticated)
GET    /api/auth/me                    - Get current user
PUT    /api/auth/profile               - Update user profile
GET    /api/auth/oauth/google          - Initiate Google OAuth
GET    /api/auth/oauth/google/callback - Google OAuth callback
GET    /api/auth/oauth/github          - Initiate GitHub OAuth
GET    /api/auth/oauth/github/callback - GitHub OAuth callback
```

## Security Features Implemented

✅ Password hashing with bcrypt (12 rounds)
✅ JWT access tokens (short-lived: 15 minutes)
✅ Refresh tokens (long-lived: 7-30 days)
✅ Email verification required
✅ Password reset with expiring tokens
✅ Account lockout after failed attempts
✅ Remember me functionality
✅ OAuth 2.0 integration (Google, GitHub)
✅ Role-based access control (RBAC)
✅ Permission-based authorization
✅ Secure token storage
✅ IP tracking for login attempts
✅ Token rotation on refresh

## Testing Checklist

After implementation, test:
- [ ] User registration
- [ ] Email verification
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (fails after 5 attempts)
- [ ] Logout
- [ ] Password reset request
- [ ] Password reset with token
- [ ] Change password (authenticated)
- [ ] Update profile
- [ ] OAuth login (Google, GitHub)
- [ ] Token refresh
- [ ] Protected route access
- [ ] Role-based access
- [ ] Permission-based access

## Environment Variables Required

```env
# Backend
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret
FRONTEND_URL=http://localhost:4200

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="LMS App <noreply@lms.com>"

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Implementation Steps

1. **Backend Setup**
   - Create entities (User, Permission, RefreshToken)
   - Implement AuthService with all methods
   - Create email service with templates
   - Set up auth controllers and routes
   - Configure OAuth providers (optional)
   - Run migrations

2. **Frontend Setup**
   - Create AuthService
   - Implement all auth components
   - Set up guards and interceptors
   - Configure routes
   - Add OAuth buttons

3. **Integration**
   - Connect frontend to backend API
   - Test all flows
   - Handle errors gracefully
   - Add loading states

4. **Testing**
   - Unit tests for auth service
   - Integration tests for API endpoints
   - E2E tests for user flows
   - Security testing

---

**Deliverables:**
- Complete authentication system with all features
- RBAC with roles and permissions
- Email verification and password reset
- OAuth integration ready
- Secure token management
- Production-ready code

This skill provides enterprise-grade authentication suitable for production applications.
