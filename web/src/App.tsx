import { Routes, Route, Navigate, Link } from 'react-router-dom';
import EventsPanel from './components/events/EventsPanel';
import { Treasury } from './pages/Treasury';
import { DashboardPanel } from './pages/DashboardPanel';
import NotificationsPanel from './pages/NotificationsPanel';
import UsersPanel from './pages/UsersPanel';

function App() {
  return (
    <div className="min-h-screen border-t-4 border-indigo-600">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
            <img src="/logo.png" alt="Logo Torreblanca Melilla CF" className="h-12 w-auto object-contain rounded-md" />
            TORREBLANCA MELILLA C.F
          </h1>
          <nav className="flex space-x-4">
             <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
             <Link to="/events" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Eventos</Link>
             <Link to="/directory" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Directorio</Link>
             <Link to="/treasury" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Tesorería</Link>
             <Link to="/notifications" className="text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Notificaciones</Link>
          </nav>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0 bg-gray-50 min-h-[calc(100vh-10rem)] rounded-xl">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPanel />} />
              <Route path="/directory" element={<UsersPanel />} />
              <Route path="/events" element={<EventsPanel />} />
              <Route path="/treasury" element={<Treasury />} />
              <Route path="/notifications" element={<NotificationsPanel />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
