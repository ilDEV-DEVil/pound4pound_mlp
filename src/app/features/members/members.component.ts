import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, ButtonComponent, InputComponent } from '../../shared/components';
import { MemberService } from '../../core/services/member.service';
import { Member } from '../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="members-container">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold mb-1">Iscritti</h1>
          <p class="text-muted text-sm">Gestisci gli atleti della tua palestra</p>
        </div>
        <div class="flex gap-2">
            <app-button variant="secondary" (click)="refresh()">
               ↻
            </app-button>
            <app-button (click)="openAddModal()">
               + Nuovo Iscritto
            </app-button>
        </div>
      </div>

      <!-- Filters -->
      <app-card class="mb-6">
        <div class="flex flex-col md:flex-row gap-4 items-end">
           <div class="flex-1 w-full">
             <app-input 
               placeholder="Cerca per nome o email..." 
               [(ngModel)]="searchQuery" 
               (ngModelChange)="filterMembers()"
               inputId="search-members"
             ></app-input>
           </div>
           
           <div class="flex gap-2">
             <button 
                class="px-4 py-2 rounded-md text-sm border transition-colors"
                [class.bg-accent-subtle]="filterStatus === 'all'"
                [class.border-accent]="filterStatus === 'all'"
                [class.border-default]="filterStatus !== 'all'"
                (click)="setFilter('all')"
             >
               Tutti
             </button>
             <button 
                class="px-4 py-2 rounded-md text-sm border transition-colors"
                [class.bg-accent-subtle]="filterStatus === 'active'"
                [class.border-accent]="filterStatus === 'active'"
                [class.border-default]="filterStatus !== 'active'"
                (click)="setFilter('active')"
             >
               Attivi
             </button>
             <button 
                class="px-4 py-2 rounded-md text-sm border transition-colors"
                [class.bg-accent-subtle]="filterStatus === 'expired'"
                [class.border-accent]="filterStatus === 'expired'"
                [class.border-default]="filterStatus !== 'expired'"
                (click)="setFilter('expired')"
             >
               Scaduti
             </button>
           </div>
        </div>
      </app-card>

      <!-- List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (member of filteredMembers(); track member.id) {
          <app-card 
            [hoverable]="true" 
            class="member-card relative group cursor-pointer"
            (click)="goToDetail(member)"
          >
            <div class="flex items-start gap-4">
               <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400">
                 {{ getInitials(member) }}
               </div>
               <div class="flex-1 min-w-0">
                 <h3 class="font-bold truncate">{{ member.firstName }} {{ member.lastName }}</h3>
                 <p class="text-sm text-muted truncate">{{ member.email }}</p>
                 
                 <div class="mt-3 flex items-center gap-2">
                    @if (member.subscriptionId) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/40 text-green-400 border border-green-900">
                        ATTIVO
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/40 text-red-400 border border-red-900">
                        NESSUN PIANO
                      </span>
                    }
                    <span class="text-[10px] text-muted">Iscritto dal {{ member.joinedAt | date:'dd/MM/yyyy' }}</span>
                 </div>
               </div>
               
               <button class="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted hover:text-white">
                 ⋮
               </button>
            </div>
          </app-card>
        } @empty {
           <div class="col-span-full py-12 text-center text-muted">
             Nessun iscritto trovato.
           </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bg-accent-subtle { background-color: var(--accent-subtle); }
    .border-accent { border-color: var(--accent-primary); }
    .border-default { border-color: var(--border-default); }
  `]
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

    // Status filter (naive impl based on subscriptionId presence for 'active')
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
}
