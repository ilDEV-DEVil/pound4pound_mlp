import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🥊</span>
            <span class="logo-text">P4P</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            @for (item of navItems(); track item.path) {
              <li class="nav-item">
                <a 
                  [routerLink]="item.path" 
                  routerLinkActive="active" 
                  class="nav-link"
                >
                  <span class="icon">{{ item.icon }}</span>
                  <span class="label">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="avatar">
              {{ userInitials() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser()?.firstName }}</span>
              <span class="user-role">{{ currentUser()?.role === 'manager' ? 'Gestore' : 'Atleta' }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="icon">🚪</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <h1 class="page-title">
            <!-- Title logic could be dynamic based on route data or service -->
            Dashboard
          </h1>
          <div class="top-actions">
            <button class="icon-btn">🔔</button>
          </div>
        </header>

        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    @use '../../../../styles/mixins' as *;

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: $bg-primary;
    }

    // Sidebar
    .sidebar {
      width: 260px;
      background-color: $bg-secondary;
      border-right: 1px solid $border-subtle;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: $z-fixed;
      
      &-header {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 $space-6;
        border-bottom: 1px solid $border-subtle;
        
        .logo {
          display: flex;
          align-items: center;
          gap: $space-3;
          font-weight: $font-bold;
          font-size: $text-lg;
          
          &-icon { font-size: 24px; }
        }
      }
      
      &-nav {
        flex: 1;
        padding: $space-6 0;
        overflow-y: auto;
      }
      
      &-footer {
        padding: $space-4;
        border-top: 1px solid $border-subtle;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $space-2;
      }
    }

    // Navigation
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: $space-1;
      padding: 0 $space-3;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: $space-3;
      padding: $space-3 $space-4;
      border-radius: $radius-md;
      color: $text-muted;
      font-size: $text-sm;
      font-weight: $font-medium;
      transition: all $transition-fast;
      
      &:hover {
        background-color: $bg-tertiary;
        color: $text-primary;
      }
      
      &.active {
        background-color: rgba($accent-primary, 0.15);
        color: $accent-primary;
        
        .icon { opacity: 1; }
      }
      
      .icon {
        font-size: 18px;
        opacity: 0.7;
      }
    }

    // User Profile in Sidebar
    .user-profile {
      display: flex;
      align-items: center;
      gap: $space-3;
      flex: 1;
      overflow: hidden;
      
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: $accent-primary;
        color: $bg-primary;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: $font-bold;
        font-size: $text-sm;
        flex-shrink: 0;
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
        .user-name {
          font-size: $text-sm;
          font-weight: $font-medium;
          color: $text-primary;
          @include truncate;
        }
        
        .user-role {
          font-size: $text-xs;
          color: $text-muted;
        }
      }
    }
    
    .logout-btn {
      padding: $space-2;
      border-radius: $radius-md;
      color: $text-muted;
      transition: all $transition-fast;
      
      &:hover {
        background-color: $bg-tertiary;
        color: $error;
      }
    }

    // Main Content
    .main-content {
      flex: 1;
      margin-left: 260px; // Sidebar width
      min-width: 0;
    }
    
    .top-bar {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 $space-8;
      border-bottom: 1px solid $border-subtle;
      background-color: $bg-primary;
      position: sticky;
      top: 0;
      z-index: $z-sticky;
      
      .page-title {
        font-size: $text-lg;
        font-weight: $font-semibold;
      }
    }
    
    .content-wrapper {
      padding: $space-8;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .icon-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: $text-muted;
      transition: all $transition-fast;
      
      &:hover {
        background-color: $bg-secondary;
        color: $text-primary;
      }
    }
    
    // Responsive
    @media (max-width: $breakpoint-md) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform $transition-normal;
        
        &.open {
          transform: translateX(0);
        }
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .content-wrapper {
        padding: $space-4;
      }
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  });

  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    if (user.role === 'manager') {
      return [
        { label: 'Dashboard', path: '/app/dashboard', icon: '📊' },
        { label: 'Iscritti', path: '/app/members', icon: '👥' },
        { label: 'Abbonamenti', path: '/app/subscriptions', icon: '💳' },
        { label: 'Corsi', path: '/app/courses', icon: '🥊' },
        { label: 'Calendario', path: '/app/schedule', icon: '📅' },
        { label: 'Impostazioni', path: '/app/settings', icon: '⚙️' },
      ];
    } else {
      return [
        { label: 'Home', path: '/app/dashboard', icon: '🏠' },
        { label: 'Orari', path: '/app/schedule', icon: '📅' },
        { label: 'Il mio Profilo', path: '/app/profile', icon: '👤' },
        { label: 'La mia Palestra', path: '/app/gym', icon: '🏢' },
      ];
    }
  });

  logout() {
    this.authService.logout();
  }
}
