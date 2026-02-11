import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models';

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
