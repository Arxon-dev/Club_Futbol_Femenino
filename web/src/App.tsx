import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Treasury } from './pages/Treasury';
import { DashboardPanel } from './pages/DashboardPanel';
import NotificationsPanel from './pages/NotificationsPanel';
import UsersPanel from './pages/UsersPanel';
import PresidentLetterPage from './pages/PresidentLetter';
import MatchHubPage from './pages/MatchHub';
import SocialHubPage from './pages/SocialHub';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import { authService } from './services/authService';

import React from 'react';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuth = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPanel /></ProtectedRoute>} />
        <Route path="/president-letter" element={<ProtectedRoute><PresidentLetterPage /></ProtectedRoute>} />
        <Route path="/match-hub" element={<ProtectedRoute><MatchHubPage /></ProtectedRoute>} />
        <Route path="/social-hub" element={<ProtectedRoute><SocialHubPage /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><UsersPanel /></ProtectedRoute>} />
        <Route path="/treasury" element={<ProtectedRoute><Treasury /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPanel /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

export default App;
