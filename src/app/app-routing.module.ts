import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { BlockitGuard } from './blockit.guard';
import { NavigationComponent } from './navigation/navigation.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  {
    path: 'User', component: UserComponent
  },
  {
    path: 'Admin', component: AdminComponent
  },
  {
    path: 'Navigation', component: NavigationComponent
  },
  {
    path: '', redirectTo: '/Navigation', pathMatch: 'full'
  },
  { 
    path: 'customer', 
    canActivate: [BlockitGuard],
    loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule) },
  {
    path: '**', component: AdminComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
