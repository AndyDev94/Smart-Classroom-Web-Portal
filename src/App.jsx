import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import GenerateTimetable from './pages/GenerateTimetable';
import TimetableViewer from './pages/TimetableViewer';
import Attendance from './pages/Attendance';
import AttendanceReports from './pages/AttendanceReports';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Guide from './pages/Guide';

// Simple protected route helper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Redirect to app if already logged in
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* Protected Routes inside the Layout */}
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="master-data" element={<MasterData />} />
              <Route path="generate" element={<GenerateTimetable />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="attendance-reports" element={<AttendanceReports />} />
              <Route path="timetable/:id" element={<TimetableViewer />} />
              <Route path="guide" element={<Guide />} />
            </Route>

            {/* Default Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppDataProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
