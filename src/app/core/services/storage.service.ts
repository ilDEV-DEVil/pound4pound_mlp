import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private prefix = 'p4p_';

    getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(`${this.prefix}${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from localStorage', error);
            return null;
        }
    }

    setItem(key: string, value: any): void {
        try {
            localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in localStorage', error);
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(`${this.prefix}${key}`);
        } catch (error) {
            console.error('Error removing item from localStorage', error);
        }
    }

    clear(): void {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }
}
