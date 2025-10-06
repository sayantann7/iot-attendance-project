import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { studentAPI, type Student } from '@/lib/api';
import { BookOpen, LogOut, Users, Search } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userType !== 'teacher') {
      navigate('/teacher/signin');
      return;
    }
    loadStudents();
  }, [user, userType, navigate]);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.ok) {
        setStudents(response.students);
        setFilteredStudents(response.students);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.batch.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const calculateStats = () => {
    const total = students.length;
    const avgAttendance = total > 0
      ? students.reduce((sum, s) => sum + s.overallAttendance, 0) / total
      : 0;
    const goodStanding = students.filter((s) => s.overallAttendance >= 75).length;

    return { total, avgAttendance, goodStanding };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {user ? (user as any).name : 'Teacher'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Registered in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Attendance</CardDescription>
              <CardTitle className="text-4xl">{stats.avgAttendance.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Across all students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Good Standing</CardDescription>
              <CardTitle className="text-4xl">{stats.goodStanding}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Students with ≥75% attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Attendance Records
                </CardTitle>
                <CardDescription>View and manage student attendance</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading students...</p>
            ) : filteredStudents.length > 0 ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium">Name</th>
                        <th className="p-4 text-left font-medium">Email</th>
                        <th className="p-4 text-left font-medium">Batch</th>
                        <th className="p-4 text-left font-medium">RFID UID</th>
                        <th className="p-4 text-left font-medium">Attendance</th>
                        <th className="p-4 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{student.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">{student.email}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                              {student.batch}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{student.uid || 'Not enrolled'}</td>
                          <td className="p-4 font-medium">{student.overallAttendance.toFixed(1)}%</td>
                          <td className="p-4">
                            {student.overallAttendance >= 75 ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                                Good
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                                Low
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No students found matching your search' : 'No students registered yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
