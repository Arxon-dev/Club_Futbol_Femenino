import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  LayoutDashboard,
  Users,
  FileText,
  Trophy,
  Share2,
  Wallet,
  Bell,
  Newspaper,
  UsersRound,
  MessageCircle,
  ShoppingBag,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/directory', label: 'Directorio', icon: <Users className="w-5 h-5" /> },
  { path: '/president-letter', label: 'Carta Presidente', icon: <FileText className="w-5 h-5" /> },
  { path: '/match-hub', label: 'Partidos', icon: <Trophy className="w-5 h-5" /> },
  { path: '/social-hub', label: 'Social Hub', icon: <Share2 className="w-5 h-5" /> },
  { path: '/news', label: 'Noticias', icon: <Newspaper className="w-5 h-5" /> },
  { path: '/roster', label: 'Plantilla', icon: <UsersRound className="w-5 h-5" /> },
  { path: '/chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
  { path: '/merchandising', label: 'Tienda', icon: <ShoppingBag className="w-5 h-5" /> },
  { path: '/treasury', label: 'Tesorería', icon: <Wallet className="w-5 h-5" /> },
  { path: '/notifications', label: 'Notificaciones', icon: <Bell className="w-5 h-5" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white font-heading truncate leading-tight">TORREBLANCA</h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wider">MELILLA C.F</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive(item.path)
                ? 'bg-elite-primary/15 text-elite-primary-hover border-l-[3px] border-elite-primary ml-0 pl-[9px]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
              }`}
          >
            <span className={`transition-colors ${isActive(item.path) ? 'text-elite-primary-hover' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-elite-accent hover:bg-elite-accent/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-elite-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[240px] bg-elite-surface border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-elite-surface border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-elite-surface/80 backdrop-blur-md border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 rounded object-contain" />
            <span className="text-sm font-bold text-white font-heading">TORREBLANCA</span>
          </div>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
