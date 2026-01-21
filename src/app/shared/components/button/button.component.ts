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
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: $space-2;
      font-weight: $font-semibold;
      border-radius: $radius-md;
      transition: all $transition-normal;
      cursor: pointer;
      border: none;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &:focus-visible {
        outline: 2px solid $accent-primary;
        outline-offset: 2px;
      }
    }
    
    // Sizes
    .btn-sm {
      padding: $space-2 $space-3;
      font-size: $text-xs;
    }
    
    .btn-md {
      padding: $space-3 $space-6;
      font-size: $text-sm;
    }
    
    .btn-lg {
      padding: $space-4 $space-8;
      font-size: $text-base;
    }
    
    // Variants
    .btn-primary {
      background: $accent-primary;
      color: $bg-primary;
      
      &:hover:not(:disabled) {
        background: $accent-hover;
      }
    }
    
    .btn-secondary {
      background: transparent;
      border: 1px solid $border-default;
      color: $text-primary;
      
      &:hover:not(:disabled) {
        background: $bg-tertiary;
        border-color: $border-strong;
      }
    }
    
    .btn-ghost {
      background: transparent;
      color: $accent-primary;
      
      &:hover:not(:disabled) {
        background: $accent-subtle;
      }
    }
    
    .btn-danger {
      background: $error;
      color: $text-primary;
      
      &:hover:not(:disabled) {
        background: darken($error, 10%);
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
