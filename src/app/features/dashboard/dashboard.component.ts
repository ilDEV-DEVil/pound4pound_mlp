import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent, ButtonComponent } from '../../shared/components';

interface Course {
  id: string;
  startTime: string;
  name: string;
  instructor: string;
  maxCapacity: number;
  enrolledMembers: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  // Mock data for view
  todayCourses: Course[] = [
    { id: '1', startTime: '17:00', name: 'Boxe Principianti', instructor: 'Marco Rossi', maxCapacity: 15, enrolledMembers: new Array(12) },
    { id: '2', startTime: '18:30', name: 'MMA Avanzato', instructor: 'Giulia Neri', maxCapacity: 10, enrolledMembers: new Array(8) },
    { id: '3', startTime: '20:00', name: 'Muay Thai Open', instructor: 'Andrea Verdi', maxCapacity: 20, enrolledMembers: new Array(14) }
  ];

  getTotalEnrolled(): number {
    return this.todayCourses.reduce((sum, course) => sum + course.enrolledMembers.length, 0);
  }

  getCapacityPercentage(course: Course): number {
    return (course.enrolledMembers.length / course.maxCapacity) * 100;
  }

  getLessonClass(index: number): string {
    return index % 2 === 0 ? 'course-blue' : 'course-red';
  }
}
