// Type definitions for JSON fields in Prisma schema

export interface SubjectAttendance {
  total: number;
  present: number;
  attendance: number; // percentage
}

export interface AttendancePerSubjects {
  [subject: string]: SubjectAttendance;
}

export interface LastChecked {
  action: 'checkin' | 'checkout';
  subject: string;
  classStart: string; // ISO timestamp
  classEnd: string; // ISO timestamp
  ts: string; // ISO timestamp of the tap
}

export interface ClassSlot {
  subject: string;
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface WeeklySchedule {
  Monday?: ClassSlot[];
  Tuesday?: ClassSlot[];
  Wednesday?: ClassSlot[];
  Thursday?: ClassSlot[];
  Friday?: ClassSlot[];
  Saturday?: ClassSlot[];
  Sunday?: ClassSlot[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
