import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-elite-bg px-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-elite-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-elite-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8 bg-elite-surface p-8 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/40 animate-slide-up">
        {/* Logo */}
        <div className="text-center">
          <img
            className="mx-auto h-20 w-20 object-contain"
            src="/logo.png"
            alt="Logo Torreblanca Melilla CF"
          />
          <h2 className="mt-5 text-2xl font-bold text-white font-heading">
            Panel de Gestión
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Club de Fútbol Femenino Torreblanca
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-elite-accent bg-elite-accent/10 p-3 rounded-xl border border-elite-accent/20 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full bg-elite-bg/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-elite-primary/60 focus:border-elite-primary/40 transition-all text-sm"
                placeholder="admin@club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-elite-bg/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-elite-primary/60 focus:border-elite-primary/40 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-elite-primary hover:bg-elite-primary-hover text-white text-sm font-semibold rounded-xl shadow-lg shadow-elite-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-heading uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
