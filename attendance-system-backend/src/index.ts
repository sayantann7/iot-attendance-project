import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAttendance } from './controllers/attendanceController.js';
import {
  enrollStudent,
  getStudentByUid,
  createStudent,
  getAllStudents,
} from './controllers/studentController.js';
import {
  getScheduleByBatch,
  getAllSchedules,
} from './controllers/scheduleController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'ESP32 RFID Attendance System API',
    version: '1.0.0',
  });
});

// Attendance endpoint (ESP32 posts here)
app.post('/attendance', handleAttendance);

// Student endpoints
app.post('/students', createStudent);
app.get('/students', getAllStudents);
app.post('/students/enroll', enrollStudent);
app.get('/students/by-uid/:uid', getStudentByUid);

// Schedule endpoints
app.get('/schedule/:batch', getScheduleByBatch);
app.get('/schedules', getAllSchedules);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 ESP32 endpoint: POST http://localhost:${PORT}/attendance`);
});
