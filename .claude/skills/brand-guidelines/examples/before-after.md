# Before & After Examples

Examples showing transformations when applying brand guidelines.

## Visual/UI Examples

### Example 1: Button Styling

**Before (Non-compliant)**
```html
<button style="background-color: #ff0000; font-size: 18px; padding: 15px;">
  Click me
</button>
```

```scss
.my-button {
  background: red;
  color: white;
  font-size: 18px;
  padding: 15px;
  border-radius: 3px;
}
```

**Issues:**
- Hardcoded hex color not from brand palette
- Inconsistent padding (15px not multiple of 8)
- Random border radius
- Non-semantic naming
- Inline styles

**After (Brand-compliant)**
```html
<button class="btn btn-primary">
  Get Started
</button>
```

```scss
.btn {
  padding: var(--space-3) var(--space-4); // 16px 24px
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-sm); // 4px
  transition: background-color var(--transition-base);

  &.btn-primary {
    background-color: var(--primary-color);
    color: white;

    &:hover {
      background-color: var(--primary-dark);
    }
  }
}
```

**Improvements:**
- Uses CSS custom properties from brand palette
- Follows 8px spacing system
- Action-oriented copy
- Semantic class names
- Proper hover state

---

### Example 2: Typography

**Before (Non-compliant)**
```html
<h1 style="font-size: 30px; color: #333;">
  Welcome to our app
</h1>
<p style="font-size: 15px; line-height: 1.5;">
  This is some text.
</p>
```

**Issues:**
- Arbitrary font sizes
- Hardcoded colors
- Inconsistent line heights
- Inline styles
- Generic heading text

**After (Brand-compliant)**
```html
<h1 class="page-title">
  Account Dashboard
</h1>
<p class="body-text">
  View your recent transactions and account activity.
</p>
```

```scss
.page-title {
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.body-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: var(--text-primary);
}
```

**Improvements:**
- Follows typography scale
- Proper line heights for readability
- Specific, descriptive heading
- Semantic class names
- Uses brand color variables

---

### Example 3: Form Input

**Before (Non-compliant)**
```html
<input type="text" placeholder="Email" style="width: 300px; height: 35px;">
```

**Issues:**
- Hardcoded dimensions
- Non-standard height (not multiple of 8)
- Vague placeholder
- Missing label for accessibility

**After (Brand-compliant)**
```html
<div class="form-group">
  <label for="email" class="form-label">Email address</label>
  <input
    type="email"
    id="email"
    class="form-control"
    placeholder="name@example.com"
    aria-describedby="email-help">
  <small id="email-help" class="form-text">
    We'll never share your email
  </small>
</div>
```

```scss
.form-control {
  height: 40px; // Multiple of 8
  padding: 10px 16px; // 8px multiples
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  width: 100%;

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}
```

**Improvements:**
- Proper label for accessibility
- Example placeholder text
- Helper text for guidance
- ARIA attributes
- Responsive width
- Proper focus state

---

## Writing/Tone Examples

### Example 4: Error Messages

**Before (Non-compliant)**
```
Error: validation_failed
```

**Issues:**
- Technical error code shown to user
- No helpful guidance
- Not user-friendly

**After (Brand-compliant)**
```
Invalid email format
Please enter a valid email address (e.g., name@example.com)
```

**Improvements:**
- Clear problem statement
- Actionable solution
- Example format shown
- Professional yet helpful tone

---

### Example 5: Empty State

**Before (Non-compliant)**
```html
<div>
  <p>No data</p>
</div>
```

**Issues:**
- Abrupt and unhelpful
- No guidance on what to do next
- Missed opportunity for engagement

**After (Brand-compliant)**
```html
<div class="empty-state">
  <h3>No transactions yet</h3>
  <p>Get started by creating your first transaction to track your accounting activity.</p>
  <button class="btn btn-primary">
    Create Transaction
  </button>
</div>
```

**Improvements:**
- Encouraging tone
- Clear next action
- Explains the benefit
- Action-oriented CTA

---

### Example 6: Button Copy

**Before (Non-compliant)**
```html
<button>Submit</button>
<button>Click here</button>
<button>OK</button>
```

**Issues:**
- Vague actions
- Not specific to context
- "Click here" is poor UX

**After (Brand-compliant)**
```html
<button class="btn btn-primary">Save Changes</button>
<button class="btn btn-primary">Export Report</button>
<button class="btn btn-primary">Create Account</button>
```

