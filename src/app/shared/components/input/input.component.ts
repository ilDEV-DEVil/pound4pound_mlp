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
    
    // Design Tokens (coerenti con l'intero sistema)
    $brand-red: #E71D36;
    $brand-blue: #3066BE;
    $brand-blue-dark: #255198;
    $brand-blue-glow: rgba(48, 102, 190, 0.2);
    $text-dark: #1A1D21;
    $text-subtle: #4A5568;
    $border-light: rgba(0, 0, 0, 0.08);
    
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: $space-2;
    }
    
    .input-label {
      font-size: 11px;
      font-weight: $font-bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: $text-subtle;
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-field {
      width: 100%;
      padding: $space-3 $space-4;
      background: white;
      border: 2px solid $border-light;
      border-radius: $radius-xl;
      color: $text-dark;
      font-size: $text-base;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      
      &::placeholder {
        color: $text-subtle;
        opacity: 0.5;
      }
      
      &:hover:not(:disabled) {
        border-color: rgba(0, 0, 0, 0.15);
      }
      
      &:focus {
        border-color: $brand-blue;
        box-shadow: 0 0 0 3px $brand-blue-glow;
        background: white;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.02);
      }
      
      &:readonly {
        background: rgba(0, 0, 0, 0.02);
        cursor: default;
      }
    }
    
    .has-error .input-field {
      border-color: $brand-red;
      
      &:focus {
        border-color: $brand-red;
        box-shadow: 0 0 0 3px rgba($brand-red, 0.15);
      }
    }
    
    .toggle-password {
      position: absolute;
      right: $space-3;
      padding: $space-2;
      color: $text-subtle;
      transition: all 0.2s;
      border-radius: $radius-lg;
      
      &:hover {
        color: $brand-blue;
        background: rgba($brand-blue, 0.1);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      svg {
        width: 20px;
        height: 20px;
        display: block;
      }
    }
    
    .input-error {
      font-size: $text-xs;
      color: $brand-red;
      font-weight: $font-medium;
      display: flex;
      align-items: center;
      gap: $space-1;
      
      &::before {
        content: '⚠';
        font-size: 14px;
      }
    }
    
    .input-hint {
      font-size: $text-xs;
      color: $text-subtle;
      font-weight: $font-medium;
    }
    
    // Input variants per type specifici
    input[type="search"] {
      padding-left: $space-10;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: $space-3 center;
    }
    
    input[type="date"] {
      &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
        
        &:hover {
          opacity: 1;
        }
      }
    }
    
    input[type="number"] {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        opacity: 0.6;
        
        &:hover {
          opacity: 1;
        }
      }
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
