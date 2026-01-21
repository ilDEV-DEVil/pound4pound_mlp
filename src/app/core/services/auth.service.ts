import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, Gym } from '../models';
import { StorageService } from './storage.service';
import { MockDataService } from './mock-data.service';
import { delay, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private router = inject(Router);
    private storage = inject(StorageService);
    private mockData = inject(MockDataService);

    // Signals for reactive state
    private _currentUser = signal<User | null>(null);
    private _isAuthenticated = computed(() => !!this._currentUser());

    currentUser = this._currentUser.asReadonly();
    isAuthenticated = this._isAuthenticated;

    constructor() {
        this.initializeData();
        this.restoreSession();
    }

    private initializeData() {
        // Check if we have data in storage, if not, seed it
        if (!this.storage.getItem('users')) {
            this.storage.setItem('users', this.mockData.getInitialUsers());
            this.storage.setItem('gyms', [this.mockData.getInitialGym()]);
            this.storage.setItem('courses', this.mockData.getInitialCourses());
            this.storage.setItem('subscriptions', this.mockData.getInitialSubscriptions());
            console.log('Mock Data Initialized');
        }
    }

    private restoreSession() {
        const storedUser = this.storage.getItem<User>('currentUser');
        if (storedUser) {
            this._currentUser.set(storedUser);
        }
    }

    login(email: string, password: string) { // Password ignored for mock
        // Simulate network delay
        return of(true).pipe(
            delay(800),
            tap(() => {
                const users = this.storage.getItem<User[]>('users') || [];
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (user) {
                    this._currentUser.set(user);
                    this.storage.setItem('currentUser', user);
                    this.redirectBasedOnRole(user.role);
                } else {
                    throw new Error('Invalid credentials');
                }
            })
        );
    }

    register(userData: Partial<User>, password: string) {
        return of(true).pipe(
            delay(1000),
            tap(() => {
                const users = this.storage.getItem<User[]>('users') || [];

                if (users.find(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
                    throw new Error('Email already exists');
                }

                const newUser: User = {
                    id: `user-${Date.now()}`,
                    email: userData.email!,
                    firstName: userData.firstName!,
                    lastName: userData.lastName!,
                    role: userData.role! as UserRole,
                    gymId: userData.gymId || null,
                    avatar: null,
                    createdAt: new Date()
                };

                if (userData.role === 'manager' && !userData.gymId) {
                    // For manager, we'll create the gym in the next step usually, 
                    // but for MVP let's assume they might be creating it now or later.
                    // Kept simple for now.
                }

                users.push(newUser);
                this.storage.setItem('users', users);

                this._currentUser.set(newUser);
                this.storage.setItem('currentUser', newUser);

                // If it's an athlete joining via code, link them to gym members would go here

                this.redirectBasedOnRole(newUser.role);
            })
        );
    }

    logout() {
        this._currentUser.set(null);
        this.storage.removeItem('currentUser');
        this.router.navigate(['/auth/login']);
    }

    private redirectBasedOnRole(role: UserRole) {
        if (role === 'manager') {
            // Check if gym is setup, if not -> onboarding
            // Detailed logic later, for now dashboard
            this.router.navigate(['/app/dashboard']);
        } else {
            this.router.navigate(['/app/dashboard']);
        }
    }

    hasRole(role: UserRole): boolean {
        return this.currentUser()?.role === role;
    }
}
