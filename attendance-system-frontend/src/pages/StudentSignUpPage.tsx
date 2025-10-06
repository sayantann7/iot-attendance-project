import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { BookOpen } from 'lucide-react';

export default function StudentSignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    batch: 'B1',
    uid: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.studentSignup({
        name: formData.name,
        email: formData.email,
        batch: formData.batch,
        uid: formData.uid || undefined,
      });

      if (response.ok && response.student) {
        login(response.student, 'student');
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Student Sign Up</CardTitle>
          <CardDescription className="text-center">
            Create your account to start tracking attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <select
                id="batch"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                required
                disabled={loading}
              >
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
                <option value="B4">B4</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uid">RFID Card UID (Optional)</Label>
              <Input
                id="uid"
                placeholder="A0B1C2D3"
                value={formData.uid}
                onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                You can add your RFID card UID later from your dashboard
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/student/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">
                Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
