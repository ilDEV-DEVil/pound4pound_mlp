import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Instructor } from '../models';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class InstructorService {
    private storage = inject(StorageService);

    private readonly STORAGE_KEY = 'instructors';

    constructor() {
        this.ensureData();
    }

    private ensureData() {
        if (!this.storage.getItem(this.STORAGE_KEY)) {
            const initialInstructors: Instructor[] = [
                {
                    id: 'inst-1',
                    gymId: 'gym-001',
                    firstName: 'Marco',
                    lastName: 'Rossi',
                    bio: 'Campione regionale di Kickboxing con oltre 10 anni di esperienza nell\'insegnamento.',
                    specialties: ['kickboxing', 'boxing'],
                    avatar: null,
                    email: 'marco.rossi@example.com',
                    socialLinks: { instagram: '@marcorossi_fight' }
                },
                {
                    id: 'inst-2',
                    gymId: 'gym-001',
                    firstName: 'Giulia',
                    lastName: 'Bianchi',
                    bio: 'Cintura nera di BJJ, specializzata in tecniche di grappling e self-defense.',
                    specialties: ['bjj', 'mma'],
                    avatar: null,
                    email: 'giulia.bianchi@example.com'
                },
                {
                    id: 'inst-3',
                    gymId: 'gym-001',
                    firstName: 'Antonio',
                    lastName: 'Ricci',
                    bio: 'Esperto di Muay Thai con lunghi periodi di allenamento in Thailandia. Maestro certificato.',
                    specialties: ['muaythai', 'kickboxing'],
                    avatar: null,
                    socialLinks: { instagram: '@antonio_muaythai' }
                }
            ];
            this.storage.setItem(this.STORAGE_KEY, initialInstructors);
        }
    }

    getInstructors(): Observable<Instructor[]> {
        const instructors = this.storage.getItem<Instructor[]>(this.STORAGE_KEY) || [];
        return of(instructors).pipe(delay(500));
    }

    getInstructorById(id: string): Observable<Instructor | undefined> {
        const instructors = this.storage.getItem<Instructor[]>(this.STORAGE_KEY) || [];
        const instructor = instructors.find(i => i.id === id);
        return of(instructor).pipe(delay(300));
    }

    addInstructor(instructor: Partial<Instructor>): Observable<Instructor> {
        const instructors = this.storage.getItem<Instructor[]>(this.STORAGE_KEY) || [];
        const newInstructor: Instructor = {
            id: `inst-${Date.now()}`,
            gymId: 'gym-001',
            firstName: instructor.firstName!,
            lastName: instructor.lastName!,
            bio: instructor.bio,
            specialties: instructor.specialties || [],
            avatar: instructor.avatar || null,
            phone: instructor.phone,
            email: instructor.email,
            socialLinks: instructor.socialLinks
        };
        instructors.unshift(newInstructor);
        this.storage.setItem(this.STORAGE_KEY, instructors);
        return of(newInstructor).pipe(delay(600));
    }

    updateInstructor(id: string, updates: Partial<Instructor>): Observable<Instructor | null> {
        const instructors = this.storage.getItem<Instructor[]>(this.STORAGE_KEY) || [];
        const index = instructors.findIndex(i => i.id === id);
        if (index !== -1) {
            instructors[index] = { ...instructors[index], ...updates };
            this.storage.setItem(this.STORAGE_KEY, instructors);
            return of(instructors[index]).pipe(delay(400));
        }
        return of(null);
    }

    deleteInstructor(id: string): Observable<boolean> {
        const instructors = this.storage.getItem<Instructor[]>(this.STORAGE_KEY) || [];
        const filtered = instructors.filter(i => i.id !== id);
        if (filtered.length !== instructors.length) {
            this.storage.setItem(this.STORAGE_KEY, filtered);
            return of(true).pipe(delay(400));
        }
        return of(false);
    }
}
