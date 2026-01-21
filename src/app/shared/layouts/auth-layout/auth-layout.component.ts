import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <header class="auth-header">
          <div class="logo">
            <span class="logo-icon">🥊</span>
            <span class="logo-text">POUND FOR POUND</span>
          </div>
        </header>

        <main class="auth-content">
          <router-outlet></router-outlet>
        </main>

        <footer class="auth-footer">
          <p>© 2026 Pound for Pound. All rights reserved.</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    @use '../../../../styles/mixins' as *;

    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $bg-primary;
      padding: $space-4;
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: $space-8;
    }

    .auth-header {
      text-align: center;
      
      .logo {
        display: inline-flex;
        align-items: center;
        gap: $space-2;
        
        &-icon {
          font-size: $text-3xl;
        }
        
        &-text {
          font-family: 'Inter', sans-serif;
          font-weight: $font-bold;
          font-size: $text-xl;
          letter-spacing: 1px;
          color: $text-primary;
        }
      }
    }

    .auth-footer {
      text-align: center;
      
      p {
        font-size: $text-xs;
        color: $text-muted;
      }
    }
  `]
})
export class AuthLayoutComponent { }
