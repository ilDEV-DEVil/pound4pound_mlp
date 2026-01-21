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
    template: `
    <div class="courses-container">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold mb-1">Gestione Corsi</h1>
          <p class="text-muted text-sm">Definisci i corsi offerti dalla tua palestra</p>
        </div>
        <app-button (click)="openCreateMode()">
           + Nuovo Corso
        </app-button>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- List of Courses -->
        <div class="lg:col-span-2 grid gap-4">
           @for (course of courses(); track course.id) {
             <app-card [hoverable]="true" class="group relative overflow-hidden">
               <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
                 <div class="flex items-start gap-4">
                   <div class="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl border border-gray-700">
                      {{ getSportIcon(course.sport) }}
                   </div>
                   <div>
                      <h3 class="font-bold text-lg text-white">{{ course.name }}</h3>
                      <p class="text-sm text-muted mb-1">{{ course.description }}</p>
                      <div class="flex gap-4 text-xs text-gray-400">
                        <span>Istruttore: <strong class="text-gray-300">{{ course.instructor }}</strong></span>
                        <span>Capienza: <strong class="text-gray-300">{{ course.maxCapacity }}</strong></span>
                      </div>
                   </div>
                 </div>
                 
                 <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                    <button class="p-2 text-muted hover:text-white transition-colors" title="Modifica">✎</button>
                    <button class="p-2 text-red-500 hover:text-red-400 transition-colors" title="Elimina">🗑</button>
                 </div>
               </div>
             </app-card>
           } @empty {
             <div class="p-8 text-center border border-dashed border-gray-700 rounded text-muted">
               Nessun corso definito.
             </div>
           }
        </div>

        <!-- Create/Edit Form (Sidebar) -->
        @if (isCreating()) {
          <div class="lg:col-span-1">
            <app-card [headerTemplate]="true" title="Nuovo Corso">
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                 <app-input 
                   label="Nome Corso" 
                   placeholder="Es. Boxe Avanzata"
                   formControlName="name"
                 ></app-input>

                 <div class="flex flex-col gap-1">
                   <label class="text-sm font-medium text-gray-300">Sport</label>
                   <select formControlName="sport" class="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
                     <option value="boxing">Boxe</option>
                     <option value="kickboxing">Kickboxing</option>
                     <option value="mma">MMA</option>
                     <option value="muaythai">Muay Thai</option>
                     <option value="bjj">BJJ / Grappling</option>
                   </select>
                 </div>

                 <app-input 
                   label="Istruttore" 
                   placeholder="Nome Cognome"
                   formControlName="instructor"
                 ></app-input>
                 
                 <app-input 
                   label="Capienza Max" 
                   type="number" 
                   placeholder="20"
                   formControlName="maxCapacity"
                 ></app-input>

                 <app-input 
                   label="Descrizione" 
                   placeholder="Breve descrizione..."
                   formControlName="description"
                 ></app-input>

                 <div class="flex gap-2 mt-2">
                   <app-button type="button" variant="ghost" [fullWidth]="true" (click)="cancelCreate()">Annulla</app-button>
                   <app-button type="submit" [loading]="loading" [fullWidth]="true" [disabled]="form.invalid">Salva</app-button>
                 </div>
              </form>
            </app-card>
          </div>
        }
      </div>
    </div>
  `
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
}
