import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const authInterceptorFn: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Clone the request and add authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/courses']); // Redirect to courses page (public)
      }
      return throwError(() => error);
    })
  );
};
