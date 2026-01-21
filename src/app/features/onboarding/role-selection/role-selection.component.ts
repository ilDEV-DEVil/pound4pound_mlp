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
    template: `
    <div class="role-selection-container">
      <div class="mb-8 text-center">
        <h2 class="h2 mb-2">Benvenuto, {{ userData?.firstName }}!</h2>
        <p class="text-muted">Per iniziare, dicci come userai Pound for Pound.</p>
        <p class="text-xs text-warning mt-2">⚠ Questa scelta non potrà essere modificata successivamente.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Manager Card -->
        <div 
          class="role-card" 
          [class.selected]="selectedRole === 'manager'"
          (click)="selectRole('manager')"
        >
          <div class="role-icon">🏢</div>
          <h3 class="role-title">Gestore Palestra</h3>
          <p class="role-desc">
            Voglio gestire la mia palestra, i miei corsi e i miei iscritti.
          </p>
          <div class="selection-indicator"></div>
        </div>

        <!-- Athlete Card -->
        <div 
          class="role-card" 
          [class.selected]="selectedRole === 'athlete'"
          (click)="selectRole('athlete')"
        >
          <div class="role-icon">🥊</div>
          <h3 class="role-title">Atleta</h3>
          <p class="role-desc">
            Voglio iscrivermi ai corsi e monitorare i miei progressi.
          </p>
          <div class="selection-indicator"></div>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <app-button 
          [disabled]="!selectedRole" 
          [loading]="loading"
          (clicked)="confirmRole()"
          size="lg"
          class="min-w-[200px]"
        >
          Continua
        </app-button>
      </div>
    </div>
  `,
    styles: [`
    @use '../../../../styles/variables' as *;

    .role-selection-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .role-card {
      background: $bg-secondary;
      border: 2px solid $border-subtle;
      border-radius: $radius-lg;
      padding: $space-6;
      cursor: pointer;
      transition: all $transition-normal;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      &:hover {
        border-color: $border-default;
        transform: translateY(-2px);
      }
      
      &.selected {
        border-color: $accent-primary;
        background: rgba($accent-primary, 0.05);
        
        .role-icon {
          transform: scale(1.1);
        }
        
        .selection-indicator {
          background-color: $accent-primary;
          border-color: $accent-primary;
          
          &::after {
            content: '✓';
            color: $bg-primary;
            font-size: 14px;
            font-weight: bold;
          }
        }
      }
    }

    .role-icon {
      font-size: 48px;
      margin-bottom: $space-4;
      transition: transform $transition-normal;
    }

    .role-title {
      font-size: $text-lg;
      font-weight: $font-bold;
      margin-bottom: $space-2;
      color: $text-primary;
    }

    .role-desc {
      font-size: $text-sm;
      color: $text-muted;
      line-height: 1.5;
    }

    .selection-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid $border-default;
      margin-top: $space-4;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all $transition-fast;
    }
  `]
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
