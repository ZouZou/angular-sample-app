import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from './shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) { }

  /**
   * Performs an HTTP GET request to the specified URL
   * @param url - The endpoint URL to fetch data from
   * @returns Observable of the HTTP response
   */
  getRequest<T = unknown>(url: string): Observable<T> {
    return this.http.get<T>(url)
    .pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs an HTTP POST request to the specified URL
   * @param url - The endpoint URL to send data to
   * @param data - The request body data
   * @param option - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the HTTP response
   */
  postRequest<T = unknown>(url: string, data: unknown, option?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.post<T>(url, data, option)
    .pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs an HTTP PUT request to the specified URL
   * @param url - The endpoint URL to update data at
   * @param data - The request body data
   * @param option - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the HTTP response
   */
  updateRequest<T = unknown>(url: string, data: unknown, option?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
    return this.http.put<T>(url, data, option)
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      this.logger.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      this.logger.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
