import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ServicesListingPage from './pages/ServicesListingPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ExpertsPage from './pages/ExpertsPage';
import MessagingPage from './pages/MessagingPage';
import ProviderDashboard from './pages/ProviderDashboard';
import ProfilePage from './pages/ProfilePage';
import EnterprisePage from './pages/EntreprisePage';
import { authApi } from './api/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authApi.getCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

const ProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = authApi.getCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'PROVIDER') return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"           element={<LoginView />} />
        <Route path="/register"        element={<RegisterView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/services"        element={<ServicesListingPage />} />
        <Route path="/services/:id"    element={<ServiceDetailPage />} />
        <Route path="/experts"         element={<ExpertsPage />} />
        <Route path="/enterprise"      element={<EnterprisePage />} />
        <Route path="/browse"          element={<BrowsePage />} />   {/* ✅ NEW */}

        {/* ── Protected routes ── */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProviderRoute><ProviderDashboard /></ProviderRoute>} />
        <Route path="/messages"  element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
        <Route path="/messages/:partnerId" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />

        {/* ── Provider route ── */}
        <Route path="/provider" element={<ProviderRoute><ProviderDashboard /></ProviderRoute>} />

        {/* ── Homepage & fallback ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;