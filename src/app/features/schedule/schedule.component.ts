import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Course, DayOfWeek, Member, Sport } from '../../core/models';
import { CourseService } from '../../core/services/course.service';
import { MemberService } from '../../core/services/member.service';
import { Router } from '@angular/router';

interface CalendarSlot {
  courseId: string;
  name: string;
  instructor: string;
  timeStart: string;
  timeEnd: string;
  day: DayOfWeek;
  colorClass: string;
  membersCount: number;
  members: Member[];
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
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  private courseService = inject(CourseService);
  private memberService = inject(MemberService);
  private router = inject(Router);

  courses = signal<Course[]>([]);
  allMembers = signal<Member[]>([]);

  // Date Management
  currentDate = new Date();
  selectedMonth = signal<number>(this.currentDate.getMonth()); // 0-11
  selectedYear = signal<number>(this.currentDate.getFullYear());

  weekDays = signal<DayInfo[]>([]);
  selectedDate = signal<DayInfo | null>(null);
  currentWeekStart = signal<Date>(this.getStartOfWeek(new Date()));

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
    'course-blue',
    'course-red',
    'course-blue-alt',
    'course-red-alt',
  ];

  constructor() {
    this.generateWeek();
    this.refresh();
  }

  onMonthYearChange() {
    const newDate = new Date(this.selectedYear(), this.selectedMonth(), 1);
    this.currentWeekStart.set(this.getStartOfWeek(newDate));
    this.generateWeek();
  }

  prevWeek() {
    const current = new Date(this.currentWeekStart());
    current.setDate(current.getDate() - 7);
    this.currentWeekStart.set(current);
    this.generateWeek();
  }

  nextWeek() {
    const current = new Date(this.currentWeekStart());
    current.setDate(current.getDate() + 7);
    this.currentWeekStart.set(current);
    this.generateWeek();
  }

  goToToday() {
    this.currentWeekStart.set(this.getStartOfWeek(new Date()));
    this.generateWeek();
  }

  generateWeek() {
    const startOfWeek = this.currentWeekStart();
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

    // Sync Month/Year selectors with the week being viewed (using middle of week for stability)
    const midWeek = new Date(startOfWeek);
    midWeek.setDate(midWeek.getDate() + 3);
    this.selectedMonth.set(midWeek.getMonth());
    this.selectedYear.set(midWeek.getFullYear());

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

    this.memberService.getMembers().subscribe(members => {
      this.allMembers.set(members);
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
          const membersList = this.allMembers();
          const mCount = Math.min(Math.floor(Math.random() * 8) + 3, membersList.length);

          // Prendi N membri casuali
          const shuffled = [...membersList].sort(() => 0.5 - Math.random());
          const slotMembers = shuffled.slice(0, mCount);

          slots.push({
            courseId: course.id,
            name: course.name,
            instructor: course.instructor,
            timeStart: s.startTime,
            timeEnd: s.endTime,
            day: s.day,
            colorClass: color,
            membersCount: mCount,
            members: slotMembers
          });
        });
    });

    return slots.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  });

  // Modal signals
  selectedDetailSlot = signal<CalendarSlot | null>(null);

  onSlotClick(slot: CalendarSlot) {
    this.selectedDetailSlot.set(slot);
    const dialog = document.getElementById('lesson-detail-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  }

  closeDetailModal() {
    const dialog = document.getElementById('lesson-detail-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
    this.selectedDetailSlot.set(null);
  }

  navigateToMember(memberId: string) {
    this.closeDetailModal();
    this.router.navigate(['/app/members', memberId], {
      queryParams: { from: 'schedule' }
    });
  }

  editLesson() {
    const slot = this.selectedDetailSlot();
    if (!slot) return;

    this.isEditing.set(true);
    this.editingCourseId.set(slot.courseId);

    this.courseForm.set({
      name: slot.name,
      instructor: slot.instructor,
      sport: 'boxing', // Sport would ideally be in slot, defaulting for now
      day: slot.day,
      startTime: slot.timeStart,
      endTime: slot.timeEnd
    });

    this.closeDetailModal();
    const dialog = document.getElementById('add-lesson-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  }

  deleteLesson() {
    const slot = this.selectedDetailSlot();

    if (!slot) return;

    // Rimosso confirm() per evitare blocchi e procedere direttamente
    this.courseService.deleteLesson(slot.courseId, slot.day, slot.timeStart).subscribe({
      next: (success) => {
        if (success) {
          this.closeDetailModal();
          this.refresh();
        } else {
          alert('Errore: corso non trovato nello storage locale o ID non corrispondente.');
        }
      },
      error: (err) => {
      }
    });
  }

  // Course Form Modal Logic
  courseForm = signal({
    name: '',
    instructor: '',
    sport: 'boxing' as Sport,
    day: 'monday' as DayOfWeek,
    startTime: '10:00',
    endTime: '11:00'
  });

  isEditing = signal(false);
  editingCourseId = signal<string | null>(null);

  openAddModal() {
    this.isEditing.set(false);
    this.editingCourseId.set(null);

    const selected = this.selectedDate();
    this.courseForm.set({
      name: '',
      instructor: '',
      sport: 'boxing',
      day: selected ? selected.fullDay : 'monday',
      startTime: '10:00',
      endTime: '11:00'
    });

    const dialog = document.getElementById('add-lesson-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  }

  closeAddModal() {
    const dialog = document.getElementById('add-lesson-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.close();
    }
  }

  saveCourse() {
    const data = this.courseForm();
    if (!data.name || !data.instructor) {
      alert('Per favore compila tutti i campi obbligatori.');
      return;
    }

    const courseData: Partial<Course> = {
      name: data.name,
      instructor: data.instructor,
      sport: data.sport,
      schedule: [{
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime
      }]
    };

    if (this.isEditing() && this.editingCourseId()) {
      this.courseService.updateCourse(this.editingCourseId()!, courseData).subscribe(() => {
        this.finalizeSave('Lezione modificata con successo!');
      });
    } else {
      this.courseService.addCourse(courseData).subscribe(() => {
        this.finalizeSave('Lezione aggiunta con successo!');
      });
    }
  }

  private finalizeSave(message: string) {
    this.closeAddModal();
    this.refresh();
    alert(message);
  }

  // Booking logic
  bookingLoading = signal(false);

  confirmBooking() {
    const slot = this.selectedDetailSlot();
    if (!slot) return;

    this.bookingLoading.set(true);
    this.courseService.bookClass(
      slot.courseId,
      slot.day,
      slot.timeStart
    ).subscribe(() => {
      this.bookingLoading.set(false);
      this.closeDetailModal();
      alert(`Prenotazione confermata per ${slot.name}!`);
    });
  }
}
