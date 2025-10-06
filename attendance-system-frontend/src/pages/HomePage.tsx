import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Attendance System</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/student/signin">
              <Button variant="ghost">Student Login</Button>
            </Link>
            <Link to="/teacher/signin">
              <Button variant="ghost">Teacher Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-[#2563EB]">
          Smart RFID Attendance System
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Effortless attendance tracking with IoT-powered RFID technology. Check-in and check-out seamlessly for accurate records.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/student/signup">
            <Button size="lg" className="text-lg">
              Student Sign Up
            </Button>
          </Link>
          <Link to="/teacher/signup">
            <Button size="lg" variant="outline" className="text-lg">
              Teacher Sign Up
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant check-in and check-out with RFID cards. No manual entry required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Accurate Records</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated attendance calculation per subject with overall percentage tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Batch Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for multiple batches (B1-B4) with individual schedules for each.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Dashboard Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive dashboards for students and teachers to monitor attendance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-lg my-16">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h4 className="font-semibold mb-2">Check-In</h4>
            <p className="text-sm text-muted-foreground">
              Tap your RFID card when class starts (within late window)
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h4 className="font-semibold mb-2">Attend Class</h4>
            <p className="text-sm text-muted-foreground">
              System tracks your presence throughout the class session
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h4 className="font-semibold mb-2">Check-Out</h4>
            <p className="text-sm text-muted-foreground">
              Tap again after class ends to confirm attendance
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 RFID Attendance System. Built with React & shadcn/ui.</p>
        </div>
      </footer>
    </div>
  );
}
