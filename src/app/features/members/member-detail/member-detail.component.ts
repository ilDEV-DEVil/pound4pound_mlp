import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberService } from '../../../core/services/member.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Member, Subscription } from '../../../core/models';
import { CardComponent, ButtonComponent, InputComponent } from '../../../shared/components';
import { StorageService } from '../../../core/services/storage.service';

interface Document {
  id: string;
  name: string;
  type: 'medical' | 'insurance' | 'other';
  uploadDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'expiring' | 'expired';
  url?: string;
}

interface DisciplineRecord {
  id: string;
  discipline: 'MMA' | 'Kickboxing' | 'Boxe' | 'Muay Thai';
  level: string;
  record: {
    wins: number;
    losses: number;
    draws: number;
  };
}

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class MemberDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private memberService = inject(MemberService);
  private subscriptionService = inject(SubscriptionService);
  private storage = inject(StorageService);
  private fb = inject(FormBuilder);

  member = signal<Member | undefined>(undefined);
  activeSubscription = signal<Subscription | undefined>(undefined);
  availableSubscriptions = signal<Subscription[]>([]);
  isRenewing = signal(false);
  renewLoading = false;

  // Edit Profile
  isEditingProfile = signal(false);
  editProfileLoading = false;
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: ['M' as 'M' | 'F'],
    birthDate: [''],
    weight: [75 as number, [Validators.required, Validators.min(1)]],
    height: [180 as number, [Validators.required, Validators.min(1)]]
  });

  // Discipline management
  isAddingDiscipline = signal(false);
  isEditingDiscipline = signal(false);
  editingDisciplineId = signal<string | null>(null);
  disciplineForm = this.fb.group({
    discipline: ['MMA' as 'MMA' | 'Kickboxing' | 'Boxe' | 'Muay Thai', Validators.required],
    level: ['Principiante', Validators.required],
    wins: [0, [Validators.required, Validators.min(0)]],
    losses: [0, [Validators.required, Validators.min(0)]],
    draws: [0, [Validators.required, Validators.min(0)]]
  });

  // Discipline Records - Dati dinamici per disciplina
  disciplines = signal<DisciplineRecord[]>([
    {
      id: '1',
      discipline: 'MMA',
      level: 'Intermedio',
      record: {
        wins: 12,
        losses: 3,
        draws: 1
      }
    },
    {
      id: '2',
      discipline: 'Kickboxing',
      level: 'Avanzato',
      record: {
        wins: 8,
        losses: 2,
        draws: 0
      }
    },
    {
      id: '3',
      discipline: 'Boxe',
      level: 'Principiante',
      record: {
        wins: 3,
        losses: 1,
        draws: 0
      }
    }
  ]);

  selectedDiscipline = signal<DisciplineRecord | undefined>(undefined);

  // Analytics data (mock)
  monthlyAttendance = [
    { month: 'Gen', count: 8 },
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 10 },
    { month: 'Apr', count: 15 },
    { month: 'Mag', count: 11 },
    { month: 'Giu', count: 8 }
  ];

  weeklyDistribution = [
    { day: 'L', count: 5 },
    { day: 'M', count: 8 },
    { day: 'M', count: 6 },
    { day: 'G', count: 7 },
    { day: 'V', count: 9 },
    { day: 'S', count: 3 },
    { day: 'D', count: 0 }
  ];

  currentAttendance = 8;
  goalAttendance = 12;
  currentStreak = 5;
  bestStreak = 14;

  // Mock athlete data - in real app these would come from the Member model
  athleteData = {
    birthDate: new Date('1995-03-15'),
    gender: 'M' as 'M' | 'F',
    weight: 75.5,
    height: 180
  };

  // Mock documents - in real app these would come from API
  documents = signal<Document[]>([
    {
      id: '1',
      name: 'Certificato Medico Sportivo',
      type: 'medical',
      uploadDate: new Date('2025-09-01'),
      expiryDate: new Date('2026-09-01'),
      status: 'valid'
    },
    {
      id: '2',
      name: 'Assicurazione Sportiva',
      type: 'insurance',
      uploadDate: new Date('2025-08-15'),
      expiryDate: new Date('2026-08-15'),
      status: 'valid'
    },
    {
      id: '3',
      name: 'Consenso Privacy',
      type: 'other',
      uploadDate: new Date('2025-01-10'),
      status: 'valid'
    }
  ]);

  // Aggiungi questo signal per il dropdown
  isDisciplineDropdownOpen = signal<boolean>(false);

  toggleDisciplineDropdown() {
    this.isDisciplineDropdownOpen.set(!this.isDisciplineDropdownOpen());
  }

  selectDiscipline(discipline: DisciplineRecord) {
    this.selectedDiscipline.set(discipline);
    this.isDisciplineDropdownOpen.set(false);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadMember(id);
        if (this.disciplines().length > 0) {
          this.selectedDiscipline.set(this.disciplines()[0]);
        }
      }
    });

    // Load available subscriptions for renewal
    this.subscriptionService.getSubscriptions().subscribe(subs => {
      this.availableSubscriptions.set(subs);
    });

    // Chiudi dropdown quando si clicca fuori
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.discipline-selector')) {
        this.isDisciplineDropdownOpen.set(false);
      }
    });
  }

  loadMember(id: string) {
    this.memberService.getMemberById(id).subscribe(m => {
      this.member.set(m);
      if (m?.subscriptionId) {
        this.loadSubscription(m.subscriptionId);
      }
    });
  }

  loadSubscription(subId: string) {
    const subs = (this.storage.getItem('subscriptions') || []) as Subscription[];
    const sub = subs.find(s => s.id === subId);
    this.activeSubscription.set(sub);
  }

  // Subscription renewal methods
  openRenewPanel() {
    this.isEditingProfile.set(false);
    this.isAddingDiscipline.set(false);
    this.isEditingDiscipline.set(false);
    this.isRenewing.set(true);
  }

  cancelRenew() {
    this.isRenewing.set(false);
  }

  assignPlan(sub: Subscription) {
    const m = this.member();
    if (!m) return;
    this.renewLoading = true;
    this.memberService.updateMember(m.id, { subscriptionId: sub.id }).subscribe(() => {
      this.renewLoading = false;
      this.isRenewing.set(false);
      this.activeSubscription.set(sub);
      // Update the member signal so the header reflects the change
      this.member.set({ ...m, subscriptionId: sub.id });
    });
  }

  // Profile editing methods
  openEditProfile() {
    const m = this.member();
    if (!m) return;
    this.isRenewing.set(false);
    this.isAddingDiscipline.set(false);
    this.isEditingDiscipline.set(false);
    this.profileForm.patchValue({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone || '',
      gender: this.athleteData.gender,
      birthDate: this.formatDateForInput(this.athleteData.birthDate),
      weight: this.athleteData.weight,
      height: this.athleteData.height
    });
    this.isEditingProfile.set(true);
  }

  cancelEditProfile() {
    this.isEditingProfile.set(false);
  }

  onProfileSubmit() {
    const m = this.member();
    if (!m || this.profileForm.invalid) return;
    this.editProfileLoading = true;
    const val = this.profileForm.value;

    this.memberService.updateMember(m.id, {
      firstName: val.firstName!,
      lastName: val.lastName!,
      email: val.email!,
      phone: val.phone || undefined
    }).subscribe(updated => {
      this.editProfileLoading = false;
      this.isEditingProfile.set(false);
      if (updated) {
        this.member.set(updated);
      }
      // Update mock athlete data locally
      this.athleteData.gender = val.gender as 'M' | 'F';
      if (val.birthDate) {
        this.athleteData.birthDate = new Date(val.birthDate);
      }
      this.athleteData.weight = val.weight!;
      this.athleteData.height = val.height!;
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Discipline Methods
  onDisciplineChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const disciplineId = select.value;
    const discipline = this.disciplines().find(d => d.id === disciplineId);
    this.selectedDiscipline.set(discipline);
  }

  openAddDiscipline() {
    this.isRenewing.set(false);
    this.isEditingProfile.set(false);
    this.isAddingDiscipline.set(true);
    this.isEditingDiscipline.set(false);
    this.editingDisciplineId.set(null);
    this.disciplineForm.reset({
      discipline: 'MMA',
      level: 'Principiante',
      wins: 0,
      losses: 0,
      draws: 0
    });
  }

  openEditDiscipline(disc: DisciplineRecord) {
    this.isRenewing.set(false);
    this.isEditingProfile.set(false);
    this.isEditingDiscipline.set(true);
    this.isAddingDiscipline.set(false);
    this.editingDisciplineId.set(disc.id);
    this.disciplineForm.patchValue({
      discipline: disc.discipline,
      level: disc.level,
      wins: disc.record.wins,
      losses: disc.record.losses,
      draws: disc.record.draws
    });
  }

  cancelDisciplineForm() {
    this.isAddingDiscipline.set(false);
    this.isEditingDiscipline.set(false);
    this.editingDisciplineId.set(null);
  }

  saveDiscipline() {
    if (this.disciplineForm.invalid) return;
    const val = this.disciplineForm.value;
    const current = [...this.disciplines()];

    if (this.isEditingDiscipline() && this.editingDisciplineId()) {
      // Edit existing
      const idx = current.findIndex(d => d.id === this.editingDisciplineId());
      if (idx !== -1) {
        current[idx] = {
          ...current[idx],
          discipline: val.discipline as any,
          level: val.level!,
          record: {
            wins: val.wins!,
            losses: val.losses!,
            draws: val.draws!
          }
        };
        this.disciplines.set(current);
        this.selectedDiscipline.set(current[idx]);
      }
    } else {
      // Add new
      const newDisc: DisciplineRecord = {
        id: `disc-${Date.now()}`,
        discipline: val.discipline as any,
        level: val.level!,
        record: {
          wins: val.wins!,
          losses: val.losses!,
          draws: val.draws!
        }
      };
      current.push(newDisc);
      this.disciplines.set(current);
      this.selectedDiscipline.set(newDisc);
    }

    this.cancelDisciplineForm();
  }

  deleteDiscipline(disc: DisciplineRecord) {
    if (!confirm(`Eliminare la disciplina ${disc.discipline}?`)) return;
    const updated = this.disciplines().filter(d => d.id !== disc.id);
    this.disciplines.set(updated);
    if (this.selectedDiscipline()?.id === disc.id) {
      this.selectedDiscipline.set(updated.length > 0 ? updated[0] : undefined);
    }
  }

  getDisciplineIcon(discipline: string): string {
    switch (discipline) {
      case 'MMA': return '🥋';
      case 'Kickboxing': return '🦵';
      case 'Boxe': return '🥊';
      case 'Muay Thai': return '⚡';
      default: return '🥊';
    }
  }

  getTotalFightsByDiscipline(record: { wins: number; losses: number; draws: number; }): number {
    return record.wins + record.losses + record.draws;
  }

  getWinRateByDiscipline(record: { wins: number; losses: number; draws: number; }): number {
    const total = this.getTotalFightsByDiscipline(record);
    if (total === 0) return 0;
    return Math.round((record.wins / total) * 100);
  }

  // Member Methods
  getInitials(member: Member): string {
    return (member.firstName[0] + member.lastName[0]).toUpperCase();
  }

  getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getExpiryDate(member: Member): Date {
    if (!this.activeSubscription()) return new Date();
    const expiry = new Date(member.joinedAt);
    expiry.setMonth(expiry.getMonth() + (this.activeSubscription()?.durationMonths || 1));
    return expiry;
  }

  // Document Methods
  getDocumentsByType(type: 'medical' | 'insurance' | 'other'): Document[] {
    return this.documents().filter(doc => doc.type === type);
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'medical': return '🏥';
      case 'insurance': return '🛡️';
      case 'other': return '📄';
      default: return '📄';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'valid': return 'valid';
      case 'expiring': return 'expiring';
      case 'expired': return 'expired';
      default: return '';
    }
  }

  uploadDocument() {
    // TODO: Implement document upload
    console.log('Upload document');
  }

  downloadDocument(doc: Document) {
    // TODO: Implement document download
    console.log('Download document:', doc.name);
  }

  deleteDocument(doc: Document) {
    // TODO: Implement document deletion
    console.log('Delete document:', doc.name);
  }

  // Analytics Methods
  get maxAttendance(): number {
    return Math.max(...this.monthlyAttendance.map(m => m.count));
  }

  get maxWeekly(): number {
    return Math.max(...this.weeklyDistribution.map(d => d.count));
  }

  get attendancePercentage(): number {
    return Math.round((this.currentAttendance / this.goalAttendance) * 100);
  }

  get progressOffset(): number {
    const circumference = 2 * Math.PI * 50;
    const progress = this.attendancePercentage / 100;
    return circumference * (1 - progress);
  }
}
