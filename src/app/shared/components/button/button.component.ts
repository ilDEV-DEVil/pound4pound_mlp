import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    
    // Design Tokens (coerenti con l'intero sistema)
    $brand-red: #E71D36;
    $brand-blue: #3066BE;
    $brand-blue-dark: #255198;
    $brand-blue-glow: rgba(48, 102, 190, 0.2);
    $text-dark: #1A1D21;
    $text-subtle: #4A5568;
    $border-light: rgba(0, 0, 0, 0.08);
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: $space-2;
      font-weight: $font-bold;
      border-radius: $radius-xl;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      &:active::before {
        width: 300px;
        height: 300px;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      
      &:focus-visible {
        outline: 3px solid $brand-blue-glow;
        outline-offset: 2px;
      }
    }
    
    // Sizes
    .btn-sm {
      padding: $space-2 $space-4;
      font-size: $text-sm;
      border-radius: $radius-lg;
    }
    
    .btn-md {
      padding: $space-3 $space-6;
      font-size: $text-base;
    }
    
    .btn-lg {
      padding: $space-4 $space-8;
      font-size: $text-lg;
      border-radius: $radius-2xl;
    }
    
    // Variants
    .btn-primary {
      background: $brand-blue;
      color: white;
      box-shadow: 0 6px 15px $brand-blue-glow;
      
      &:hover:not(:disabled) {
        background: $brand-blue-dark;
        box-shadow: 0 10px 25px rgba($brand-blue, 0.35);
        transform: translateY(-2px);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }
    
    .btn-secondary {
      background: white;
      border: 2px solid $border-light;
      color: $text-dark;
      
      &:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.02);
        border-color: $brand-blue;
        color: $brand-blue;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }
    
    .btn-ghost {
      background: transparent;
      color: $brand-blue;
      
      &:hover:not(:disabled) {
        background: rgba($brand-blue, 0.1);
        transform: translateY(-1px);
      }
      
      &:active:not(:disabled) {
        background: rgba($brand-blue, 0.15);
        transform: translateY(0);
      }
    }
    
    .btn-danger {
      background: $brand-red;
      color: white;
      box-shadow: 0 6px 15px rgba($brand-red, 0.25);
      
      &:hover:not(:disabled) {
        background: darken($brand-red, 8%);
        box-shadow: 0 10px 25px rgba($brand-red, 0.35);
        transform: translateY(-2px);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }
    
    .btn-full-width {
      width: 100%;
    }
    
    // Spinner
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      `btn-${this.variant}`,
      `btn-${this.size}`
    ];

    if (this.fullWidth) {
      classes.push('btn-full-width');
    }

    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
