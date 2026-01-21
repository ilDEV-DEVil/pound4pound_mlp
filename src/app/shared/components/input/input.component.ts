import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'date';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-wrapper" [class.has-error]="error" [class.disabled]="disabled">
      @if (label) {
        <label [for]="inputId" class="input-label">{{ label }}</label>
      }
      
      <div class="input-container">
        <input
          [id]="inputId"
          [type]="currentType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          (blur)="onTouched()"
          class="input-field"
        />
        
        @if (type === 'password') {
          <button 
            type="button" 
            class="toggle-password"
            (click)="togglePasswordVisibility()"
            tabindex="-1"
          >
            @if (showPassword) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            }
          </button>
        }
      </div>
      
      @if (error) {
        <span class="input-error">{{ error }}</span>
      }
      
      @if (hint && !error) {
        <span class="input-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: $space-2;
    }
    
    .input-label {
      font-size: $text-sm;
      font-weight: $font-medium;
      color: $text-secondary;
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-field {
      width: 100%;
      padding: $space-3 $space-4;
      background: $bg-tertiary;
      border: 1px solid $border-default;
      border-radius: $radius-md;
      color: $text-primary;
      font-size: $text-base;
      transition: all $transition-fast;
      
      &::placeholder {
        color: $text-muted;
      }
      
      &:focus {
        outline: none;
        border-color: $accent-primary;
        background: $bg-secondary;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .has-error .input-field {
      border-color: $error;
      
      &:focus {
        border-color: $error;
      }
    }
    
    .toggle-password {
      position: absolute;
      right: $space-3;
      padding: $space-1;
      color: $text-muted;
      transition: color $transition-fast;
      
      &:hover {
        color: $text-primary;
      }
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .input-error {
      font-size: $text-xs;
      color: $error;
    }
    
    .input-hint {
      font-size: $text-xs;
      color: $text-muted;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  value = '';
  showPassword = false;

  private onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  get currentType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
