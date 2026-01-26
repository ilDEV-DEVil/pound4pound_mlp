import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../../../core/services/member.service';
import { Member, Subscription } from '../../../core/models';
import { CardComponent, ButtonComponent } from '../../../shared/components';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class MemberDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private memberService = inject(MemberService);
  private storage = inject(StorageService);

  member = signal<Member | undefined>(undefined);
  activeSubscription = signal<Subscription | undefined>(undefined);

  // Analytics data (mock)
  monthlyAttendance = [
    { month: 'Gen', count: 8 },
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 10 },
    { month: 'Apr', count: 15 },
    { month: 'Mag', count: 11 },
    { month: 'Giu', count: 8 }
  ];

  weeklyDistribution = [
    { day: 'L', count: 5 },
    { day: 'M', count: 8 },
    { day: 'M', count: 6 },
    { day: 'G', count: 7 },
    { day: 'V', count: 9 },
    { day: 'S', count: 3 },
    { day: 'D', count: 0 }
  ];

  currentAttendance = 8;
  goalAttendance = 12;
  currentStreak = 5;
  bestStreak = 14;

  get maxAttendance(): number {
    return Math.max(...this.monthlyAttendance.map(m => m.count));
  }

  get maxWeekly(): number {
    return Math.max(...this.weeklyDistribution.map(d => d.count));
  }

  get attendancePercentage(): number {
    return Math.round((this.currentAttendance / this.goalAttendance) * 100);
  }

  get progressOffset(): number {
    const circumference = 2 * Math.PI * 50;
    const progress = this.attendancePercentage / 100;
    return circumference * (1 - progress);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMember(id);
      }
    });
  }

  loadMember(id: string) {
    this.memberService.getMemberById(id).subscribe(m => {
      this.member.set(m);
      if (m?.subscriptionId) {
        this.loadSubscription(m.subscriptionId);
      }
    });
  }

  loadSubscription(subId: string) {
    // Quick mock fetch for subscription details since we don't have a dedicated service exposed yet
    // In a real app, inject SubscriptionService
    const subs = this.storage.getItem<Subscription[]>('subscriptions') || [];
    const sub = subs.find(s => s.id === subId);
    this.activeSubscription.set(sub);
  }

  getInitials(member: Member): string {
    return (member.firstName[0] + member.lastName[0]).toUpperCase();
  }

  getExpiryDate(member: Member): Date {
    // Mock calculation: joinedAt + duration
    // In real app, this would be stored in a MemberSubscription join table or on Member
    if (!this.activeSubscription()) return new Date();
    const expiry = new Date(member.joinedAt);
    expiry.setMonth(expiry.getMonth() + (this.activeSubscription()?.durationMonths || 1));
    return expiry;
  }
}
