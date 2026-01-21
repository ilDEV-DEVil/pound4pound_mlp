import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { Course, DayOfWeek, Sport } from '../../core/models';
import { ModalComponent, InputComponent } from '../../shared/components';

interface CalendarSlot {
  courseId: string;
  name: string;
  instructor: string;
  timeStart: string;
  timeEnd: string;
  day: DayOfWeek;
  colorClass: string;
}

interface DayInfo {
  date: Date;
  dayName: string; // "LUN", "MAR"
  dayNumber: string; // "24", "25"
  fullDay: DayOfWeek; // 'monday', etc.
  isToday: boolean;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, InputComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  private courseService = inject(CourseService);

  courses = signal<Course[]>([]);

  // Date Management
  currentDate = new Date();
  selectedMonth = signal<number>(this.currentDate.getMonth()); // 0-11
  selectedYear = signal<number>(this.currentDate.getFullYear());

  weekDays = signal<DayInfo[]>([]);
  selectedDate = signal<DayInfo | null>(null);

  monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  years = Array.from({ length: 10 }, (_, i) => this.currentDate.getFullYear() - 2 + i);

  // Mappings
  dayLabels: Record<string, string> = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica'
  };

  shortDayLabels: Record<string, string> = {
    monday: 'LUN',
    tuesday: 'MAR',
    wednesday: 'MER',
    thursday: 'GIO',
    friday: 'VEN',
    saturday: 'SAB',
    sunday: 'DOM'
  };

  sports: Sport[] = ['boxing', 'kickboxing', 'mma', 'muaythai', 'bjj'];

  // Color palette for courses
  colors = [
    'bg-blue-900/60 border-blue-500 text-blue-100',
    'bg-purple-900/60 border-purple-500 text-purple-100',
    'bg-orange-900/60 border-orange-500 text-orange-100',
    'bg-green-900/60 border-green-500 text-green-100',
    'bg-red-900/60 border-red-500 text-red-100',
  ];

  constructor() {
    this.generateWeek();
    this.refresh();
  }

  onMonthYearChange() {
    const date = new Date(this.selectedYear(), this.selectedMonth(), 1);
    this.generateWeek(date);
  }

  generateWeek(baseDate: Date = new Date()) {
    const startOfWeek = this.getStartOfWeek(baseDate);
    const days: DayInfo[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayIndex = date.getDay();
      const angularDay = this.mapJsDayToAngularDay(dayIndex);

      days.push({
        date: date,
        dayName: this.shortDayLabels[angularDay],
        dayNumber: date.getDate().toString(),
        fullDay: angularDay,
        isToday: this.isSameDate(date, new Date())
      });
    }

    this.weekDays.set(days);

    // Select today if in this week, otherwise first day of week
    const today = days.find(d => d.isToday) || days[0];
    this.selectedDate.set(today);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private mapJsDayToAngularDay(jsDay: number): DayOfWeek {
    const daysMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return daysMap[jsDay];
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  refresh() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses.set(courses);
    });
  }

  selectDate(day: DayInfo) {
    this.selectedDate.set(day);
  }

  dailySlots = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return [];

    const slots: CalendarSlot[] = [];
    const day = selected.fullDay;

    this.courses().forEach((course, index) => {
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

    return slots.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  });

  // Modal signals
  selectedSlot: CalendarSlot | null = null;
  isBookingModalOpen = signal(false);
  bookingLoading = signal(false);

  onSlotClick(slot: CalendarSlot) {
    this.selectedSlot = slot;
    this.isBookingModalOpen.set(true);
  }

  closeBookingModal() {
    this.isBookingModalOpen.set(false);
    this.selectedSlot = null;
  }

  confirmBooking() {
    if (!this.selectedSlot) return;
    this.bookingLoading.set(true);
    this.courseService.bookClass(
      this.selectedSlot.courseId,
      this.selectedSlot.day,
      this.selectedSlot.timeStart
    ).subscribe(() => {
      this.bookingLoading.set(false);
      this.closeBookingModal();
      alert(`Prenotazione confermata per ${this.selectedSlot?.name}!`);
    });
  }

  openAddModal() {
    alert('Gestione corsi completa in arrivo nel prossimo aggiornamento!');
  }
}