**Improvements:**
- Verb + object pattern
- Specific to action
- Clear expectations
- Follows brand voice

---

## Code Convention Examples

### Example 7: Component Naming

**Before (Non-compliant)**
```typescript
// user.ts
export class User {
  // This is a component, not a model
}

// userprofile.component.ts
export class userprofile {
  // Wrong casing, missing suffix
}
```

**Issues:**
- Unclear file naming
- Incorrect class naming
- Missing type suffixes
- Not following Angular conventions

**After (Brand-compliant)**
```typescript
// user-profile.component.ts
export class UserProfileComponent implements OnInit {
  // Correct naming and implements interface
}

// user.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

**Improvements:**
- kebab-case file names
- PascalCase class names
- Proper suffixes (.component, .model)
- Implements lifecycle interfaces
- Clear separation of concerns

---

### Example 8: Service Structure

**Before (Non-compliant)**
```typescript
export class DataService {
  apiUrl = 'https://api.example.com';

  constructor(private http: HttpClient) {}

  get(id) {
    return this.http.get(this.apiUrl + '/items/' + id);
  }
}
```

**Issues:**
- Missing @Injectable decorator
- No type annotations
- String concatenation for URLs
- No error handling
- Public apiUrl (should be private)
- No JSDoc comments

**After (Brand-compliant)**
```typescript
/**
 * Manages data operations for items
 *
 * Provides CRUD operations and caching for item entities
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get item by ID
   *
   * @param id - The item identifier
   * @returns Observable of the item
   */
  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.API_URL}/items/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error fetching item', error);
    return throwError(() => new Error('Failed to fetch item'));
  }
}
```

**Improvements:**
- Proper decorator and configuration
- Full type safety
- Template literals for URLs
- Error handling
- JSDoc documentation
- Private properties
- Descriptive method names

---

### Example 9: Template Structure

**Before (Non-compliant)**
```html
<div>
  <div *ngFor="let item of items">
    <span>{{item.name}}</span>
    <button (click)="delete(item)">Delete</button>
  </div>
</div>
```

**Issues:**
- No trackBy function (performance)
- Non-semantic HTML
- No accessibility attributes
- Missing loading/error states
- No CSS classes for styling

**After (Brand-compliant)**
```html
<article class="item-list">
  <h2 class="item-list__title">Your Items</h2>

  <!-- Loading State -->
  <div *ngIf="loading$ | async" class="loading-spinner">
    <p>Loading items...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error$ | async as error" class="error-message" role="alert">
    <p>{{ error }}</p>
  </div>

  <!-- Content -->
  <ul *ngIf="items$ | async as items" class="item-list__items">
    <li *ngFor="let item of items; trackBy: trackByItemId" class="item-list__item">
      <span class="item-list__name">{{ item.name }}</span>
      <button
        (click)="onDelete(item.id)"
        class="btn btn-danger btn-sm"
        aria-label="Delete {{ item.name }}">
        Delete
      </button>
    </li>
  </ul>

  <!-- Empty State -->
  <div *ngIf="(items$ | async)?.length === 0" class="empty-state">
    <p>No items yet</p>
    <button class="btn btn-primary" (click)="onCreate()">
      Create Item
    </button>
  </div>
</article>
```

**Improvements:**
- Semantic HTML elements
- trackBy for performance
- Async pipe (no manual subscriptions)
- Loading, error, and empty states
- Accessibility attributes
- BEM naming convention
- Descriptive ARIA labels

---

## Documentation Examples

### Example 10: Function Documentation

**Before (Non-compliant)**
```typescript
// calculates total
function calc(arr) {
  return arr.reduce((a, b) => a + b.price, 0);
}
```

**Issues:**
- Vague comment
- No type information
- No parameter documentation
- Unclear function name

**After (Brand-compliant)**
```typescript
/**
 * Calculates the total amount from an array of transactions
 *
 * @param transactions - Array of transaction objects to sum
 * @returns The total amount as a number
 *
 * @example
 * ```typescript
 * const total = calculateTotalAmount([
 *   { price: 10.50, type: 'DEBIT' },
 *   { price: 25.00, type: 'CREDIT' }
 * ]);
 * console.log(total); // 35.50
 * ```
 */
function calculateTotalAmount(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => sum + transaction.price, 0);
}
```

**Improvements:**
- Comprehensive JSDoc
- Full type annotations
- Clear parameter documentation
- Working code example
- Descriptive function name

---

### Example 11: README Content

**Before (Non-compliant)**
```markdown
# Project

