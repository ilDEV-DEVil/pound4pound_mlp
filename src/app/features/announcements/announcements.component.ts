import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AuthService } from '../../core/services/auth.service';
import { Announcement, AnnouncementTag, User } from '../../core/models';

@Component({
    selector: 'app-announcements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './announcements.component.html',
    styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent implements OnInit {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
    private announcementService = inject(AnnouncementService);
    private authService = inject(AuthService);

    announcements = signal<Announcement[]>([]);
    currentUser = this.authService.currentUser;

    constructor() {
        // Automatically scroll to bottom when announcements change
        effect(() => {
            if (this.announcements().length > 0) {
                setTimeout(() => this.scrollToBottom(), 100);
            }
        });
    }

    newMessage = signal('');
    selectedTags = signal<AnnouncementTag[]>([]);
    filterTags = signal<AnnouncementTag[]>([]);

    availableTags: AnnouncementTag[] = [
        'comunicazioni importanti',
        'boxe',
        'mma',
        'pubblicità',
        'kickboxing',
        'muaythai',
        'bjj',
        'funzionale'
    ];

    canPost = computed(() => {
        const user = this.currentUser() as User | null;
        return user?.role === 'manager' || user?.role === 'instructor';
    });

    filteredAnnouncements = computed(() => {
        const list = this.announcements();
        const activeFilters = this.filterTags();

        if (activeFilters.length === 0) return list;

        return list.filter((ann: Announcement) =>
            ann.tags.some((tag: AnnouncementTag) => activeFilters.includes(tag))
        );
    });

    ngOnInit() {
        this.loadAnnouncements();
    }

    loadAnnouncements() {
        this.announcementService.getAnnouncements().subscribe((data: Announcement[]) => {
            this.announcements.set(data);
        });
    }

    toggleFilterTag(tag: AnnouncementTag) {
        this.filterTags.update((tags: AnnouncementTag[]) =>
            tags.includes(tag) ? tags.filter((t: AnnouncementTag) => t !== tag) : [...tags, tag]
        );
    }

    toggleNewMessageTag(tag: AnnouncementTag) {
        this.selectedTags.update((tags: AnnouncementTag[]) =>
            tags.includes(tag) ? tags.filter((t: AnnouncementTag) => t !== tag) : [...tags, tag]
        );
    }

    clearFilters() {
        this.filterTags.set([]);
    }

    sendMessage() {
        const content = this.newMessage().trim();
        if (!content || !this.canPost()) return;

        const user = this.currentUser() as User | null;
        if (!user) return;

        const newAnn: Partial<Announcement> = {
            authorId: user.id,
            authorName: `${user.firstName} ${user.lastName}`,
            authorRole: user.role,
            authorAvatar: user.avatar,
            content: content,
            tags: this.selectedTags(),
            gymId: user.gymId || 'gym-001'
        };

        this.announcementService.addAnnouncement(newAnn).subscribe(() => {
            this.newMessage.set('');
            this.selectedTags.set([]);
            this.loadAnnouncements();
        });
    }

    deleteAnnouncement(id: string) {
        if (confirm('Sei sicuro di voler eliminare questo avviso?')) {
            this.announcementService.deleteAnnouncement(id).subscribe(() => {
                this.loadAnnouncements();
            });
        }
    }

    formatDate(date: any): string {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
    }

    private scrollToBottom(): void {
        try {
            const element = this.scrollContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        } catch (err) { }
    }
}
