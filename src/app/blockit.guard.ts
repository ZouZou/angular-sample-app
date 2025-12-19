import { CanActivateFn } from '@angular/router';

export const blockitGuard: CanActivateFn = (route, state) => {
  return true;
};
