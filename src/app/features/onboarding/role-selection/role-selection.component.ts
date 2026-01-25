import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent, ButtonComponent } from '../../../shared/components';
import { UserRole } from '../../../core/models';

@Component({
    selector: 'app-role-selection',
    standalone: true,
    imports: [CommonModule, CardComponent, ButtonComponent],
    templateUrl: './role-selection.component.html',
    styleUrl: './role-selection.component.scss'
})
export class RoleSelectionComponent {
    private router = inject(Router);
    private location = inject(Location);
    private authService = inject(AuthService);

    userData: any;
    password: any;

    selectedRole: UserRole | null = null;
    loading = false;

    constructor() {
        const state = this.location.getState() as any;
        if (state?.userData) {
            this.userData = state.userData;
            this.password = state.password;
        } else {
            // If no state (e.g. refresh), redirect back to register
            this.router.navigate(['/auth/register']);
        }
    }

    selectRole(role: UserRole) {
        this.selectedRole = role;
    }

    confirmRole() {
        if (!this.selectedRole || !this.userData) return;

        this.loading = true;

        // Here we actually register the user with the selected role
        const fullUserData = { ...this.userData, role: this.selectedRole };

        this.authService.register(fullUserData, this.password).subscribe({
            next: () => {
                // Redirection handled in service generally, but for onboarding details:
                if (this.selectedRole === 'manager') {
                    // In full app -> Gym setup
                    // For MVP -> Profile Setup / Dashboard directly
                    this.router.navigate(['/onboarding/profile-setup']);
                } else {
                    // In full app -> Athlete Join with code
                    this.router.navigate(['/onboarding/profile-setup']);
                }
            },
            error: (err) => {
                this.loading = false;
                alert('Errore durante la registrazione: ' + err.message);
            }
        });
    }
}
