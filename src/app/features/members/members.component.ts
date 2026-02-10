import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent, ModalComponent } from '../../shared/components';
import { MemberService } from '../../core/services/member.service';
import { Member } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent {
  private memberService = inject(MemberService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // State
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'expired' = 'all';
  isModalOpen = signal(false);
  isSubmitting = signal(false);

  // Data
  allMembers = signal<Member[]>([]);
  filteredMembers = signal<Member[]>([]);

  // Form
  memberForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

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
    this.memberForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onAddMember() {
    if (this.memberForm.invalid) return;

    this.isSubmitting.set(true);
    const memberData = this.memberForm.value as Partial<Member>;

    this.memberService.addMember(memberData).subscribe({
      next: (newMember) => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.refresh();
        // Optionale: navigare al dettaglio? 
        // Per ora restiamo qui per far vedere che è stato aggiunto
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert('Errore durante l\'aggiunta dell\'iscritto');
      }
    });
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
