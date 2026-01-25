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
            <span class="logo-text">Pound for Pound</span>
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
            Dashboard
          </h1>
          <div class="top-actions">
            <button class="icon-btn">
              <span class="notification-badge">3</span>
              🔔
            </button>
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

    // Design Tokens (coerenti con l'intero sistema)
    $app-bg: #C7D6D5;
    $brand-red: #E71D36;
    $brand-blue: #3066BE;
    $brand-red-dark: #C0152B;
    $brand-blue-dark: #255198;
    $brand-red-glow: rgba(231, 29, 54, 0.2);
    $brand-blue-glow: rgba(48, 102, 190, 0.2);
    $text-dark: #1A1D21;
    $text-subtle: #4A5568;
    $border-light: rgba(0, 0, 0, 0.08);
    $sidebar-bg: rgba(255, 255, 255, 0.95);

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: $app-bg;
    }

    // Sidebar
    .sidebar {
      width: 280px;
      background: $sidebar-bg;
      backdrop-filter: blur(20px);
      border-right: 1px solid $border-light;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
      
      &-header {
        height: 80px;
        display: flex;
        align-items: center;
        padding: 0 $space-6;
        border-bottom: 1px solid $border-light;
        
        .logo {
          display: flex;
          align-items: center;
          gap: $space-3;
          font-weight: $font-bold;
          font-size: $text-xl;
          color: $text-dark;
          
          &-icon { 
            font-size: 32px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          }
          
          &-text {
            background: linear-gradient(135deg, $brand-red, $brand-blue);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      }
      
      &-nav {
        flex: 1;
        padding: $space-6 0;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
          width: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
      }
      
      &-footer {
        padding: $space-5;
        border-top: 1px solid $border-light;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $space-3;
        background: rgba(0, 0, 0, 0.01);
      }
    }

    // Navigation
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: $space-2;
      padding: 0 $space-4;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: $space-4;
      padding: $space-4 $space-5;
      border-radius: $radius-xl;
      color: $text-subtle;
      font-size: $text-base;
      font-weight: $font-medium;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 0;
        background: linear-gradient(180deg, $brand-red, $brand-blue);
        border-radius: 0 2px 2px 0;
        transition: height 0.3s;
      }
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: $text-dark;
        transform: translateX(4px);
        
        .icon {
          transform: scale(1.1);
        }
      }
      
      &.active {
        background: linear-gradient(135deg, 
          rgba($brand-blue, 0.1), 
          rgba($brand-red, 0.05)
        );
        color: $brand-blue;
        font-weight: $font-bold;
        box-shadow: 0 4px 12px rgba($brand-blue, 0.15);
        
        &::before {
          height: 70%;
        }
        
        .icon { 
          opacity: 1;
          transform: scale(1.15);
        }
      }
      
      .icon {
        font-size: 22px;
        opacity: 0.7;
        transition: all 0.3s;
        min-width: 24px;
        text-align: center;
      }
      
      .label {
        flex: 1;
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
        width: 44px;
        height: 44px;
        border-radius: $radius-full;
        background: linear-gradient(135deg, $brand-red, $brand-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: $font-bold;
        font-size: $text-base;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        gap: 2px;
        
        .user-name {
          font-size: $text-sm;
          font-weight: $font-bold;
          color: $text-dark;
          @include truncate;
        }
        
        .user-role {
          font-size: 11px;
          color: $text-subtle;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: $font-medium;
        }
      }
    }
    
    .logout-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-lg;
      color: $text-subtle;
      transition: all 0.3s;
      border: 1px solid transparent;
      
      .icon {
        font-size: 20px;
      }
      
      &:hover {
        background-color: rgba($brand-red, 0.1);
        color: $brand-red;
        border-color: rgba($brand-red, 0.2);
        transform: translateX(-2px);
      }
    }

    // Main Content
    .main-content {
      flex: 1;
      margin-left: 280px; // Sidebar width
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    
    .top-bar {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 $space-8;
      border-bottom: 1px solid $border-light;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
      
      .page-title {
        font-size: $text-2xl;
        font-weight: $font-bold;
        color: $text-dark;
        margin: 0;
      }
      
      .top-actions {
        display: flex;
        gap: $space-3;
      }
    }
    
    .content-wrapper {
      flex: 1;
      padding: 0; // Padding gestito dai singoli componenti
      min-height: calc(100vh - 80px);
    }
    
    .icon-btn {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $radius-full;
      color: $text-subtle;
      font-size: 22px;
      transition: all 0.3s;
      border: 2px solid transparent;
      background: white;
      position: relative;
      
      .notification-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 18px;
        height: 18px;
        background: $brand-red;
        color: white;
        border-radius: $radius-full;
        font-size: 10px;
        font-weight: $font-bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px $brand-red-glow;
        animation: pulse 2s infinite;
      }
      
      &:hover {
        background: rgba($brand-blue, 0.1);
        color: $brand-blue;
        border-color: rgba($brand-blue, 0.2);
        transform: scale(1.05);
      }
    }
    
    // Animations
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
    
    // Responsive
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &.open {
          transform: translateX(0);
        }
      }
      
      .main-content {
        margin-left: 0;
      }
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        
        &-header {
          height: 64px;
        }
      }
      
      .top-bar {
        height: 64px;
        padding: 0 $space-4;
        
        .page-title {
          font-size: $text-xl;
        }
      }
      
      .content-wrapper {
        min-height: calc(100vh - 64px);
      }
      
      .icon-btn {
        width: 40px;
        height: 40px;
        font-size: 20px;
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
