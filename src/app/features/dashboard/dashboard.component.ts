import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent, ButtonComponent } from '../../shared/components';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardComponent, ButtonComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    authService = inject(AuthService);
    currentUser = this.authService.currentUser;

    // Mock data for view
    todayCourses = [
        { id: '1', startTime: '17:00', name: 'Boxe Principianti', instructor: 'Marco Rossi', maxCapacity: 15, enrolledMembers: new Array(12) },
        { id: '2', startTime: '18:30', name: 'MMA Avanzato', instructor: 'Giulia Neri', maxCapacity: 10, enrolledMembers: new Array(8) },
        { id: '3', startTime: '20:00', name: 'Muay Thai Open', instructor: 'Andrea Verdi', maxCapacity: 20, enrolledMembers: new Array(14) }
    ];
}
