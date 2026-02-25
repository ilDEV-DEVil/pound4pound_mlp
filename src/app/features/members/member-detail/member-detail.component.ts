import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InputComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class MemberDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private memberService = inject(MemberService);
  private subscriptionService = inject(SubscriptionService);
  private storage = inject(StorageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  member = signal<Member | undefined>(undefined);
  activeSubscription = signal<Subscription | undefined>(undefined);
  availableSubscriptions = signal<Subscription[]>([]);
  isRenewing = signal(false);
  renewLoading = false;
  sourcePage = signal<string | null>(null);

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
  disciplines = signal<DisciplineRecord[]>([]);

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

  // derived from member signal
  gender = computed(() => {
    const m = this.member();
    return (m?.gender === 'F' ? 'F' : 'M') as 'M' | 'F';
  });

  birthDate = computed(() => {
    const m = this.member();
    return m?.birthDate ? new Date(m.birthDate) : new Date('1995-01-01');
  });

  athleteData = {
    weight: 75.5,
    height: 180
  };

  // Update documents based on member data
  documents = computed<Document[]>(() => {
    const m = this.member();
    const docs: Document[] = [
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
    ];

    if (m?.medicalExpiry) {
      // Parse medical expiry from DD/MM/YYYY or ISO
      let expDate: Date | undefined;
      if (m.medicalExpiry.includes('/')) {
        const parts = m.medicalExpiry.split('/');
        expDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        expDate = new Date(m.medicalExpiry);
      }

      const today = new Date();
      let status: 'valid' | 'expiring' | 'expired' = 'valid';
      if (expDate < today) status = 'expired';
      else if (expDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) status = 'expiring';

      docs.unshift({
        id: '1',
        name: 'Certificato Medico Sportivo',
        type: 'medical',
        uploadDate: new Date('2025-09-01'),
        expiryDate: expDate,
        status: status
      });
    }

    return docs;
  });

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

    this.route.queryParams.subscribe(params => {
      this.sourcePage.set(params['from'] || null);
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
      // Populate disciplines from activeDisciplines
      if (m?.activeDisciplines) {
        const records: DisciplineRecord[] = m.activeDisciplines.map((d, index) => ({
          id: `csv-${index}`,
          discipline: d as any,
          level: 'Amatore',
          record: {
            wins: Math.floor(Math.random() * 5),
            losses: Math.floor(Math.random() * 3),
            draws: Math.floor(Math.random() * 2)
          }
        }));
        this.disciplines.set(records);
        if (records.length > 0) {
          this.selectedDiscipline.set(records[0]);
        }
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
      gender: this.gender(),
      birthDate: m.birthDate ? this.formatDateForInput(new Date(m.birthDate)) : '',
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
      phone: val.phone || undefined,
      gender: val.gender as string,
      birthDate: val.birthDate ? new Date(val.birthDate).toISOString() : undefined
    }).subscribe(updated => {
      this.editProfileLoading = false;
      this.isEditingProfile.set(false);
      if (updated) {
        this.member.set(updated);
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
    const d = discipline.toLowerCase();
    if (d.includes('mma')) return '🥋';
    if (d.includes('kick')) return '🦵';
    if (d.includes('boxe')) return '�';
    if (d.includes('muay')) return '⚡';
    if (d.includes('bjj')) return '�';
    if (d.includes('funz')) return '💪';
    if (d.includes('fit')) return '🏃';
    if (d.includes('kids') || d.includes('baby')) return '👶';
    if (d.includes('junior') || d.includes('ragazzi')) return '🧑';
    if (d.includes('genitori')) return '👪';
    if (d.includes('pt')) return '👤';
    if (d.includes('open') || d.includes('libero')) return '🔓';
    return '🥊';
  }

  navigateToCourses(discipline: string) {
    const mapping: Record<string, string> = {
      'MMA': 'mma',
      'Kickboxing': 'kickboxing',
      'Boxe': 'boxing',
      'Muay Thai': 'muaythai'
    };
    const sport = mapping[discipline];
    this.router.navigate(['/app/courses'], { queryParams: { sport } });
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

  getSubscriptionStatus(member: Member): 'active' | 'expiring' | 'expired' {
    const expiry = this.getExpiryDate(member);
    const today = new Date();

    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiry);
    expiryDate.setHours(0, 0, 0, 0);

    if (today > expiryDate) {
      return 'expired';
    }

    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    if (expiryDate.getTime() - today.getTime() <= oneWeekInMs) {
      return 'expiring';
    }

    return 'active';
  }

  isDeeplyExpired(member: Member): boolean {
    if (!this.activeSubscription()) return false;

    const expiry = this.getExpiryDate(member);
    const limitDate = new Date(expiry);
    limitDate.setDate(limitDate.getDate() + 14); // 2 weeks tolerance

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    limitDate.setHours(0, 0, 0, 0);

    return today > limitDate;
  }

  getVisibleSubscription(): Subscription | undefined {
    const m = this.member();
    if (!m) return undefined;
    return this.isDeeplyExpired(m) ? undefined : this.activeSubscription();
  }

  uploadDocument() {
    this.notImplementedYet('Caricamento documenti');
  }

  downloadDocument(doc: Document) {
    this.notImplementedYet('Download documenti');
  }

  deleteDocument(doc: Document) {
    this.notImplementedYet('Eliminazione documenti');
  }

  notImplementedYet(feature: string) {
    alert(`${feature} sarà una funzionalità che verrà introdotta a breve.`);
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
