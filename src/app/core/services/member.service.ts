import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Member, Subscription } from '../models';
import { StorageService } from './storage.service';
import { MockDataService } from './mock-data.service';
import membersData from '../../../../public/data/members.json';

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
            // Load mock members from static JSON file
            const initialMembers = membersData.map((m: any) => ({
                ...m,
                joinedAt: new Date(m.joinedAt)
            })) as Member[];

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
}
