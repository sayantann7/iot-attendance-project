import type { Request, Response } from 'express';
import prisma from '../prismaClient.js';
import type { AttendancePerSubjects, LastChecked, WeeklySchedule } from '../types.js';
import {
  findCurrentClass,
  isWithinCheckinWindow,
  isAfterClassEnd,
  calculateOverallAttendance,
  parseTodayTime,
} from '../utils.js';

const LATE_WINDOW_MINUTES = parseInt(process.env.LATE_WINDOW_MINUTES ?? '10', 10);

/**
 * POST /attendance
 * ESP32 sends UID and optional device_id
 * Handles check-in and check-out logic
 */
export async function handleAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { uid, device_id } = req.body;

    console.log('Received attendance request:', { uid, device_id });

    if (!uid) {
      res.status(400).json({ ok: false, error: 'UID is required' });
      return;
    }

    // Find student by UID
    const student = await prisma.student.findUnique({
      where: { uid },
    });

    if (!student) {
      res.status(404).json({ ok: false, error: 'Student not found with this UID' });
      return;
    }

    // Get schedule for student's batch
    const scheduleRecord = await prisma.schedule.findUnique({
      where: { batch: student.batch },
    });

    if (!scheduleRecord) {
      res.status(500).json({ ok: false, error: `Schedule not configured for batch ${student.batch}` });
      return;
    }

    const schedule = scheduleRecord.data as WeeklySchedule;

    const lastChecked = student.lastChecked as LastChecked | null;
    const attendancePerSubjects = (student.attendancePerSubjects as unknown) as AttendancePerSubjects;
    const now = new Date();

    // PRIORITY 1: Check if user has an active check-in that needs checkout
    if (lastChecked && lastChecked.action === 'checkin') {
      // User has checked in previously, check if they can check out
      const checkedInClassEnd = new Date(lastChecked.classEnd);
      
      if (now >= checkedInClassEnd) {
        // Time to check out from the previous class
        const subject = lastChecked.subject;

        // Initialize subject attendance if not exists
        if (!attendancePerSubjects[subject]) {
          attendancePerSubjects[subject] = {
            total: 0,
            present: 0,
            attendance: 0,
          };
        }

        const subjectData = attendancePerSubjects[subject];
        if (subjectData) {
          subjectData.present += 1;
          subjectData.total += 1;
          subjectData.attendance = (subjectData.present / subjectData.total) * 100;
        }

        const newOverallAttendance = calculateOverallAttendance(attendancePerSubjects);

        const newLastChecked: LastChecked = {
          action: 'checkout',
          subject: subject,
          classStart: lastChecked.classStart,
          classEnd: lastChecked.classEnd,
          ts: now.toISOString(),
        };

        const updatedStudent = await prisma.student.update({
          where: { id: student.id },
          data: {
            attendancePerSubjects: attendancePerSubjects as any,
            overallAttendance: newOverallAttendance,
            lastChecked: newLastChecked as any,
          },
        });

        res.json({
          ok: true,
          event: 'checkout',
          message: `Checked out from ${subject}. Attendance recorded.`,
          student: updatedStudent,
        });
        return;
      } else {
        // User tried to check out before class end time
        res.status(400).json({
          ok: false,
          error: `Class has not ended yet. Please wait until ${new Date(lastChecked.classEnd).toLocaleTimeString()} to check out.`,
        });
        return;
      }
    }

    // PRIORITY 2: No active check-in, look for current class to check in
    // Find current class
    const currentClass = findCurrentClass(schedule, LATE_WINDOW_MINUTES);

    if (!currentClass) {
      res.status(400).json({
        ok: false,
        error: 'No class scheduled at this time',
      });
      return;
    }

    const classStart = parseTodayTime(currentClass.start);
    const classEnd = parseTodayTime(currentClass.end);

    // At this point, user either hasn't checked in or previous session ended -> CHECK-IN
    if (!isWithinCheckinWindow(currentClass.start, LATE_WINDOW_MINUTES)) {
      res.status(400).json({
        ok: false,
        error: 'Check-in window has expired (late window exceeded)',
      });
      return;
    }

    const newLastChecked: LastChecked = {
      action: 'checkin',
      subject: currentClass.subject,
      classStart: classStart.toISOString(),
      classEnd: classEnd.toISOString(),
      ts: now.toISOString(),
    };

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        lastChecked: newLastChecked as any,
      },
    });

    res.json({
      ok: true,
      event: 'checkin',
      message: `Checked in for ${currentClass.subject}`,
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error in handleAttendance:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
