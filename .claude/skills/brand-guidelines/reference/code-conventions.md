# Code Conventions

Angular and TypeScript coding standards for the Accounting Module project.

## General Principles

1. **Follow Angular Style Guide**: Adhere to [Angular's official style guide](https://angular.io/guide/styleguide)
2. **Write Self-Documenting Code**: Code should be clear without excessive comments
3. **Consistency Over Preference**: Follow project patterns, even if you'd do it differently
4. **DRY Principle**: Don't Repeat Yourself - extract reusable logic
5. **Single Responsibility**: Each class, function, or module should do one thing well

## File Naming Conventions

### Angular Files

**Components**
```
user-profile.component.ts
user-profile.component.html
user-profile.component.scss
user-profile.component.spec.ts
```

**Services**
```
auth.service.ts
auth.service.spec.ts
```

**Modules**
```
accounting.module.ts
shared.module.ts
```

**Guards**
```
auth.guard.ts
admin.guard.ts
```

**Interceptors**
```
http-error.interceptor.ts
auth.interceptor.ts
```

**Pipes**
```
currency-format.pipe.ts
date-format.pipe.ts
```

**Directives**
```
highlight.directive.ts
tooltip.directive.ts
```

**Models/Interfaces**
```
transaction.model.ts
user.interface.ts
```

### General Rules
- Use kebab-case for file names
- Add appropriate suffix (.component, .service, .guard, etc.)
- One component/service/class per file
- Test files should mirror source files with `.spec.ts` suffix

## TypeScript Naming Conventions

### Classes & Interfaces

**PascalCase with descriptive suffix**
```typescript
// Components
export class UserProfileComponent { }
export class TransactionListComponent { }

// Services
export class AuthService { }
export class DataStorageService { }

// Interfaces
export interface Transaction { }
export interface UserData { }

// Models
export class Account { }
export class JournalEntry { }

// Guards
export class AuthGuard { }

// Pipes
export class CurrencyFormatPipe { }
```

### Variables & Functions

**camelCase**
```typescript
// Variables
const currentUser = ...;
let totalAmount = 0;
const isAuthenticated = false;

// Functions
function calculateTotal() { }
function getUserById(id: string) { }
```

### Constants

**UPPER_SNAKE_CASE for true constants**
```typescript
export const API_BASE_URL = 'https://api.example.com';
export const MAX_UPLOAD_SIZE = 5242880;
export const DEFAULT_PAGE_SIZE = 20;
```

**camelCase for configuration objects**
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://api.example.com'
};
```

### Enums

**PascalCase for enum, UPPER_CASE for values**
```typescript
export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}
```

## Project Structure

### Feature-Based Organization

```
src/
├── app/
│   ├── core/                 # Singleton services, guards
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── core.module.ts
│   │
│   ├── shared/               # Shared components, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   ├── directives/
│   │   └── shared.module.ts
│   │
│   ├── features/             # Feature modules
│   │   ├── accounting/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── accounting.module.ts
│   │   │
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── models/               # Global models/interfaces
│   └── app.module.ts
│
├── assets/
├── environments/
└── styles/
```

### Module Guidelines

**Core Module**
- Import only once in AppModule
- Contains singleton services
- Authentication, logging, HTTP interceptors

**Shared Module**
- Import in multiple feature modules
- Reusable components, pipes, directives
- No services (services should be in Core)

**Feature Modules**
- One feature per module
- Lazy-loaded when possible
- Self-contained with own routing

## Component Conventions

### Component Structure

```typescript
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * Displays a user profile card with avatar and basic information
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  // Inputs first
  @Input() userId!: string;
  @Input() showDetails = false;

  // Outputs
  @Output() profileClick = new EventEmitter<string>();

  // Public properties
  user: User | null = null;
  isLoading = false;

  // Private properties
  private subscription?: Subscription;

  // Constructor
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Public methods
  onProfileClick(): void {
    this.profileClick.emit(this.userId);
  }

  // Private methods
  private loadUser(): void {
    this.isLoading = true;
    this.subscription = this.userService.getUser(this.userId)
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load user', error);
          this.isLoading = false;
        }
      });
  }
}
```

### Component Ordering
1. Decorators (@Input, @Output, @ViewChild)
2. Public properties
3. Private properties
4. Constructor
5. Lifecycle hooks (in order)
6. Public methods
7. Private methods

### Selector Naming
- Prefix with `app-`: `app-user-profile`
- Use kebab-case
- Descriptive and specific

## Service Conventions

### Service Structure

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Handles authentication operations including login, logout, and token management
 */
@Injectable({
  providedIn: 'root' // or specify module
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        map(user => {
          this.setCurrentUser(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    throw error;
  }
}
```

### Service Guidelines
- Use `providedIn: 'root'` for singleton services
- Expose observables with `$` suffix: `user$`, `loading$`
- Keep services focused on one responsibility
- Use private methods for internal logic

## TypeScript Best Practices

### Type Safety

**Always use explicit types**
```typescript
// ✓ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✗ Bad
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Use interfaces for object shapes**
```typescript
interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  description?: string; // Optional
}
```

**Use union types for specific values**
```typescript
type Status = 'pending' | 'approved' | 'rejected';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

### Nullability

**Use strict null checks**
```typescript
// ✓ Good
let user: User | null = null;
const name = user?.name ?? 'Guest';

// ✗ Bad
let user: User = null; // Type error
const name = user.name; // Potential runtime error
```

