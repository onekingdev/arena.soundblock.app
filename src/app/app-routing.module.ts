import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth';
import { ReverseAuthGuard } from './core/guard/reverse-auth';
import { SignUpGuard } from './core/guard/sign-up';
import { TicketSidebarComponent } from './components/ticketbar/ticketbar.component';
import { DatabaseTableComponent } from './components/project/table/database-table/database-table.component';

const routes: Routes = [
  {
    path: 'home',
    redirectTo: 'projects',
    pathMatch:'full'
  },
  {
    path: 'auth',
    redirectTo: 'auth/signin'
  },
  {
    path: 'auth/signin',
    loadChildren: () => import('./pages/auth/sign-in/sign-in.module').then(m => m.SignInPageModule),
    canActivate: [ReverseAuthGuard]
  },
  {
    path: 'auth/password-recovery',
    loadChildren: () => import('./pages/auth/password-recovery/password-recovery.module').then(m => m.PasswordRecoveryPageModule)
  },

  {
    path: 'auth/signup',
    loadChildren: () => import('./pages/auth/register/ready/ready.module').then(m => m.ReadyPageModule),
    canActivate: [ReverseAuthGuard]
  },
  {
    path: 'auth/signup/1',
    loadChildren: () => import('./pages/auth/register/set/set.module').then(m => m.SetPageModule),
    canActivate: [SignUpGuard]
  },
  {
    path: 'auth/signup/2',
    loadChildren: () => import('./pages/auth/register/go/go.module').then(m => m.GoPageModule),
    canActivate: [SignUpGuard]
  },
  {
    path: 'email/:hash',
    loadChildren: () => import('./pages/auth/email-confirm/email-confirm.module').then(m => m.EmailConfirmPageModule),
  },
  {
    path: 'reports',
    loadChildren: () => import('./pages/reports/reports/reports.module').then(m => m.ReportsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'support',
    component: TicketSidebarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    loadChildren: () => import('./pages/projects/projects.module').then(m => m.ProjectsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/create',
    loadChildren: () => import('./pages/projects/create-project/create-project.module').then(m => m.CreateProjectModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:id/contract',
    pathMatch: 'full',
    loadChildren: () => import('./pages/projects/contract/contract.module').then(m => m.ContractPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:id/database',
    pathMatch: 'full',
   component: DatabaseTableComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:id/team',
    pathMatch:'full',
    loadChildren: () => import('./pages/projects/team/team.module').then(m => m.TeamPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:id/deployments',
    pathMatch:'full',
    loadChildren: () => import('./pages/projects/deployments/deployments.module').then(m => m.DeploymentsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project/:category/:id',
    pathMatch:'full',
    loadChildren: () => import('./pages/projects/project/project.module').then(m => m.ProjectPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'invite/:hash',
    loadChildren: () => import('./pages/auth/invite/invite.module').then(m => m.InvitePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/payment',
    loadChildren: () => import('./pages/profile/payment/payment.module').then(m => m.PaymentPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/contact',
    loadChildren: () => import('./pages/profile/contact/contact.module').then(m => m.ContactPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/address',
    loadChildren: () => import('./pages/profile/address/address.module').then(m => m.AddressPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/security',
    loadChildren: () => import('./pages/profile/security/security.module').then(m => m.SecurityPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'test', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    // loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule)
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    onSameUrlNavigation: 'reload',
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
