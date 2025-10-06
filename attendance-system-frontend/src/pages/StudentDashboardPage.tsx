import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { Student, WeeklySchedule, ScheduleClass } from '@/lib/api';
import { scheduleAPI } from '@/lib/api';
import { BookOpen, LogOut, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userType !== 'student') {
      navigate('/student/signin');
      return;
    }
    const currentStudent = user as Student;
    setStudent(currentStudent);
    
    // Fetch schedule for the student's batch
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await scheduleAPI.getByBatch(currentStudent.batch);
        setSchedule(response.schedule.data);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [user, userType, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const attendanceData = student.attendancePerSubjects;
  const subjects = Object.keys(attendanceData);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-sm text-muted-foreground">Batch {student.batch}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overall Attendance</CardDescription>
              <CardTitle className="text-4xl">{student.overallAttendance.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {student.overallAttendance >= 75 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Good Standing</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">Below Required</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>RFID Card</CardDescription>
              <CardTitle className="text-lg">{student.uid || 'Not Enrolled'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {student.uid ? 'Card is active' : 'Please enroll your RFID card'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Last Activity</CardDescription>
              <CardTitle className="text-lg">
                {student.lastChecked?.action === 'checkin' ? 'Checked In' : 'Checked Out'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {student.lastChecked
                  ? `${student.lastChecked.subject} - ${new Date(student.lastChecked.ts).toLocaleString()}`
                  : 'No recent activity'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Attendance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const data = attendanceData[subject];
                  if (!data) return null;
                  const percentage = data.attendance;
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm text-muted-foreground">
                          {data.present}/{data.total} classes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 75 ? 'bg-green-500' : 'bg-destructive'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No attendance data yet. Start attending classes!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule - Batch {student.batch}
            </CardTitle>
            <CardDescription>Your class timetable</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading schedule...</p>
            ) : !schedule ? (
              <p className="text-center text-muted-foreground py-8">No schedule available</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(schedule).map(([day, classes]: [string, ScheduleClass[]]) => (
                  <div key={day} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold mb-3">{day}</h4>
                    {classes.length > 0 ? (
                      <div className="grid gap-2">
                        {classes.map((cls: ScheduleClass, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cls.subject}</span>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {cls.start} - {cls.end}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No classes</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
