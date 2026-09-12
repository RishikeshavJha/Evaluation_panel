import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PinPage from './pages/PinPage';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children, requirePin = false }: { children: React.ReactNode, requirePin?: boolean }) {
  const { isLoggedIn, hasEnteredPin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requirePin && !hasEnteredPin) {
    return <Navigate to="/pin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn, hasEnteredPin } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/pin" replace /> : <LoginPage />} 
      />
      <Route 
        path="/pin" 
        element={
          hasEnteredPin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ProtectedRoute>
              <PinPage />
            </ProtectedRoute>
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requirePin={true}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
