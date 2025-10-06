# 🧠 ESP32 RFID Attendance System

A frictionless attendance management backend built with **Node.js (TypeScript)**, **Express**, and **Prisma** — designed for an IoT setup where an **ESP32 with an RFID reader** sends student check-ins and check-outs to this backend.  
This project intentionally has **no device authentication** layer for simplicity.

---

## 🚀 Features
- Type-safe **TypeScript** backend using Prisma ORM.
- **Three core models**: Teacher, Student, Schedule.
- Students must both **check in and check out** during a class to earn attendance.
- Attendance is tracked **per subject** with structure:
  ```json
  {
    "Math": { "total": 10, "present": 8, "attendance": 80.0 },
    "Physics": { "total": 12, "present": 11, "attendance": 91.6 }
  }
  ```
- Automatically updates `overallAttendance` and `lastChecked`.
- Lightweight Express API, ideal for EC2 deployment.

---

## 🧩 Architecture
**Flow Overview**

```
ESP32 → /attendance → Express (TS) → Prisma ORM → PostgreSQL
```

1. ESP32 reads RFID tag (UID) and posts JSON:
   ```json
   {
     "uid": "A0B1C2D3",
     "device_id": "esp32-01"
   }
   ```
2. Backend identifies the student, determines the current class based on the schedule, and decides:
   - If first tap = **check-in**.
   - If second tap = **check-out**, mark attendance for that class.
3. Database updates:
   - Subject-wise attendance.
   - Overall attendance.
   - `lastChecked` info.

---

## 🗃️ Database Schema
### Student
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | String | Student's name |
| email | String | Unique |
| uid | String | RFID tag UID |
| attendancePerSubjects | JSON | `{ "subject": { total, present, attendance } }` |
| overallAttendance | Float | Aggregate % |
| lastChecked | JSON | `{ action, subject, classStart, classEnd, ts }` |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Teacher
| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | String | Teacher name |
| email | String | Unique |
| password | String | Hashed password |
| subject | String | Subject handled |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Schedule
Single row containing weekly class data:
```json
{
  "Monday": [
    { "subject": "Math", "start": "09:00", "end": "09:50" },
    { "subject": "Physics", "start": "10:00", "end": "10:50" }
  ],
  "Tuesday": []
}
```

---

## 🧰 Tech Stack
- **Node.js (TypeScript)** — server
- **Express.js** — routing
- **Prisma ORM** — database mapping
- **PostgreSQL** — data store
- **EC2** — deployment target

---

## 🛠️ Setup

### 1️⃣ Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### 2️⃣ Clone & Install
```bash
git clone https://github.com/your-repo/attendance-ts.git
cd attendance-ts
npm install
```

### 3️⃣ Configure Environment
Create `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/attendance_db"
PORT=4000
LATE_WINDOW_MINUTES=10
```

### 4️⃣ Prisma Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5️⃣ Seed Database
```bash
npm run seed
```

---

## 🧪 Run Locally
```bash
npm run dev
```
Server runs on **http://localhost:4000**

Endpoints:
- `POST /attendance` — ESP32 calls this.
- `POST /students/enroll` — Assign a UID to a student.
- `GET /students/by-uid/:uid` — Fetch student details.

---

## 🌍 Deploying to EC2
1. Install Node.js and PostgreSQL on EC2.
2. Upload project via git or SCP.
3. Set up `.env`.
4. Install dependencies:
   ```bash
   npm ci
   npx prisma migrate deploy
   pm2 start dist/server.js --name attendance
   ```
5. Optionally set up Nginx reverse proxy for HTTPS.

---

## ⚙️ Future Enhancements
- Add teacher dashboard (React).
- Add device authentication for production.
- Implement per-day attendance analytics.
- Add class-wise absence tracking automation.

---

## 🧑‍💻 Developer Notes
- **Type Safety**: All controllers use `Prisma.Student` types from the generated client.
- **Time Calculations**: Late window controlled by `LATE_WINDOW_MINUTES`.
- **Security**: Open endpoint (no device auth) for rapid prototyping.
- **Next step**: Integrate JWT-based teacher authentication if needed.