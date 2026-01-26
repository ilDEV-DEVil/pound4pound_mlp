import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent } from '../../shared/components';
import { MemberService } from '../../core/services/member.service';
import { Member } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent {
  private memberService = inject(MemberService);
  private router = inject(Router);

  // State
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'expired' = 'all';

  // Data
  allMembers = signal<Member[]>([]);
  filteredMembers = signal<Member[]>([]);

  constructor() {
    this.refresh();
  }

  refresh() {
    this.memberService.getMembers().subscribe(members => {
      this.allMembers.set(members);
      this.filterMembers();
    });
  }

  filterMembers() {
    let result = this.allMembers();

    // Text search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(m =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (this.filterStatus === 'active') {
      result = result.filter(m => !!m.subscriptionId);
    } else if (this.filterStatus === 'expired') {
      result = result.filter(m => !m.subscriptionId);
    }

    this.filteredMembers.set(result);
  }

  setFilter(status: 'all' | 'active' | 'expired') {
    this.filterStatus = status;
    this.filterMembers();
  }

  getInitials(member: Member): string {
    return (member.firstName[0] + member.lastName[0]).toUpperCase();
  }

  goToDetail(member: Member) {
    this.router.navigate(['/app/members', member.id]);
  }

  openAddModal() {
    alert('Funzionalità Modale Aggiunta in arrivo nel prossimo step!');
  }

  get totalCount(): number {
    return this.allMembers().length;
  }

  get activeCount(): number {
    return this.allMembers().filter(m => !!m.subscriptionId).length;
  }

  get expiredCount(): number {
    return this.allMembers().filter(m => !m.subscriptionId).length;
  }
}