This is a project.

## Install
npm i

## Use
Just use it.
```

**Issues:**
- Too vague
- No context or explanation
- Missing important sections
- Poor formatting

**After (Brand-compliant)**
```markdown
# Accounting Module

A comprehensive accounting management system for tracking transactions, generating reports, and managing financial data.

## Overview

The Accounting Module provides businesses with tools to:
- Track debits and credits across multiple accounts
- Generate financial reports (balance sheets, P&L statements)
- Export data in multiple formats (CSV, Excel, PDF)
- Manage chart of accounts and journal entries

Built with Angular 17 and TypeScript for modern web applications.

## Installation

```bash
npm install accounting-module
```

## Quick Start

```typescript
import { AccountingModule } from 'accounting-module';

@NgModule({
  imports: [AccountingModule]
})
export class AppModule { }
```

## Documentation

- [User Guide](./docs/user-guide.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./docs/examples.md)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
```

**Improvements:**
- Clear project description
- Bulleted feature list
- Complete installation instructions
- Working examples
- Proper code formatting
- Organized sections
- Links to additional docs

---

## Combined Example: Complete Component

### Before (Non-compliant)

**bad-component.ts**
```typescript
export class comp {
  data: any;

  constructor(private svc: any) {}

  ngOnInit() {
    this.svc.get().subscribe(d => {
      this.data = d;
    });
  }

  save() {
    this.svc.save(this.data);
  }
}
```

**bad-component.html**
```html
<div>
  <h1>Data</h1>
  <div *ngFor="let item of data">
    {{item.name}}
  </div>
  <button (click)="save()">Save</button>
</div>
```

### After (Brand-compliant)

**transaction-list.component.ts**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Transaction } from '@models/transaction.model';
import { TransactionService } from '@services/transaction.service';

/**
 * Displays a list of transactions with filtering and sorting capabilities
 */
@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Saves changes to all transactions
   */
  onSaveChanges(): void {
    this.isLoading = true;

    this.transactionService.updateBatch(this.transactions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Show success message
        },
        error: (error) => {
          this.errorMessage = 'Failed to save changes';
          this.isLoading = false;
          console.error('Error saving transactions', error);
        }
      });
  }

  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }

  private loadTransactions(): void {
    this.isLoading = true;

    this.transactionService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load transactions';
          this.isLoading = false;
          console.error('Error loading transactions', error);
        }
      });
  }
}
```

**transaction-list.component.html**
```html
<article class="transaction-list">
  <header class="transaction-list__header">
    <h2>Recent Transactions</h2>
  </header>

  <!-- Loading State -->
  <div *ngIf="isLoading" class="loading-spinner">
    <p>Loading transactions...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="errorMessage" class="error-message" role="alert">
    <p>{{ errorMessage }}</p>
    <button (click)="loadTransactions()" class="btn btn-secondary">
      Try Again
    </button>
  </div>

  <!-- Transaction List -->
  <ul *ngIf="!isLoading && !errorMessage && transactions.length > 0"
      class="transaction-list__items">
    <li *ngFor="let transaction of transactions; trackBy: trackByTransactionId"
        class="transaction-list__item">
      <span class="transaction-list__name">{{ transaction.description }}</span>
      <span class="transaction-list__amount">
        {{ transaction.amount | currency }}
      </span>
    </li>
  </ul>

  <!-- Empty State -->
  <div *ngIf="!isLoading && !errorMessage && transactions.length === 0"
       class="empty-state">
    <h3>No transactions yet</h3>
    <p>Create your first transaction to get started.</p>
    <button class="btn btn-primary" routerLink="/transactions/new">
      Create Transaction
    </button>
  </div>

  <!-- Actions -->
  <footer *ngIf="transactions.length > 0" class="transaction-list__actions">
    <button
      (click)="onSaveChanges()"
      class="btn btn-primary"
      [disabled]="isLoading"
      aria-label="Save all changes">
      Save Changes
    </button>
  </footer>
</article>
```

**Improvements:**
- Proper naming conventions throughout
- Full type safety
- Lifecycle management
- Error handling
- Loading and empty states
- Semantic HTML
- Accessibility attributes
- trackBy for performance
- Descriptive copy
- BEM naming for styles
- JSDoc documentation
- Follows all brand guidelines
