import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that preloads routes based on data.preload flag
 * and delays preloading to avoid blocking initial page load
 */
@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route should be preloaded
    if (route.data && route.data['preload']) {
      // Get delay from route data or use default of 2 seconds
      const delay = route.data['preloadDelay'] || 2000;

      console.log(`Preloading ${route.path} after ${delay}ms delay`);

      // Delay preloading to prioritize critical resources
      return timer(delay).pipe(
        mergeMap(() => {
          console.log(`Actually preloading: ${route.path}`);
          return load();
        })
      );
    }

    // Don't preload this route
    return of(null);
  }
}
