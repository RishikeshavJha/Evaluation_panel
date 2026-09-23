import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PinPage from './pages/PinPage';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children, requirePin = false }: { children: React.ReactNode, requirePin?: boolean }) {
  const { isLoggedIn, hasEnteredPin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requirePin && !hasEnteredPin) {
    return <Navigate to="/pin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn, hasEnteredPin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isLoggedIn ? (
            hasEnteredPin ? <Navigate to="/dashboard" replace /> : <Navigate to="/pin" replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      <Route 
        path="/pin" 
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : hasEnteredPin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PinPage />
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
