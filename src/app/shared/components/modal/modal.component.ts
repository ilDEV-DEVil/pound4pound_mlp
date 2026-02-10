import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen) {
      <div class="modal-overlay-container">
        <!-- Backdrop -->
        <div 
          class="modal-backdrop"
          (click)="onClose()"
        ></div>

        <!-- Modal Content -->
        <div class="modal-content animate-in">
          
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button (click)="onClose()" class="close-button">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            @if (cancelLabel) {
              <app-button variant="ghost" (clicked)="onClose()">
                {{ cancelLabel }}
              </app-button>
            }
            @if (confirmLabel) {
              <app-button (clicked)="onConfirm()" [loading]="loading">
                {{ confirmLabel }}
              </app-button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .modal-overlay-container {
      position: fixed;
      inset: 0;
      z-index: $z-modal;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $space-4;
    }

    .modal-backdrop {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      transition: opacity $transition-normal;
    }

    .modal-content {
      position: relative;
      background-color: white; // $bg-secondary sometimes too dark, using white for modal
      border: 1px solid $border-default;
      border-radius: $radius-lg;
      box-shadow: $shadow-xl;
      width: 100%;
      max-width: 28rem; // max-w-md
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: $space-4;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f9fafb; // light gray
    }

    .modal-title {
      font-size: $text-xl;
      font-weight: $font-bold;
      color: $text-primary;
      margin: 0;
      color: #111827; // text-gray-900
    }

    .close-button {
      background: transparent;
      border: none;
      color: $text-muted;
      cursor: pointer;
      font-size: $text-lg;
      padding: $space-1;
      line-height: 1;
      transition: color $transition-fast;

      &:hover {
        color: $text-primary;
      }
    }

    .modal-body {
      padding: $space-6;
    }

    .modal-footer {
      padding: $space-4;
      background-color: #f9fafb;
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
      justify-content: flex-end;
      gap: $space-3;
    }

    .animate-in {
      animation: fadeInZoom 0.2s ease-out;
    }

    @keyframes fadeInZoom {
      from { 
        opacity: 0; 
        transform: scale(0.95);
      }
      to { 
        opacity: 1; 
        transform: scale(1);
      }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() confirmLabel = '';
  @Input() cancelLabel = 'Annulla';
  @Input() loading = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
