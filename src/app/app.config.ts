import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptorFn } from './core/interceptors/auth.interceptor';
import { cacheInterceptorFn } from './core/interceptors/cache.interceptor';
import { SelectivePreloadStrategy } from './core/strategies/selective-preload-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(SelectivePreloadStrategy),
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([authInterceptorFn, cacheInterceptorFn])
    ),
    provideAnimations(),
    SelectivePreloadStrategy
  ]
};
