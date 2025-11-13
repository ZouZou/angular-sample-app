import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    politeness: 'polite' // ARIA live region politeness for screen readers
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
      politeness: 'polite'
    });
  }

  error(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: ['error-snackbar'],
      politeness: 'assertive' // Errors are announced immediately
    });
  }

  info(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar'],
      politeness: 'polite'
    });
  }

  warning(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 4000,
      panelClass: ['warning-snackbar'],
      politeness: 'assertive' // Warnings are announced immediately
    });
  }
}
