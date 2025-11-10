import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { UserDashboardComponent } from './dashboard/user-dashboard.component';
import { BlockitGuard } from './blockit.guard';
import { NavigationComponent } from './navigation/navigation.component';
import { UserComponent } from './user/user.component';
import { MotorQuotationComponent } from './motor-quotation/motor-quotation.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'User',
    component: UserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'Navigation',
    component: NavigationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'motor-quote',
    component: MotorQuotationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'customer',
    canActivate: [AuthGuard, BlockitGuard],
    loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: 'courses',
    canActivate: [AuthGuard],
    loadChildren: () => import('./course/course.module').then(m => m.CourseModule)
  },
  {
    path: '**',
    redirectTo: '/courses'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
