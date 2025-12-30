import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ErrorPage from './pages/ErrorPage';

// Component สำหรับป้องกันการเข้าหน้า Dashboard โดยไม่ Login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// App Routes Component (ต้องอยู่ภายใน AuthProvider)
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* หน้าแรก: ถ้า Login แล้วไป Dashboard เลย */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Welcome />} />
      
      {/* หน้า Login: ถ้า Login แล้วไม่ต้องให้เข้าซ้ำ */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* หน้า Dashboard: ต้องผ่านการตรวจสอบสิทธิ์ก่อน */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* หน้าแจ้งเตือนสิทธิ์ (403 Forbidden): เรียกใช้เวลาคนแอบเข้าหน้า Admin */}
      <Route path="/unauthorized" element={<ErrorPage type="403" />} />

      {/* หน้า 404 Not Found: ดักจับ URL มั่วๆ ทั้งหมดที่ไม่มีใน Routes */}
      <Route path="/404" element={<ErrorPage type="404" />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;