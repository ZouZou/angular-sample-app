import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../course/services/auth.service';

export const instructorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && (authService.isInstructor() || authService.isAdmin())) {
    return true;
  }

  // Redirect to courses page if not instructor or admin
  return router.createUrlTree(['/courses']);
};
