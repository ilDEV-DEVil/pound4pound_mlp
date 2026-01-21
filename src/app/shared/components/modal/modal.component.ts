import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Modal Content -->
        <div class="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <h3 class="text-xl font-bold text-white">{{ title }}</h3>
            <button (click)="onClose()" class="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div class="p-4 bg-gray-800/50 border-t border-gray-800 flex justify-end gap-3">
            @if (cancelLabel) {
              <app-button variant="ghost" (click)="onClose()">
                {{ cancelLabel }}
              </app-button>
            }
            @if (confirmLabel) {
              <app-button (click)="onConfirm()" [loading]="loading">
                {{ confirmLabel }}
              </app-button>
            }
          </div>
        </div>
      </div>
    }
  `
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
