import type { Request, Response } from 'express';
import prisma from '../prismaClient.js';

/**
 * GET /schedule/:batch
 * Get schedule for a specific batch (B1, B2, B3, or B4)
 */
export async function getScheduleByBatch(req: Request, res: Response): Promise<void> {
  try {
    const { batch } = req.params;

    // Validate batch
    const validBatches = ['B1', 'B2', 'B3', 'B4'];
    if (!batch || !validBatches.includes(batch)) {
      res.status(400).json({ 
        ok: false, 
        error: 'Invalid batch. Must be B1, B2, B3, or B4' 
      });
      return;
    }

    // Fetch schedule from database
    const schedule = await prisma.schedule.findUnique({
      where: { batch: batch as string },
    });

    if (!schedule) {
      res.status(404).json({ 
        ok: false, 
        error: `Schedule not found for batch ${batch}` 
      });
      return;
    }

    res.json({
      ok: true,
      schedule: {
        batch: schedule.batch,
        data: schedule.data,
      },
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch schedule' 
    });
  }
}

/**
 * GET /schedules
 * Get all schedules for all batches
 */
export async function getAllSchedules(req: Request, res: Response): Promise<void> {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { batch: 'asc' },
    });

    res.json({
      ok: true,
      schedules: schedules.map(s => ({
        batch: s.batch,
        data: s.data,
      })),
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to fetch schedules' 
    });
  }
}
