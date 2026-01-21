import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../../../core/services/member.service';
import { Member, Subscription } from '../../../core/models';
import { CardComponent, ButtonComponent } from '../../../shared/components';
import { StorageService } from '../../../core/services/storage.service';

@Component({
    selector: 'app-member-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, CardComponent, ButtonComponent],
    template: `
    <div class="member-detail-container">
      <!-- Header / Back Navigation -->
      <div class="mb-6">
        <a routerLink="/app/members" class="text-muted hover:text-white text-sm flex items-center gap-2 mb-2">
          <span>←</span> Torna alla lista
        </a>
        
        @if (member(); as m) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
               <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
                 {{ getInitials(m) }}
               </div>
               <div>
                  <h1 class="text-3xl font-bold">{{ m.firstName }} {{ m.lastName }}</h1>
                  <p class="text-muted">Iscritto dal {{ m.joinedAt | date:'longDate' }}</p>
               </div>
            </div>
            <div class="flex gap-2">
              <app-button variant="secondary" size="sm">Modifica</app-button>
              <app-button variant="danger" size="sm">Elimina</app-button>
            </div>
          </div>
        } @else {
          <div class="animate-pulse flex items-center gap-4">
             <div class="w-16 h-16 rounded-full bg-gray-800"></div>
             <div class="h-8 bg-gray-800 w-48 rounded"></div>
          </div>
        }
      </div>

      @if (member(); as m) {
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Info -->
          <div class="lg:col-span-2 flex flex-col gap-6">
             
             <!-- Subscription Status -->
             <app-card [hoverable]="false" [headerTemplate]="true">
               <div card-header class="flex justify-between items-center">
                 <h3 class="font-bold text-lg">Stato Abbonamento</h3>
                 @if (activeSubscription()) {
                    <span class="px-3 py-1 rounded bg-green-900/40 text-green-400 border border-green-900 text-sm font-bold">ATTIVO</span>
                 } @else {
                    <span class="px-3 py-1 rounded bg-red-900/40 text-red-400 border border-red-900 text-sm font-bold">SCADUTO / ASSENTE</span>
                 }
               </div>

               <div class="flex flex-col gap-4">
                 @if (activeSubscription(); as sub) {
                   <div class="p-4 bg-gray-800/50 rounded border border-gray-700 relative overflow-hidden">
                      <div class="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-accent rotate-12 pointer-events-none">
                        P4P
                      </div>
                      <div class="relative z-10">
                        <div class="text-sm text-muted uppercase tracking-wider mb-1">Piano Attuale</div>
                        <div class="text-2xl font-bold text-white mb-2">{{ sub.name }}</div>
                        <div class="flex gap-6 text-sm">
                           <div>
                             <span class="text-muted block">Prezzo</span>
                             <span class="font-bold">{{ sub.price | currency:'EUR' }} / {{ sub.durationMonths }} mesi</span>
                           </div>
                           <div>
                             <span class="text-muted block">Scadenza</span>
                             <span class="font-bold text-white">{{ getExpiryDate(m) | date:'dd MMM yyyy' }}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                   <div class="flex justify-end">
                     <app-button size="sm">Rinnova Abbonamento</app-button>
                   </div>
                 } @else {
                   <div class="text-center py-8 bg-gray-800/30 rounded border border-dashed border-gray-700">
                     <p class="text-muted mb-4">L'utente non ha un abbonamento attivo.</p>
                     <app-button>Assegna Abbonamento</app-button>
                   </div>
                 }
               </div>
             </app-card>

             <!-- Anagraphic Data -->
             <app-card title="Dati Personali">
                <div class="grid md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <span class="block text-xs text-muted uppercase">Email</span>
                    <a [href]="'mailto:' + m.email" class="text-accent hover:underline">{{ m.email }}</a>
                  </div>
                  <div>
                    <span class="block text-xs text-muted uppercase">Telefono</span>
                    <span class="text-white">{{ m.phone || 'Non specificato' }}</span>
                  </div>
                  <div>
                    <span class="block text-xs text-muted uppercase">Data di Nascita</span>
                    <span class="text-white">01 Gennaio 1990 (Mock)</span>
                  </div>
                   <div>
                    <span class="block text-xs text-muted uppercase">Codice Fiscale</span>
                    <span class="text-white font-mono">RSSMRA90A01H501Z</span>
                  </div>
                </div>
             </app-card>
          </div>

          <!-- Sidebar Info -->
          <div class="flex flex-col gap-6">
             <app-card title="Statistiche Rapide">
                <ul class="space-y-4">
                  <li class="flex justify-between items-center pb-3 border-b border-gray-700/50 last:border-0 last:pb-0">
                    <span class="text-sm text-muted">Presenze Totali</span>
                    <span class="font-bold">42</span>
                  </li>
                  <li class="flex justify-between items-center pb-3 border-b border-gray-700/50 last:border-0 last:pb-0">
                    <span class="text-sm text-muted">Presenze Mese</span>
                    <span class="font-bold">8</span>
                  </li>
                  <li class="flex justify-between items-center pb-3 border-b border-gray-700/50 last:border-0 last:pb-0">
                    <span class="text-sm text-muted">Ultimo Ingresso</span>
                    <span class="font-bold text-xs">2 giorni fa</span>
                  </li>
                </ul>
             </app-card>

             <app-card title="Ultimi Corsi" class="flex-1">
               <div class="text-sm text-muted italic text-center py-4">
                 Cronologia corsi non disponibile in MVP
               </div>
             </app-card>
          </div>
        </div>
      }
    </div>
  `
})
export class MemberDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private memberService = inject(MemberService);
    private storage = inject(StorageService);

    member = signal<Member | undefined>(undefined);
    activeSubscription = signal<Subscription | undefined>(undefined);

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadMember(id);
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
        // Quick mock fetch for subscription details since we don't have a dedicated service exposed yet
        // In a real app, inject SubscriptionService
        const subs = this.storage.getItem<Subscription[]>('subscriptions') || [];
        const sub = subs.find(s => s.id === subId);
        this.activeSubscription.set(sub);
    }

    getInitials(member: Member): string {
        return (member.firstName[0] + member.lastName[0]).toUpperCase();
    }

    getExpiryDate(member: Member): Date {
        // Mock calculation: joinedAt + duration
        // In real app, this would be stored in a MemberSubscription join table or on Member
        if (!this.activeSubscription()) return new Date();

        const expiry = new Date(member.joinedAt);
        expiry.setMonth(expiry.getMonth() + (this.activeSubscription()?.durationMonths || 1));
        return expiry;
    }
}
