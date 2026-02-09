import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Member, Subscription } from '../models';
import { StorageService } from './storage.service';
import { MockDataService } from './mock-data.service';

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    private storage = inject(StorageService);
    private mockData = inject(MockDataService);

    constructor() {
        this.ensureData();
    }

    private ensureData() {
        if (!this.storage.getItem('members')) {
            // Generate some mock members if none exist
            const initialMembers = this.generateMockMembers(15);
            this.storage.setItem('members', initialMembers);
        }
    }

    getMembers(): Observable<Member[]> {
        const members = this.storage.getItem<Member[]>('members') || [];
        return of(members).pipe(delay(500)); // Simulate network
    }

    getMemberById(id: string): Observable<Member | undefined> {
        const members = this.storage.getItem<Member[]>('members') || [];
        const member = members.find(m => m.id === id);
        return of(member).pipe(delay(300));
    }

    addMember(memberData: Partial<Member>): Observable<Member> {
        const members = this.storage.getItem<Member[]>('members') || [];

        // Create new member
        const newMember: Member = {
            id: `m-${Date.now()}`,
            gymId: 'gym-001', // database mock assumption
            userId: `u-${Date.now()}`, // detached user for now
            firstName: memberData.firstName!,
            lastName: memberData.lastName!,
            email: memberData.email!,
            phone: memberData.phone,
            avatar: null,
            subscriptionId: memberData.subscriptionId || null,
            enrolledCourses: [],
            joinedAt: new Date()
        };

        members.unshift(newMember); // Add to top
        this.storage.setItem('members', members);

        return of(newMember).pipe(delay(600));
    }

    updateMember(id: string, updates: Partial<Member>): Observable<Member | null> {
        const members = this.storage.getItem<Member[]>('members') || [];
        const index = members.findIndex(m => m.id === id);

        if (index !== -1) {
            members[index] = { ...members[index], ...updates };
            this.storage.setItem('members', members);
            return of(members[index]).pipe(delay(400));
        }

        return of(null).pipe(delay(400));
    }

    // Helper to generate mock members
    private generateMockMembers(count: number): Member[] {
        const firstNames = ['Marco', 'Luca', 'Giulia', 'Sofia', 'Matteo', 'Alessandro', 'Francesca', 'Chiara'];
        const lastNames = ['Rossi', 'Bianchi', 'Ferrari', 'Esposito', 'Ricci', 'Marino', 'Greco', 'Bruno'];
        const domains = ['gmail.com', 'outlook.it', 'yahoo.com', 'libero.it'];

        // Get subs to random assign
        const subs = this.storage.getItem<Subscription[]>('subscriptions') || this.mockData.getInitialSubscriptions();

        return Array.from({ length: count }).map((_, i) => {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const sub = Math.random() > 0.3 ? subs[Math.floor(Math.random() * subs.length)] : null;

            return {
                id: `m-mock-${i}`,
                gymId: 'gym-001',
                userId: `u-mock-${i}`,
                firstName: fn,
                lastName: ln,
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
                phone: `3${Math.floor(Math.random() * 9)}0 1234567`,
                avatar: null,
                subscriptionId: sub ? sub.id : null,
                enrolledCourses: [],
                joinedAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
            };
        });
    }
}
