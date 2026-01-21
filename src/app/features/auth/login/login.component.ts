import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

import { ButtonComponent, InputComponent, CardComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
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
        <h2 class="h3 text-center mb-2">Bentornato</h2>
        <p class="text-muted text-center text-sm">Inserisci le tue credenziali per accedere</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <app-input
          label="Email"
          type="email"
          placeholder="nome@esempio.com"
          formControlName="email"
          [error]="getError('email')"
        ></app-input>

        <div class="flex flex-col gap-1">
          <app-input
            label="Password"
            type="password"
            placeholder="••••••••"
            formControlName="password"
            [error]="getError('password')"
          ></app-input>
          <div class="flex justify-end">
            <a routerLink="/auth/forgot-password" class="text-xs text-muted hover:text-primary">
              Password dimenticata?
            </a>
          </div>
        </div>

        @if (errorMessage) {
          <div class="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm text-center">
            {{ errorMessage }}
          </div>
        }

        <div class="mt-2">
          <app-button 
            type="submit" 
            [loading]="loading" 
            [disabled]="loginForm.invalid" 
            [fullWidth]="true"
          >
            Accedi
          </app-button>
        </div>
      </form>

      <div card-footer class="text-center">
        <span class="text-sm text-muted">Non hai un account? </span>
        <a routerLink="/auth/register" class="text-sm font-medium hover:underline">Registrati</a>
      </div>
    </app-card>

    <div class="mt-8 p-4 border border-dashed border-gray-700 rounded-lg bg-gray-900/50">
      <p class="text-xs text-muted font-mono mb-2 text-center">DEMO CREDENTIALS</p>
      <div class="grid grid-cols-2 gap-4 text-xs text-gray-400">
        <div>
          <span class="block font-bold text-accent">Gestore:</span>
          marco@fightclub.it
        </div>
        <div class="text-right">
          <span class="block font-bold text-accent">Atleta:</span>
          luca@gmail.com
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMessage = '';

  getError(controlName: string): string | undefined {
    const control = this.loginForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo obbligatorio';
      if (control.errors['email']) return 'Email non valida';
      if (control.errors['minlength']) return 'La password deve avere almeno 6 caratteri';
    }
    return undefined;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email!, password!).subscribe({
        next: () => {
          // Redirect handled in service
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Credenziali non valide';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
