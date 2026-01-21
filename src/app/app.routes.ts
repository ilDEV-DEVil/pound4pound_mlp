import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

export const routes: Routes = [
    // Authentication Routes
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            // Lazy load auth routes to keep bundle small
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
            }
        ]
    },

    // Onboarding Routes
    {
        path: 'onboarding',
        component: AuthLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'role-selection',
                loadComponent: () => import('./features/onboarding/role-selection/role-selection.component').then(m => m.RoleSelectionComponent)
            },
            {
                path: 'profile-setup',
                loadComponent: () => import('./features/onboarding/profile-setup/profile-setup.component').then(m => m.ProfileSetupComponent)
            }
        ]
    },

    // App Protected Routes
    {
        path: 'app',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'members',
                loadComponent: () => import('./features/members/members.component').then(m => m.MembersComponent)
            },
            {
                path: 'members/:id',
                loadComponent: () => import('./features/members/member-detail/member-detail.component').then(m => m.MemberDetailComponent)
            },

            {
                path: 'courses',
                loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent)
            },
            {
                path: 'subscriptions',
                loadComponent: () => import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
            },
            {
                path: 'schedule',
                loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
            },
            // Placeholders for other routes to prevent errors until created
            { path: '**', redirectTo: 'dashboard' }
        ]
    },

    // Root Redirect
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/auth/login' }
];
