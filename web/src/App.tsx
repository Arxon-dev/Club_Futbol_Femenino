import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Treasury } from './pages/Treasury';
import { DashboardPanel } from './pages/DashboardPanel';
import NotificationsPanel from './pages/NotificationsPanel';
import UsersPanel from './pages/UsersPanel';
import PresidentLetterPage from './pages/PresidentLetter';
import MatchHubPage from './pages/MatchHub';
import SocialHubPage from './pages/SocialHub';
import Login from './pages/Login';
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
  const navigate = useNavigate();
  const isAuth = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen border-t-4 border-indigo-600">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
            <img src="/logo.png" alt="Logo Torreblanca Melilla CF" className="h-12 w-auto object-contain rounded-md" />
            TORREBLANCA MELILLA C.F
          </h1>
          <nav className="flex items-center space-x-4">
             <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
             <Link to="/directory" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Directorio</Link>
             <Link to="/president-letter" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Carta Presidente</Link>
             <Link to="/match-hub" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Partidos</Link>
             <Link to="/social-hub" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Social Hub</Link>
             <Link to="/treasury" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Tesorería</Link>
             <Link to="/notifications" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Notificaciones</Link>
             <button onClick={handleLogout} className="ml-4 text-sm font-medium text-red-600 hover:text-red-800 border pl-4 border-transparent border-l-gray-300">
               Cerrar Sesión
             </button>
          </nav>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0 bg-gray-50 min-h-[calc(100vh-10rem)] rounded-xl">
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
