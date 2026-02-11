import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppNotification } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  isNotificationsOpen = signal(false);
  isUserMenuOpen = signal(false);

  notificationService = inject(NotificationService);
  notifications = this.notificationService.allNotifications;
  unreadCount = this.notificationService.unreadCount;

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

  toggleNotifications() {
    if (!this.isNotificationsOpen()) {
      this.isUserMenuOpen.set(false);
    }
    this.isNotificationsOpen.update(v => !v);
  }

  toggleUserMenu() {
    if (!this.isUserMenuOpen()) {
      this.isNotificationsOpen.set(false);
    }
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Check if the click occurred outside the trigger buttons and the dropdowns themselves
    const isClickInsideActions = target.closest('.header-actions') || target.closest('.mobile-actions');
    const isClickInsideNotifDropdown = target.closest('.notif-dropdown');
    const isClickInsideUserDropdown = target.closest('.user-dropdown');

    if (!isClickInsideActions && !isClickInsideNotifDropdown && !isClickInsideUserDropdown) {
      this.isNotificationsOpen.set(false);
      this.isUserMenuOpen.set(false);
    }
  }

  markAsRead(notification: AppNotification) {
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notification: AppNotification) {
    this.notificationService.deleteNotification(notification.id);
  }

  logout() {
    this.authService.logout();
  }
}
