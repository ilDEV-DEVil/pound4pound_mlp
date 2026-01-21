import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Subscription } from '../models';
import { StorageService } from './storage.service';
import { MockDataService } from './mock-data.service';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private storage = inject(StorageService);
    private mockData = inject(MockDataService);
    private readonly STORAGE_KEY = 'subscriptions';

    constructor() {
        this.ensureData();
    }

    private ensureData() {
        if (!this.storage.getItem(this.STORAGE_KEY)) {
            this.storage.setItem(this.STORAGE_KEY, this.mockData.getInitialSubscriptions());
        }
    }

    getSubscriptions(): Observable<Subscription[]> {
        const subs = this.storage.getItem<Subscription[]>(this.STORAGE_KEY) || [];
        return of(subs).pipe(delay(400));
    }

    getSubscriptionById(id: string): Observable<Subscription | undefined> {
        const subs = this.storage.getItem<Subscription[]>(this.STORAGE_KEY) || [];
        const sub = subs.find(s => s.id === id);
        return of(sub).pipe(delay(200));
    }

    createSubscription(data: Partial<Subscription>): Observable<Subscription> {
        const subs = this.storage.getItem<Subscription[]>(this.STORAGE_KEY) || [];

        const newSub: Subscription = {
            id: `sub-${Date.now()}`,
            gymId: 'gym-001',
            name: data.name!,
            price: data.price!,
            durationMonths: data.durationMonths!,
            description: data.description || '',
            maxEntries: data.maxEntries
        };

        subs.push(newSub);
        this.storage.setItem(this.STORAGE_KEY, subs);

        return of(newSub).pipe(delay(600));
    }

    updateSubscription(id: string, data: Partial<Subscription>): Observable<Subscription> {
        const subs = this.storage.getItem<Subscription[]>(this.STORAGE_KEY) || [];
        const index = subs.findIndex(s => s.id === id);

        if (index !== -1) {
            subs[index] = { ...subs[index], ...data };
            this.storage.setItem(this.STORAGE_KEY, subs);
            return of(subs[index]).pipe(delay(400));
        }

        throw new Error('Subscription not found');
    }

    deleteSubscription(id: string): Observable<boolean> {
        let subs = this.storage.getItem<Subscription[]>(this.STORAGE_KEY) || [];
        const initialLength = subs.length;
        subs = subs.filter(s => s.id !== id);

        if (subs.length !== initialLength) {
            this.storage.setItem(this.STORAGE_KEY, subs);
            return of(true).pipe(delay(400));
        }

        return of(false);
    }
}
