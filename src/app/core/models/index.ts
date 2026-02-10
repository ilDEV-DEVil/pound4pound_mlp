// Core Models for Pound for Pound

export type UserRole = 'manager' | 'athlete';
export type Sport = 'boxing' | 'kickboxing' | 'mma' | 'muaythai' | 'bjj';
export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'pending';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gymId: string | null;
  gymName?: string | null;
  avatar: string | null;
  phone?: string;
  birthDate?: string;
  createdAt: Date;
}

export interface Gym {
  id: string;
  name: string;
  logo: string | null;
  address: string;
  sports: Sport[];
  inviteCode: string;
  ownerId: string;
  createdAt: Date;
}

export interface Member {
  id: string;
  gymId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar: string | null;
  subscriptionId: string | null;
  enrolledCourses: string[];
  joinedAt: Date;
}

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  gymId: string;
  maxEntries?: number;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  subscriptionId: string;
  subscriptionName: string;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
}

export interface CourseSchedule {
  day: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;
}

export interface Course {
  id: string;
  gymId: string;
  name: string;
  sport: Sport;
  instructor: string;
  description?: string;
  schedule: CourseSchedule[];
  maxCapacity: number;
  enrolledMembers: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface GymAnnouncement {
  id: string;
  gymId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Instructor {
  id: string;
  gymId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specialties: Sport[];
  avatar: string | null;
  phone?: string;
  email?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

