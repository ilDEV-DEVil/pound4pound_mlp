import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstructorService } from '../../core/services/instructor.service';
import { Instructor, Sport } from '../../core/models';
import { CardComponent, ButtonComponent, InputComponent } from '../../shared/components';

@Component({
    selector: 'app-instructors',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './instructors.component.html',
    styleUrl: './instructors.component.scss'
})
export class InstructorsComponent {
    private instructorService = inject(InstructorService);
    private fb = inject(FormBuilder);

    instructors = signal<Instructor[]>([]);
    isCreating = signal(false);
    editingInstructor = signal<Instructor | null>(null);
    loading = signal(false);

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        bio: [''],
        email: ['', [Validators.email]],
        phone: [''],
        specialties: [[] as Sport[]]
    });

    availableSports: Sport[] = ['boxing', 'kickboxing', 'mma', 'muaythai', 'bjj'];

    constructor() {
        this.refresh();
    }

    refresh() {
        this.instructorService.getInstructors().subscribe((data: Instructor[]) => this.instructors.set(data));
    }

    toggleCreating() {
        this.isCreating.update(v => !v);
        this.editingInstructor.set(null);
        this.form.reset();
    }

    onEdit(instructor: Instructor) {
        this.editingInstructor.set(instructor);
        this.isCreating.set(false);
        this.form.patchValue({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            bio: instructor.bio || '',
            email: instructor.email || '',
            phone: instructor.phone || '',
            specialties: instructor.specialties
        });
    }

    cancelEdit() {
        this.editingInstructor.set(null);
        this.isCreating.set(false);
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.loading.set(true);
        const val = this.form.value;

        const instructorData: Partial<Instructor> = {
            firstName: val.firstName!,
            lastName: val.lastName!,
            bio: val.bio || '',
            email: val.email || '',
            phone: val.phone || '',
            specialties: (val.specialties as unknown as Sport[]) || []
        };

        if (this.editingInstructor()) {
            this.instructorService.updateInstructor(this.editingInstructor()!.id, instructorData).subscribe(() => {
                this.loading.set(false);
                this.editingInstructor.set(null);
                this.refresh();
            });
        } else {
            this.instructorService.addInstructor(instructorData).subscribe(() => {
                this.loading.set(false);
                this.isCreating.set(false);
                this.refresh();
            });
        }
    }

    onDelete(id: string) {
        if (confirm('Sei sicuro di voler eliminare questo maestro?')) {
            this.instructorService.deleteInstructor(id).subscribe(() => this.refresh());
        }
    }

    toggleSport(sport: Sport) {
        const current = (this.form.get('specialties')?.value as unknown as Sport[]) || [];
        if (current.includes(sport)) {
            this.form.get('specialties')?.setValue(current.filter(s => s !== sport) as any);
        } else {
            this.form.get('specialties')?.setValue([...current, sport] as any);
        }
    }

    isSportSelected(sport: Sport): boolean {
        return ((this.form.get('specialties')?.value as unknown as Sport[]) || []).includes(sport);
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

    getInitials(i: Instructor): string {
        return (i.firstName[0] + i.lastName[0]).toUpperCase();
    }
}
