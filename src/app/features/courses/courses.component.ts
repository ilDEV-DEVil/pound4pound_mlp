import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent } from '../../shared/components';
import { CourseService } from '../../core/services/course.service';
import { Course, Sport } from '../../core/models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);

  courses = signal<Course[]>([]);
  isCreating = signal(false);
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    sport: ['boxing' as Sport, Validators.required],
    instructor: ['', Validators.required],
    maxCapacity: [20, [Validators.required, Validators.min(1)]],
    description: ['']
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.courseService.getCourses().subscribe(c => this.courses.set(c));
  }

  openCreateMode() {
    this.isCreating.set(true);
    this.form.reset({
      sport: 'boxing',
      maxCapacity: 20
    });
  }

  cancelCreate() {
    this.isCreating.set(false);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    this.courseService.addCourse({
      name: val.name!,
      sport: val.sport as Sport,
      instructor: val.instructor!,
      maxCapacity: val.maxCapacity!,
      description: val.description || '',
      schedule: [] // Empty initial schedule for new courses in this MVP
    }).subscribe(() => {
      this.loading = false;
      this.isCreating.set(false);
      this.refresh();
    });
  }

  getSportIcon(sport: Sport): string {
    const icons: Record<Sport, string> = {
      boxing: '🥊',
      kickboxing: '🦶',
      mma: '🤼',
      muaythai: '🥋',
      bjj: '🐍'
    };
    return icons[sport] || '❓';
  }

  getSportLabel(sport: Sport): string {
    const labels: Record<Sport, string> = {
      boxing: 'Boxe',
      kickboxing: 'Kickboxing',
      mma: 'MMA',
      muaythai: 'Muay Thai',
      bjj: 'BJJ'
    };
    return labels[sport] || sport;
  }

  getScheduleCount(course: Course): number {
    return course.schedule?.length || 0;
  }
}
