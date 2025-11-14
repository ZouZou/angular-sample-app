import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoggerService } from './logger.service';

interface FormState {
  formId: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private autoSaveSubject = new Subject<{ formId: string; status: 'saving' | 'saved' | 'error' }>();
  public autoSaveStatus$ = this.autoSaveSubject.asObservable();

  private readonly STORAGE_PREFIX = 'form_state_';
  private readonly AUTO_SAVE_DELAY = 2000; // 2 seconds

  constructor(private logger: LoggerService) {}

  /**
   * Enable auto-save for a form
   * Saves form state to localStorage automatically on value changes
   */
  enableAutoSave(formId: string, formGroup: FormGroup, customDelay?: number): void {
    const delay = customDelay || this.AUTO_SAVE_DELAY;

    formGroup.valueChanges
      .pipe(
        debounceTime(delay),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(value => {
        this.saveFormState(formId, value);
        this.autoSaveSubject.next({ formId, status: 'saving' });

        // Simulate save delay for better UX feedback
        setTimeout(() => {
          this.autoSaveSubject.next({ formId, status: 'saved' });
        }, 500);
      });
  }

  /**
   * Save form state to localStorage
   */
  saveFormState(formId: string, data: any): void {
    const formState: FormState = {
      formId,
      data,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(
        `${this.STORAGE_PREFIX}${formId}`,
        JSON.stringify(formState)
      );
    } catch (error) {
      this.logger.error('Error saving form state:', error);
      this.autoSaveSubject.next({ formId, status: 'error' });
    }
  }

  /**
   * Restore form state from localStorage
   */
  restoreFormState(formId: string): any | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${formId}`);
      if (stored) {
        const formState: FormState = JSON.parse(stored);
        return formState.data;
      }
    } catch (error) {
      this.logger.error('Error restoring form state:', error);
    }
    return null;
  }

  /**
   * Check if form has saved state
   */
  hasSavedState(formId: string): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}${formId}`) !== null;
  }

  /**
   * Get the age of saved form state in milliseconds
   */
  getSavedStateAge(formId: string): number | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${formId}`);
      if (stored) {
        const formState: FormState = JSON.parse(stored);
        return Date.now() - formState.timestamp;
      }
    } catch (error) {
      this.logger.error('Error getting saved state age:', error);
    }
    return null;
  }

  /**
   * Clear saved form state
   */
  clearFormState(formId: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${formId}`);
  }

  /**
   * Clear all form states older than specified age (in milliseconds)
   */
  clearOldFormStates(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const formState: FormState = JSON.parse(stored);
            if (now - formState.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Invalid stored data, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get formatted time since last save
   */
  getTimeSinceLastSave(formId: string): string | null {
    const age = this.getSavedStateAge(formId);
    if (age === null) return null;

    const seconds = Math.floor(age / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}
