import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent } from '../../shared/components';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Subscription } from '../../core/models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  private subService = inject(SubscriptionService);
  private fb = inject(FormBuilder);

  subscriptions = signal<Subscription[]>([]);
  isCreating = signal(false);
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    durationMonths: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    isLimited: [false],
    maxEntries: [10]
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.subService.getSubscriptions().subscribe(subs => {
      this.subscriptions.set(subs);
    });
  }

  openCreateMode() {
    this.isCreating.set(true);
    this.form.reset({
      price: 50,
      durationMonths: 1,
      isLimited: false,
      maxEntries: 10
    });
  }

  cancelCreate() {
    this.isCreating.set(false);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const newSub: Partial<Subscription> = {
      name: val.name!,
      price: val.price!,
      durationMonths: val.durationMonths!,
      description: val.description || '',
      maxEntries: val.isLimited ? val.maxEntries! : undefined
    };

    this.subService.createSubscription(newSub).subscribe({
      next: () => {
        this.loading = false;
        this.isCreating.set(false);
        this.refresh();
      },
      error: () => this.loading = false
    });
  }

  deleteSub(id: string) {
    if (confirm('Sei sicuro di voler eliminare questo piano?')) {
      this.subService.deleteSubscription(id).subscribe(() => this.refresh());
    }
  }

  getError(control: string): string | undefined {
    return this.form.get(control)?.errors ? 'Campo non valido' : undefined;
  }

  // Mock functions for stats (da sostituire con dati reali)
  getActiveMembers(subId: string): number {
    // In un'app reale, questo verrebbe dal backend
    return Math.floor(Math.random() * 50) + 5;
  }

  getMonthlyRevenue(subId: string): number {
    const sub = this.subscriptions().find(s => s.id === subId);
    if (!sub) return 0;
    const members = this.getActiveMembers(subId);
    return (sub.price / sub.durationMonths) * members;
  }
}
