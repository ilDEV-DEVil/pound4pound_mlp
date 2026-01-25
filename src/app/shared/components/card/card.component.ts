import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-accent]="accent">
      @if (title || headerTemplate) {
        <div class="card-header">
          @if (title) {
            <span class="card-title">{{ title }}</span>
          }
          <ng-content select="[card-header]"></ng-content>
        </div>
      }
      
      <div class="card-body" [class.no-padding]="noPadding">
        <ng-content></ng-content>
      </div>
      
      @if (footerTemplate) {
        <div class="card-footer">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    
    // Design Tokens (coerenti con schedule e dashboard)
    $brand-red: #E71D36;
    $brand-blue: #3066BE;
    $brand-red-glow: rgba(231, 29, 54, 0.2);
    $brand-blue-glow: rgba(48, 102, 190, 0.2);
    $text-dark: #1A1D21;
    $text-subtle: #4A5568;
    $border-light: rgba(0, 0, 0, 0.08);
    
    .card {
      background: white;
      border: 1px solid $border-light;
      border-radius: $radius-xl;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    }
    
    .card-hoverable {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        border-color: rgba(0, 0, 0, 0.12);
      }
    }
    
    .card-accent {
      border-left: 6px solid $brand-blue;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, $brand-red, $brand-blue);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &.card-hoverable:hover::before {
        opacity: 1;
      }
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $space-5 $space-6;
      border-bottom: 1px solid $border-light;
      background: rgba(0, 0, 0, 0.01);
    }
    
    .card-title {
      font-size: 11px;
      font-weight: $font-bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: $text-subtle;
    }
    
    .card-body {
      padding: $space-6;
      color: $text-dark;
      
      &.no-padding {
        padding: 0;
      }
    }
    
    .card-footer {
      padding: $space-4 $space-6;
      border-top: 1px solid $border-light;
      background: #f8fafc;
      font-size: $text-sm;
      color: $text-subtle;
    }
    
    // Varianti di colore per card speciali
    .card.card-blue {
      border-left-color: $brand-blue;
      
      &.card-hoverable:hover {
        box-shadow: 0 12px 24px $brand-blue-glow;
      }
    }
    
    .card.card-red {
      border-left-color: $brand-red;
      
      &.card-hoverable:hover {
        box-shadow: 0 12px 24px $brand-red-glow;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() title?: string;
  @Input() hoverable = false;
  @Input() accent = false;
  @Input() noPadding = false;

  // Template flags for conditional rendering
  @Input() headerTemplate = false;
  @Input() footerTemplate = false;
}
