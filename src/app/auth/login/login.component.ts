import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../course/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
/**
 * Handles user authentication and login functionality
 *
 * Manages the login form submission, user credential validation, and authentication flow.
 * Provides demo credentials for testing across different user roles (Admin, Student, Instructor).
 * Features form validation, password visibility toggle, loading state management, and user feedback
 * via toast notifications. Automatically redirects authenticated users to the dashboard.
 *
 * @example
 * ```html
 * <app-login></app-login>
 * ```
 */
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  // Demo credentials to display
  demoCredentials = [
    { role: 'Admin', email: 'admin@lms.com', password: 'admin123' },
    { role: 'Student', email: 'john@lms.com', password: 'student123' },
    { role: 'Instructor', email: 'jane@lms.com', password: 'instructor123' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.snackBar.open(`Welcome back, ${user.name}!`, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });

          this.redirectUser();
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.message || 'Invalid credentials. Please verify your email and password.', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  quickLogin(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.onSubmit();
  }

  private redirectUser(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    // Redirect to dashboard for all users
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    if (control?.hasError('required')) {
      return `${fieldLabel} is required. Please enter your ${fieldName}.`;
    }

    if (control?.hasError('email')) {
      return 'Invalid email format. Please enter a valid email address (e.g., name@example.com).';
    }

    if (control?.hasError('minlength')) {
      return `${fieldLabel} too short. Use at least 6 characters.`;
    }

    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
