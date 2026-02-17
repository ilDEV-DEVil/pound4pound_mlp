import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Announcement, AnnouncementTag, UserRole } from '../models';
import { StorageService } from './storage.service';
import announcementsData from '../../../../public/data/announcements.json';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private storage = inject(StorageService);

    constructor() {
        this.ensureData();
    }

    private ensureData() {
        if (!this.storage.getItem('announcements')) {
            const initialAnnouncements = announcementsData.map(a => ({
                ...a,
                createdAt: new Date(a.createdAt)
            })) as Announcement[];

            this.storage.setItem('announcements', initialAnnouncements);
        }
    }

    getAnnouncements(): Observable<Announcement[]> {
        const announcements = this.storage.getItem<Announcement[]>('announcements') || [];
        // Sort by date descending (latest first)
        const sorted = [...announcements].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return of(sorted).pipe(delay(400));
    }

    addAnnouncement(announcementData: Partial<Announcement>): Observable<Announcement> {
        const announcements = this.storage.getItem<Announcement[]>('announcements') || [];

        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            gymId: announcementData.gymId || 'gym-001',
            authorId: announcementData.authorId!,
            authorName: announcementData.authorName!,
            authorRole: announcementData.authorRole!,
            authorAvatar: announcementData.authorAvatar || null,
            content: announcementData.content!,
            tags: announcementData.tags || [],
            createdAt: new Date()
        };

        announcements.unshift(newAnnouncement);
        this.storage.setItem('announcements', announcements);

        return of(newAnnouncement).pipe(delay(500));
    }

    deleteAnnouncement(id: string): Observable<boolean> {
        const announcements = this.storage.getItem<Announcement[]>('announcements') || [];
        const filtered = announcements.filter(a => a.id !== id);
        this.storage.setItem('announcements', filtered);
        return of(true).pipe(delay(300));
    }
}
