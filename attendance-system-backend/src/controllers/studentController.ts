import type { Request, Response } from 'express';
import prisma from '../prismaClient.js';

/**
 * POST /students/enroll
 * Assign a UID to an existing student
 */
export async function enrollStudent(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, uid } = req.body;

    if (!studentId || !uid) {
      res.status(400).json({ ok: false, error: 'studentId and uid are required' });
      return;
    }

    // Check if UID is already assigned
    const existingStudent = await prisma.student.findUnique({
      where: { uid },
    });

    if (existingStudent) {
      res.status(400).json({ ok: false, error: 'UID is already assigned to another student' });
      return;
    }

    // Update student with UID
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { uid },
    });

    res.json({
      ok: true,
      message: 'Student enrolled successfully',
      student: updatedStudent,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ ok: false, error: 'Student not found' });
      return;
    }
    console.error('Error in enrollStudent:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * GET /students/by-uid/:uid
 * Fetch student data by UID
 */
export async function getStudentByUid(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req.params;

    if (!uid) {
      res.status(400).json({ ok: false, error: 'UID is required' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { uid },
    });

    if (!student) {
      res.status(404).json({ ok: false, error: 'Student not found' });
      return;
    }

    res.json({
      ok: true,
      student,
    });
  } catch (error) {
    console.error('Error in getStudentByUid:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * POST /students
 * Create a new student
 */
export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, uid, batch, password } = req.body;

    if (!name || !email || !batch) {
      res.status(400).json({ ok: false, error: 'name, email, and batch are required' });
      return;
    }

    // Validate batch
    const validBatches = ['B1', 'B2', 'B3', 'B4'];
    if (!validBatches.includes(batch)) {
      res.status(400).json({ ok: false, error: 'batch must be one of: B1, B2, B3, B4' });
      return;
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        batch,
        uid: uid || null,
        attendancePerSubjects: {},
        overallAttendance: 0.0,
        password: password || 'student123',
      },
    });

    res.json({
      ok: true,
      message: 'Student created successfully',
      student,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ ok: false, error: 'Email or UID already exists' });
      return;
    }
    console.error('Error in createStudent:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * GET /students
 * Get all students
 */
export async function getAllStudents(req: Request, res: Response): Promise<void> {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      ok: true,
      students,
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
