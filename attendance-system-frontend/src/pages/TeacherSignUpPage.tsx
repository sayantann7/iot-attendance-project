import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function TeacherSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Teacher Sign Up</CardTitle>
          <CardDescription className="text-center">
            Contact administrator to create a teacher account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Teacher accounts are created by system administrators. Please contact your institution's admin to set up your account.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/teacher/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>

          <div className="text-center">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
