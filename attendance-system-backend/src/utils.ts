import type { AttendancePerSubjects, ClassSlot, DayOfWeek, WeeklySchedule } from './types.js';

/**
 * Get current day of week as string
 */
export function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()] as DayOfWeek;
}

/**
 * Parse HH:MM time string and combine with today's date
 */
export function parseTodayTime(timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr ?? '0', 10);
  const minutes = parseInt(minutesStr ?? '0', 10);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

/**
 * Find the current class based on schedule and current time
 */
export function findCurrentClass(schedule: WeeklySchedule, lateWindowMinutes: number): ClassSlot | null {
  const day = getCurrentDay();
  const classes = schedule[day];
  
  if (!classes || classes.length === 0) {
    return null;
  }

  const now = new Date();
  
  for (const cls of classes) {
    const classStart = parseTodayTime(cls.start);
    const classEnd = parseTodayTime(cls.end);
    const lateWindowEnd = new Date(classStart.getTime() + lateWindowMinutes * 60000);

    // Check if we're within the class time window (start to end + late window)
    if (now >= classStart && now <= classEnd) {
      return cls;
    }
  }

  return null;
}

/**
 * Check if current time is within check-in window (class start to start + late window)
 */
export function isWithinCheckinWindow(classStartTime: string, lateWindowMinutes: number): boolean {
  const now = new Date();
  const classStart = parseTodayTime(classStartTime);
  const lateWindowEnd = new Date(classStart.getTime() + lateWindowMinutes * 60000);

  return now >= classStart && now <= lateWindowEnd;
}

/**
 * Check if current time is after class end (eligible for checkout)
 */
export function isAfterClassEnd(classEndTime: string): boolean {
  const now = new Date();
  const classEnd = parseTodayTime(classEndTime);
  return now >= classEnd;
}

/**
 * Calculate overall attendance across all subjects
 * Weighted average based on total classes per subject
 */
export function calculateOverallAttendance(attendancePerSubjects: AttendancePerSubjects): number {
  const subjects = Object.keys(attendancePerSubjects);
  
  if (subjects.length === 0) {
    return 0.0;
  }

  let totalClasses = 0;
  let totalPresent = 0;

  for (const subject of subjects) {
    const data = attendancePerSubjects[subject];
    if (data) {
      totalClasses += data.total;
      totalPresent += data.present;
    }
  }

  if (totalClasses === 0) {
    return 0.0;
  }

  return (totalPresent / totalClasses) * 100;
}

/**
 * Count how many times a subject appears in the schedule between two dates
 * For simplicity, this counts occurrences in the weekly schedule
 */
export function countScheduledClasses(schedule: WeeklySchedule, subject: string): number {
  let count = 0;
  
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (const day of days) {
    const classes = schedule[day];
    if (classes) {
      count += classes.filter(cls => cls.subject === subject).length;
    }
  }

  return count;
}