**Use non-null assertion sparingly**
```typescript
// Only when you're absolutely certain
const element = document.getElementById('app')!;
```

### Async/Await vs Observables

**Use Observables for**
- HTTP requests
- Event streams
- Multiple values over time

**Use async/await for**
- Simple async operations
- Converting promises
- Better readability in complex logic

```typescript
// Observable pattern
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.API_URL}/users`);
}

// Async/await when needed
async loadUserData(userId: string): Promise<void> {
  try {
    this.isLoading = true;
    const user = await lastValueFrom(this.userService.getUser(userId));
    this.user = user;
  } catch (error) {
    console.error('Failed to load user', error);
  } finally {
    this.isLoading = false;
  }
}
```

## Template Conventions

### Template Syntax

```html
<!-- Use semantic HTML -->
<article class="transaction-card">
  <header class="transaction-card__header">
    <h3>{{ transaction.description }}</h3>
  </header>

  <div class="transaction-card__body">
    <!-- Use async pipe for observables -->
    <p *ngIf="user$ | async as user">
      Created by: {{ user.name }}
    </p>

    <!-- Use trackBy for ngFor -->
    <ul>
      <li *ngFor="let item of items; trackBy: trackByItemId">
        {{ item.name }}
      </li>
    </ul>

    <!-- Use ng-container for structural directives -->
    <ng-container *ngIf="isLoading; else content">
      <app-loader></app-loader>
    </ng-container>

    <ng-template #content>
      <div>Content here</div>
    </ng-template>
  </div>

  <footer class="transaction-card__actions">
    <!-- Event binding -->
    <button (click)="onEdit()" class="btn btn-primary">
      Edit
    </button>
    <button (click)="onDelete()" class="btn btn-secondary">
      Delete
    </button>
  </footer>
</article>
```

### Template Guidelines
- Use semantic HTML elements
- Prefer async pipe over manual subscriptions
- Use trackBy with *ngFor for performance
- Keep templates simple, move logic to component
- Use BEM or consistent naming for CSS classes

## RxJS Conventions

### Observable Naming
```typescript
// Add $ suffix to observable variables
user$: Observable<User>;
loading$: Observable<boolean>;
transactions$: Observable<Transaction[]>;
```

### Subscription Management

**Use takeUntil pattern**
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Or use async pipe (preferred)**
```typescript
export class MyComponent {
  data$ = this.dataService.getData();
}
```

```html
<div *ngIf="data$ | async as data">
  {{ data.value }}
</div>
```

## Error Handling

### HTTP Errors

```typescript
getTransaction(id: string): Observable<Transaction> {
  return this.http.get<Transaction>(`${this.API_URL}/transactions/${id}`)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to fetch transaction', error);

        if (error.status === 404) {
          return throwError(() => new Error('Transaction not found'));
        }

        return throwError(() => new Error('Failed to fetch transaction'));
      })
    );
}
```

### Form Validation

```typescript
// In component
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  amount: ['', [Validators.required, Validators.min(0)]],
  date: ['', [Validators.required, this.dateValidator]]
});

// Custom validator
private dateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const date = new Date(value);
  const today = new Date();

  return date > today ? { futureDate: true } : null;
}
```

## Comments & Documentation

### JSDoc for Public APIs

```typescript
/**
 * Calculates the total amount from a list of transactions
 *
 * @param transactions - Array of transactions to calculate from
 * @param filterType - Optional filter by transaction type
 * @returns Total amount as a number
 *
 * @example
 * ```typescript
 * const total = calculateTotal(transactions, 'DEBIT');
 * ```
 */
export function calculateTotal(
  transactions: Transaction[],
  filterType?: TransactionType
): number {
  // Implementation
}
```

### Inline Comments

**Use sparingly - only when code intent isn't clear**

```typescript
// ✓ Good - explains "why"
// Delay validation to prevent excessive API calls
setTimeout(() => this.validate(), 300);

// ✗ Bad - explains "what" (obvious from code)
// Set loading to true
this.isLoading = true;
```

## Testing Conventions

### Test File Structure

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store credentials', () => {
      const mockUser = { id: '1', email: 'test@test.com' };

      service.login('test@test.com', 'password').subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);
    });
  });
});
```

## Common Patterns

### Smart vs Dumb Components

**Smart (Container) Components**
- Inject services
- Manage state
- Handle business logic
- Pass data to dumb components

**Dumb (Presentational) Components**
- @Input for data
- @Output for events
- No service injection
- Pure presentation logic

### State Management Patterns

**Service with BehaviorSubject**
```typescript
@Injectable({ providedIn: 'root' })
export class TransactionStore {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  addTransaction(transaction: Transaction): void {
    const current = this.transactionsSubject.value;
    this.transactionsSubject.next([...current, transaction]);
  }
}
```

## Code Review Checklist

Before committing code, verify:
- [ ] Follows naming conventions
- [ ] Type safety enforced (no `any` without justification)
- [ ] Subscriptions properly managed
- [ ] Error handling implemented
- [ ] No console.logs in production code
- [ ] Tests updated and passing
- [ ] Code is readable and self-documenting
- [ ] Follows project structure
- [ ] Accessibility considered
- [ ] Performance optimized (trackBy, OnPush where applicable)
