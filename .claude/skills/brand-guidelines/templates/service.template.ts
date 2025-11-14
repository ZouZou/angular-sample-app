import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

/**
 * [Service Description]
 *
 * [Detailed explanation of what this service does and its responsibilities]
 *
 * @example
 * ```typescript
 * constructor(private exampleService: ExampleService) {}
 *
 * // Using signals (Angular 16+)
 * loadData(): void {
 *   console.log(this.exampleService.data()); // Access signal value
 * }
 *
 * // Or using observables
 * loadDataWithObservable(): void {
 *   this.exampleService.getData().subscribe({
 *     next: (data) => console.log(data),
 *     error: (err) => console.error(err)
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root' // Makes this a singleton service
})
export class ExampleService {
  // API base URL from environment
  private readonly API_URL = environment.apiUrl;

  // State management with Signals (Angular 16+) - Preferred
  private _data = signal<any[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly hasData = computed(() => this._data().length > 0);
  readonly isEmpty = computed(() => this._data().length === 0 && !this._loading());

  // Alternative: State management with BehaviorSubject (for backward compatibility)
  private dataSubject = new BehaviorSubject<any[]>([]);
  public data$ = this.dataSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Constructor with dependency injection
   */
  constructor(private http: HttpClient) {
    this.initialize();
  }

  /**
   * Initialize the service
   */
  private initialize(): void {
    // Load any initial data or configuration
  }

  /**
   * Get all items from the API
   *
   * @returns Observable array of items
   */
  public getAll(): Observable<any[]> {
    // Update both signal and subject for compatibility
    this._loading.set(true);
    this.loadingSubject.next(true);

    return this.http.get<any[]>(`${this.API_URL}/items`).pipe(
      tap((data) => {
        this._data.set(data);
        this._loading.set(false);
        this._error.set(null);
        // Also update subjects for backward compatibility
        this.dataSubject.next(data);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this._loading.set(false);
        this._error.set(error.message);
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get a single item by ID
   *
   * @param id - The item ID
   * @returns Observable of the item
   */
  public getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/items/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new item
   *
   * @param item - The item data to create
   * @returns Observable of the created item
   */
  public create(item: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.API_URL}/items`, item, { headers }).pipe(
      tap((newItem) => {
        // Update local state
        const current = this.dataSubject.value;
        this.dataSubject.next([...current, newItem]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing item
   *
   * @param id - The item ID
   * @param updates - Partial item data to update
   * @returns Observable of the updated item
   */
  public update(id: string, updates: Partial<any>): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<any>(`${this.API_URL}/items/${id}`, updates, { headers }).pipe(
      tap((updatedItem) => {
        // Update local state
        const current = this.dataSubject.value;
        const index = current.findIndex(item => item.id === id);
        if (index !== -1) {
          current[index] = updatedItem;
          this.dataSubject.next([...current]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete an item
   *
   * @param id - The item ID to delete
   * @returns Observable of void
   */
  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${id}`).pipe(
      tap(() => {
        // Update local state
        const current = this.dataSubject.value;
        this.dataSubject.next(current.filter(item => item.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Search items with filters
   *
   * @param query - Search query string
   * @param filters - Additional filter options
   * @returns Observable array of filtered items
   */
  public search(query: string, filters?: any): Observable<any[]> {
    const params = { query, ...filters };

    return this.http.get<any[]>(`${this.API_URL}/items/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.dataSubject.next([]);
  }

  /**
   * Handle HTTP errors
   *
   * @param error - The HTTP error response
   * @returns Observable that throws a user-friendly error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please sign in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested item was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }

    console.error('Service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
