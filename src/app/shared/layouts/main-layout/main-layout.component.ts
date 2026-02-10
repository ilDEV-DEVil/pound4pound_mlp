import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'U';
    return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  });

  menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/app/dashboard',
      description: 'Panoramica generale'
    },
    {
      icon: '👥',
      label: 'Iscritti',
      route: '/app/members',
      description: 'Gestione membri'
    },
    {
      icon: '🥊',
      label: 'Corsi',
      route: '/app/courses',
      description: 'Corsi disponibili'
    },
    {
      icon: '🥋',
      label: 'Maestri',
      route: '/app/instructors',
      description: 'Gestione team'
    },
    {
      icon: '📅',
      label: 'Calendario',
      route: '/app/schedule',
      description: 'Pianificazione lezioni'
    },
    {
      icon: '💳',
      label: 'Abbonamenti',
      route: '/app/subscriptions',
      description: 'Piani e prezzi'
    },
    {
      icon: '⚙️',
      label: 'Impostazioni',
      route: '/app/settings',
      description: 'Configurazione'
    }
  ];

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
