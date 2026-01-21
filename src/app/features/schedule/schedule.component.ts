import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { Course, CourseSchedule, DayOfWeek } from '../../core/models';
import { CardComponent, ButtonComponent, ModalComponent } from '../../shared/components';

interface CalendarSlot {
  courseId: string;
  name: string;
  instructor: string;
  timeStart: string;
  timeEnd: string;
  day: DayOfWeek;
  colorClass: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, ModalComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  private courseService = inject(CourseService);

  courses = signal<Course[]>([]);
  days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  dayLabels: Record<string, string> = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica'
  };

  // Color palette for courses
  colors = [
    'bg-blue-900/60 border-blue-500 text-blue-100',
    'bg-purple-900/60 border-purple-500 text-purple-100',
    'bg-orange-900/60 border-orange-500 text-orange-100',
    'bg-green-900/60 border-green-500 text-green-100',
    'bg-red-900/60 border-red-500 text-red-100',
  ];

  constructor() {
    this.refresh();
  }

  refresh() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses.set(courses);
    });
  }

  getSlotsForDay(day: DayOfWeek): CalendarSlot[] {
    const slots: CalendarSlot[] = [];

    this.courses().forEach((course, index) => {
      // Assign persistent color based on index
      const color = this.colors[index % this.colors.length];

      course.schedule
        .filter(s => s.day === day)
        .forEach(s => {
          slots.push({
            courseId: course.id,
            name: course.name,
            instructor: course.instructor,
            timeStart: s.startTime,
            timeEnd: s.endTime,
            day: s.day,
            colorClass: color
          });
        });
    });

    return slots;
  }

  // Calculate CSS top position percentage based on time (start 08:00, end 23:00)
  calculateTop(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 8;
    const totalHours = 15; // 8am to 11pm

    const minutesFromStart = (hours - startHour) * 60 + minutes;
    const totalMinutes = totalHours * 60;

    return `${(minutesFromStart / totalMinutes) * 100}%`;
  }

  calculateHeight(start: string, end: string): string {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);

    const durationMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const totalMinutes = 15 * 60; // 15 hours total day view

    return `${(durationMinutes / totalMinutes) * 100}%`;
  }

  selectedSlot: CalendarSlot | null = null;
  isBookingModalOpen = false;
  bookingLoading = false;

  onSlotClick(slot: CalendarSlot) {
    this.selectedSlot = slot;
    this.isBookingModalOpen = true;
  }

  closeBookingModal() {
    this.isBookingModalOpen = false;
    this.selectedSlot = null;
  }

  confirmBooking() {
    if (!this.selectedSlot) return;

    this.bookingLoading = true;
    this.courseService.bookClass(
      this.selectedSlot.courseId,
      this.selectedSlot.day,
      this.selectedSlot.timeStart
    ).subscribe(() => {
      this.bookingLoading = false;
      this.closeBookingModal();
      // Optional: Show success toast
      alert(`Prenotazione confermata per ${this.selectedSlot?.name}!`);
    });
  }

  openAddModal() {
    alert('Gestione corsi completa in arrivo nel prossimo aggiornamento!');
  }
}
