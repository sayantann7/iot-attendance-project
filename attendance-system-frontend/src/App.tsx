import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Pages
import HomePage from '@/pages/HomePage';
import StudentSignInPage from '@/pages/StudentSignInPage';
import StudentSignUpPage from '@/pages/StudentSignUpPage';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import TeacherSignInPage from '@/pages/TeacherSignInPage';
import TeacherSignUpPage from '@/pages/TeacherSignUpPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Student Routes */}
          <Route path="/student/signin" element={<StudentSignInPage />} />
          <Route path="/student/signup" element={<StudentSignUpPage />} />
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/signin" element={<TeacherSignInPage />} />
          <Route path="/teacher/signup" element={<TeacherSignUpPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

