import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent, InputComponent, CardComponent } from '../../../shared/components';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <app-card [hoverable]="false" [headerTemplate]="true" [footerTemplate]="true">
      <div card-header>
        <h2 class="h3 text-center mb-2">Crea Account</h2>
        <p class="text-muted text-center text-sm">Unisciti alla community di Pound for Pound</p>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <div class="flex gap-4">
          <app-input
            label="Nome"
            formControlName="firstName"
            [error]="getError('firstName')"
            class="flex-1"
          ></app-input>
          
          <app-input
            label="Cognome"
            formControlName="lastName"
            [error]="getError('lastName')"
            class="flex-1"
          ></app-input>
        </div>

        <app-input
          label="Email"
          type="email"
          placeholder="nome@esempio.com"
          formControlName="email"
          [error]="getError('email')"
        ></app-input>

        <app-input
          label="Password"
          type="password"
          placeholder="••••••••"
          formControlName="password"
          [error]="getError('password')"
          hint="Minimo 8 caratteri"
        ></app-input>

        <app-input
          label="Conferma Password"
          type="password"
          placeholder="••••••••"
          formControlName="confirmPassword"
          [error]="getError('confirmPassword')"
        ></app-input>

        @if (errorMessage) {
          <div class="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm text-center">
            {{ errorMessage }}
          </div>
        }

        <div class="mt-2">
          <app-button 
            type="submit" 
            [loading]="loading" 
            [disabled]="registerForm.invalid" 
            [fullWidth]="true"
          >
            Continua
          </app-button>
        </div>
      </form>

      <div card-footer class="text-center">
        <span class="text-sm text-muted">Hai già un account? </span>
        <a routerLink="/auth/login" class="text-sm font-medium hover:underline">Accedi</a>
      </div>
    </app-card>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  loading = false;
  errorMessage = '';

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { mismatch: true };
  }

  getError(controlName: string): string | undefined {
    const control = this.registerForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo obbligatorio';
      if (control.errors['email']) return 'Email non valida';
      if (control.errors['minlength']) return 'Password troppo corta';
      if (control.errors['mismatch']) return 'Le password non coincidono';
    }
    // Check group level errors for confirmPassword
    if (controlName === 'confirmPassword' && this.registerForm.errors?.['mismatch'] && control?.touched) {
      return 'Le password non coincidono';
    }
    return undefined;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { firstName, lastName, email, password } = this.registerForm.value;

      // Store temp data in session or pass via state to next step (Role Selection)
      // Since for MVP we don't have a backend session yet, we'll pass via navigation state

      this.router.navigate(['/onboarding/role-selection'], {
        state: {
          userData: { firstName, lastName, email },
          password // In real app, never pass password like this, handle securely
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
