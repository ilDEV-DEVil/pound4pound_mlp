import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Course, CourseSchedule, DayOfWeek } from '../models';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private storage = inject(StorageService);

    constructor() {
        this.ensureData();
    }

    private ensureData() {
        if (!this.storage.getItem('courses')) {
            const initialCourses = this.generateMockCourses();
            this.storage.setItem('courses', initialCourses);
        }
    }

    getCourses(): Observable<Course[]> {
        const courses = this.storage.getItem<Course[]>('courses') || [];
        return of(courses).pipe(delay(500));
    }

    addCourse(courseData: Partial<Course>): Observable<Course> {
        const courses = this.storage.getItem<Course[]>('courses') || [];

        const newCourse: Course = {
            id: `c-${Date.now()}`,
            gymId: 'gym-001',
            name: courseData.name!,
            description: courseData.description || '',
            instructor: courseData.instructor!,
            sport: courseData.sport || 'boxing',
            maxCapacity: courseData.maxCapacity || 20,
            schedule: courseData.schedule || [],
            enrolledMembers: []
        };

        courses.push(newCourse);
        this.storage.setItem('courses', courses);
        return of(newCourse).pipe(delay(600));
    }

    deleteLesson(courseId: string, day: DayOfWeek, startTime: string): Observable<boolean> {
        const courses = this.storage.getItem<Course[]>('courses') || [];

        // Flessibilità per ID diversi (c-001 vs course-001) salvati nello storage
        const normalizedId = courseId.replace('course-', 'c-');
        const courseIndex = courses.findIndex(c => c.id === courseId || c.id === normalizedId);

        if (courseIndex !== -1) {
            const course = courses[courseIndex];
            const initialCount = course.schedule.length;
            course.schedule = course.schedule.filter(
                s => !(s.day === day && s.startTime === startTime)
            );

            this.storage.setItem('courses', courses);
            return of(true).pipe(delay(500));
        }

        return of(false).pipe(delay(500));
    }

    updateCourse(id: string, updates: Partial<Course>): Observable<Course | null> {
        const courses = this.storage.getItem<Course[]>('courses') || [];
        const index = courses.findIndex(c => c.id === id);

        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            this.storage.setItem('courses', courses);
            return of(courses[index]).pipe(delay(500));
        }

        return of(null).pipe(delay(500));
    }

    deleteCourse(id: string): Observable<boolean> {
        const courses = this.storage.getItem<Course[]>('courses') || [];
        const normalizedId = id.replace('course-', 'c-');
        const filteredCourses = courses.filter(c => c.id !== id && c.id !== normalizedId);

        if (filteredCourses.length !== courses.length) {
            this.storage.setItem('courses', filteredCourses);
            return of(true).pipe(delay(500));
        }

        return of(false).pipe(delay(500));
    }

    bookClass(courseId: string, day: string, timeStart: string): Observable<boolean> {
        // Mock booking - in real app would create a Session record
        return of(true).pipe(delay(800));
    }

    // Generate a realistic weekly schedule
    private generateMockCourses(): Course[] {
        return [
            {
                id: 'c-001',
                gymId: 'gym-001',
                name: 'Boxe Principianti',
                description: 'Corso base per imparare i fondamenti della nobile arte.',
                instructor: 'Marco Rossi',
                sport: 'boxing',
                maxCapacity: 20,
                enrolledMembers: [],
                schedule: [
                    { day: 'monday', startTime: '18:00', endTime: '19:00' },
                    { day: 'wednesday', startTime: '18:00', endTime: '19:00' },
                    { day: 'friday', startTime: '18:00', endTime: '19:00' }
                ]
            },
            {
                id: 'c-002',
                gymId: 'gym-001',
                name: 'MMA Pro',
                description: 'Allenamento avanzato per competizioni.',
                instructor: 'Giulia Neri',
                sport: 'mma',
                maxCapacity: 12,
                enrolledMembers: [],
                schedule: [
                    { day: 'tuesday', startTime: '19:30', endTime: '21:00' },
                    { day: 'thursday', startTime: '19:30', endTime: '21:00' }
                ]
            },
            {
                id: 'c-003',
                gymId: 'gym-001',
                name: 'Muay Thai',
                description: 'L\'arte delle 8 armi.',
                instructor: 'Andrea Verdi',
                sport: 'muaythai',
                maxCapacity: 15,
                enrolledMembers: [],
                schedule: [
                    { day: 'monday', startTime: '19:00', endTime: '20:30' },
                    { day: 'wednesday', startTime: '19:00', endTime: '20:30' },
                    { day: 'friday', startTime: '19:00', endTime: '20:30' }
                ]
            },
            {
                id: 'c-004',
                gymId: 'gym-001',
                name: 'Grappling / BJJ no-gi',
                description: 'Lotta a terra senza kimono.',
                instructor: 'Simone Bianchi',
                sport: 'bjj',
                maxCapacity: 15,
                enrolledMembers: [],
                schedule: [
                    { day: 'tuesday', startTime: '18:00', endTime: '19:30' },
                    { day: 'thursday', startTime: '18:00', endTime: '19:30' },
                    { day: 'saturday', startTime: '10:30', endTime: '12:00' }
                ]
            }
        ];
    }
}
