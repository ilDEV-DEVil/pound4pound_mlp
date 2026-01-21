import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components';

type SettingsTab = 'profile' | 'app' | 'security';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, InputComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    activeTab = signal<SettingsTab>('profile');

    // Profile Form Data
    profileData = signal({
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 333 1234567',
        bio: 'Appassionato di Boxe e MMA.'
    });

    // App Settings Data
    appSettings = signal({
        darkMode: true,
        notifications: true,
        emailUpdates: false,
        publicProfile: true
    });

    // Security Data
    securityData = signal({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    isLoading = false;

    setActiveTab(tab: SettingsTab) {
        this.activeTab.set(tab);
    }

    saveProfile() {
        this.isLoading = true;
        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            alert('Profilo aggiornato con successo!');
        }, 1000);
    }

    saveAppSettings() {
        this.isLoading = true;
        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            alert('Preferenze salvate!');
        }, 800);
    }

    updatePassword() {
        if (this.securityData().newPassword !== this.securityData().confirmPassword) {
            alert('Le password non coincidono!');
            return;
        }

        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            this.securityData.update(d => ({ ...d, currentPassword: '', newPassword: '', confirmPassword: '' }));
            alert('Password aggiornata correttamente.');
        }, 1000);
    }

    logout() {
        alert('Logout effettuato (simulato)');
    }
}
