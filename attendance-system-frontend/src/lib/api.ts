import axios from 'axios';

const API_URL = 'http://iot-attendance-be.sayantan.space/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Student {
  id: string;
  name: string;
  email: string;
  uid: string | null;
  batch: string;
  attendancePerSubjects: Record<string, {
    total: number;
    present: number;
    attendance: number;
  }>;
  overallAttendance: number;
  lastChecked: {
    action: 'checkin' | 'checkout';
    subject: string;
    classStart: string;
    classEnd: string;
    ts: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleClass {
  subject: string;
  start: string;
  end: string;
}

export interface WeeklySchedule {
  Monday: ScheduleClass[];
  Tuesday: ScheduleClass[];
  Wednesday: ScheduleClass[];
  Thursday: ScheduleClass[];
  Friday: ScheduleClass[];
}

export interface Schedule {
  batch: string;
  data: WeeklySchedule;
}

// Auth APIs
export const authAPI = {
  // Student login (by email)
  studentLogin: async (email: string) => {
    // Since backend doesn't have /students/by-email, we'll get all and filter
    const response = await api.get<{ ok: boolean; students: Student[] }>('/students');
    const student = response.data.students.find(s => s.email === email);
    if (student) {
      return { ok: true, student };
    }
    throw new Error('Student not found');
  },

  // Student signup
  studentSignup: async (data: { name: string; email: string; batch: string; uid?: string }) => {
    const response = await api.post<{ ok: boolean; student: Student }>('/students', data);
    return response.data;
  },

  // Teacher login (simplified - in real app, use JWT)
  teacherLogin: async (email: string, _password: string) => {
    // This is a placeholder - backend doesn't have teacher endpoints yet
    // For now, return mock data
    return {
      ok: true,
      teacher: {
        id: '1',
        name: 'Teacher',
        email,
        subject: 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
};

// Student APIs
export const studentAPI = {
  getByUid: async (uid: string) => {
    const response = await api.get<{ ok: boolean; student: Student }>(`/students/by-uid/${uid}`);
    return response.data;
  },

  enroll: async (studentId: string, uid: string) => {
    const response = await api.post<{ ok: boolean; student: Student }>('/students/enroll', {
      studentId,
      uid,
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<{ ok: boolean; students: Student[] }>('/students');
    return response.data;
  },
};

// Attendance APIs
export const attendanceAPI = {
  recordAttendance: async (uid: string, device_id?: string) => {
    const response = await api.post<{
      ok: boolean;
      event: 'checkin' | 'checkout';
      message: string;
      student: Student;
    }>('/attendance', { uid, device_id });
    return response.data;
  },
};

// Schedule APIs
export const scheduleAPI = {
  getByBatch: async (batch: string) => {
    const response = await api.get<{ ok: boolean; schedule: Schedule }>(`/schedule/${batch}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<{ ok: boolean; schedules: Schedule[] }>('/schedules');
    return response.data;
  },
};

export default api;
