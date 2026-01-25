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
  templateUrl: './profile-setup.component.html'
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
