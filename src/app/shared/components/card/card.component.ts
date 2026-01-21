import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-hoverable]="hoverable" [class.card-accent]="accent">
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
    
    .card {
      background: $bg-secondary;
      border: 1px solid $border-subtle;
      border-radius: $radius-lg;
      overflow: hidden;
    }
    
    .card-hoverable {
      transition: all $transition-normal;
      cursor: pointer;
      
      &:hover {
        border-color: $border-default;
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }
    }
    
    .card-accent {
      border-left: 3px solid $accent-primary;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $space-4 $space-6;
      border-bottom: 1px solid $border-subtle;
    }
    
    .card-title {
      font-size: $text-xs;
      font-weight: $font-medium;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: $text-muted;
    }
    
    .card-body {
      padding: $space-6;
      
      &.no-padding {
        padding: 0;
      }
    }
    
    .card-footer {
      padding: $space-4 $space-6;
      border-top: 1px solid $border-subtle;
      background: rgba($bg-tertiary, 0.5);
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
