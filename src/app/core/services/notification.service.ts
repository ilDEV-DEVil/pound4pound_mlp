import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = signal<AppNotification[]>([
        {
            id: '1',
            title: 'Nuova Iscrizione',
            message: 'Marco Rossi si è appena iscritto al corso di MMA.',
            type: 'success',
            timestamp: new Date(),
            isRead: false
        },
        {
            id: '2',
            title: 'Scadenza Abbonamento',
            message: 'L\'abbonamento di Giulia Bianchi scadrà tra 3 giorni.',
            type: 'warning',
            timestamp: new Date(Date.now() - 3600000 * 2),
            isRead: false
        },
        {
            id: '3',
            title: 'Aggiornamento Calendario',
            message: 'La lezione di Kickboxing di domani è stata posticipata alle 19:00.',
            type: 'info',
            timestamp: new Date(Date.now() - 3600000 * 24),
            isRead: true
        }
    ]);

    allNotifications = computed(() => this.notifications());
    unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

    addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
        const newNotif: AppNotification = {
            ...notification,
            id: Math.random().toString(36).substring(2),
            timestamp: new Date(),
            isRead: false
        };
        this.notifications.update(prev => [newNotif, ...prev]);
    }

    markAsRead(id: string) {
        this.notifications.update(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    }

    markAllAsRead() {
        this.notifications.update(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    }

    deleteNotification(id: string) {
        this.notifications.update(prev => prev.filter(n => n.id !== id));
    }
}
