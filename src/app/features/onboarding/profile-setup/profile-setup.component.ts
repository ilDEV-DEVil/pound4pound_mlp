import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent } from '../../../shared/components';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="profile-setup-container max-w-md mx-auto">
      <app-card [hoverable]="false" [headerTemplate]="true">
        <div card-header>
          <h2 class="h3 text-center mb-2">Setup Profilo</h2>
          <p class="text-muted text-center text-sm">Completa le tue informazioni</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex justify-center mb-4">
             <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl cursor-not-allowed opacity-70" title="Upload non disponibile in MVP">
               📷
             </div>
          </div>
          
          <app-input
            label="Telefono (opzionale)"
            type="tel"
            formControlName="phone"
          ></app-input>

          <app-input
            label="Data di Nascita (opzionale)"
            type="date"
            formControlName="birthDate"
          ></app-input>

          @if (currentUser()?.role === 'athlete') {
            <div class="border-t border-gray-700 pt-4 mt-2">
              <h4 class="text-sm font-bold mb-3 text-accent">Codice Invito Palestra</h4>
              <app-input
                placeholder="Es: FCM2024"
                formControlName="inviteCode"
                hint="Chiedi il codice al tuo istruttore"
              ></app-input>
            </div>
          }

          <div class="mt-4">
            <app-button 
              type="submit" 
              [loading]="loading" 
              [fullWidth]="true"
            >
              Completa Setup
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `
})
export class ProfileSetupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  loading = false;

  profileForm = this.fb.group({
    phone: [''],
    birthDate: [''],
    inviteCode: ['']
  });

  onSubmit() {
    this.loading = true;

    // Simulate API call to update profile
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/app/dashboard']);
    }, 1000);
  }
}
