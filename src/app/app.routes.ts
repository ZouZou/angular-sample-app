import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { blockitGuard } from './blockit.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'User',
    loadComponent: () => import('./user/user.component').then(m => m.UserComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'Navigation',
    loadComponent: () => import('./navigation/navigation.component').then(m => m.NavigationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'motor-quote',
    loadComponent: () => import('./motor-quotation/motor-quotation.component').then(m => m.MotorQuotationComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'customer',
    canActivate: [authGuard, blockitGuard],
    loadChildren: () => import('./customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadChildren: () => import('./course/course.routes').then(m => m.COURSE_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/courses'
  }
];
