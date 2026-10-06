import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { NewAdvisory } from './pages/NewAdvisory';
import { AdvisoryDetail } from './pages/AdvisoryDetail';
import { DiagnosticsScanner } from './pages/DiagnosticsScanner';
import { DiagnosticsDetail } from './pages/DiagnosticsDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="plots" element={<div>Plot Manager Placeholder</div>} />
        <Route path="plots/:id" element={<div>Plot Detail Placeholder</div>} />
        <Route path="advisory/new" element={<NewAdvisory />} />
        <Route path="advisory/:id" element={<AdvisoryDetail />} />
        <Route path="diagnostics/scan" element={<DiagnosticsScanner />} />
        <Route path="diagnostics/:id" element={<DiagnosticsDetail />} />
        <Route path="settings" element={<div>Settings Placeholder</div>} />
      </Route>
    </Routes>
  );
}

export default App;
