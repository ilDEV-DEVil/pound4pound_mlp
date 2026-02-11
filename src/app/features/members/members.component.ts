import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent, ModalComponent } from '../../shared/components';
import { SubscriptionService } from '../../core/services/subscription.service';
import { MemberService } from '../../core/services/member.service';
import { Member, Subscription } from '../../core/models';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  // State
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'expiring' | 'expired' = 'all';
  isModalOpen = signal(false);
  isSubmitting = signal(false);

  // Data
  allMembers = signal<Member[]>([]);
  filteredMembers = signal<Member[]>([]);
  subscriptions = signal<Subscription[]>([]);

  // Form
  memberForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  constructor() {
    this.refresh();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'add') {
        this.openAddModal();
        // Clear query params to prevent reopening if the user refreshes
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  refresh() {
    this.subscriptionService.getSubscriptions().subscribe(subs => {
      this.subscriptions.set(subs);
      // Fetch members after subscriptions are loaded to calculate status correctly if needed immediately
      this.memberService.getMembers().subscribe(members => {
        this.allMembers.set(members);
        this.filterMembers();
      });
    });
  }

  filterMembers() {
    let result = this.allMembers();

    // Text search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      result = result.filter(m => {
        const status = this.getSubscriptionStatus(m);
        if (this.filterStatus === 'active') return status === 'active';
        if (this.filterStatus === 'expiring') return status === 'expiring';
        // 'expired' filter should probably catch both 'expired' and 'inactive' or just 'expired'?
        // The user request implies distinct sections. Let's map 'expired' tab to 'expired' status.
        // And 'inactive' might be its own thing or grouped. 
        // Usually expired tab catches old subscriptions.
        // Let's assume filter 'expired' catches 'expired' AND 'inactive' for now, or just 'expired'.
        // Based on "sezione in scadenza prima della sezione scaduti", let's be precise.
        if (this.filterStatus === 'expired') return status === 'expired' || status === 'inactive';
        return true;
      });
    }

    this.filteredMembers.set(result);
  }

  setFilter(status: 'all' | 'active' | 'expiring' | 'expired') {
    this.filterStatus = status;
    this.filterMembers();
  }

  getInitials(member: Member): string {
    return (member.firstName[0] + member.lastName[0]).toUpperCase();
  }

  goToDetail(member: Member) {
    this.router.navigate(['/app/members', member.id]);
  }

  openAddModal() {
    this.memberForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onAddMember() {
    if (this.memberForm.invalid) return;

    this.isSubmitting.set(true);
    const memberData = this.memberForm.value as Partial<Member>;

    this.memberService.addMember(memberData).subscribe({
      next: (newMember) => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.refresh();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert('Errore durante l\'aggiunta dell\'iscritto');
      }
    });
  }

  get totalCount(): number {
    return this.allMembers().length;
  }

  get activeCount(): number {
    return this.allMembers().filter(m => this.getSubscriptionStatus(m) === 'active').length;
  }

  get expiringCount(): number {
    return this.allMembers().filter(m => this.getSubscriptionStatus(m) === 'expiring').length;
  }

  get expiredCount(): number {
    // Counts both expired and inactive as "Expired" list usually
    return this.allMembers().filter(m => {
      const s = this.getSubscriptionStatus(m);
      return s === 'expired' || s === 'inactive';
    }).length;
  }

  // --- Helper methods for status logic ---

  getSubscriptionStatus(member: Member): 'active' | 'expiring' | 'expired' | 'inactive' {
    if (!member.subscriptionId) {
      return 'inactive';
    }

    // We need the subscription details to calculate expiry correctly.
    // Since we don't have the full subscription object here easily for every member in the list loop without joining data, 
    // we make an assumption or we need to fetch subscriptions.
    // For now, let's assume if subscriptionId exists, we check expiry based on a hypothetical rule or 
    // we should really join the data.

    // In a real app, the backend should return the status or the expiry date directly on the Member object.
    // Given the current architecture, I will use a simplified check or I need to access the subscription map.

    // Let's try to find the subscription from a local cache if possible, or simplified logic:
    // If we can't easily get the duration, we might default to 'active' if ID exists, 
    // BUT the user wants the SAME behavior.

    // Improved approach:
    // The Member model has `joinedAt`. The Subscription model has `durationMonths`.
    // We need the duration to calculate expiry.

    const sub = this.subscriptions().find(s => s.id === member.subscriptionId);
    if (!sub) return 'inactive'; // Should not happen if ID exists but safety check

    const expiry = new Date(member.joinedAt);
    expiry.setMonth(expiry.getMonth() + sub.durationMonths);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0, 0, 0, 0);

    // Deep expiry check (> 2 weeks) -> Inactive
    const limitDate = new Date(expiryDate);
    limitDate.setDate(limitDate.getDate() + 14);

    if (today > limitDate) {
      return 'inactive';
    }

    if (today > expiryDate) {
      return 'expired';
    }

    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    if (expiryDate.getTime() - today.getTime() <= oneWeekInMs) {
      return 'expiring';
    }

    return 'active';
  }
}
