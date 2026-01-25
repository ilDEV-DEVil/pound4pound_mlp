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
