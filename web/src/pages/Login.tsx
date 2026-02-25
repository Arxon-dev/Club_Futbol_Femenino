import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

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
      // Login exitoso, redirigimos al dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f12] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#1a1d24] p-8 rounded-2xl shadow-xl border border-gray-800">
        <div>
          <img
            className="mx-auto h-24 w-auto object-contain rounded-xl"
            src="/logo.png"
            alt="Logo Torreblanca Melilla CF"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-outfit">
            Acceso Panel Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400 font-inter">
            Club de Fútbol Femenino
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input type="hidden" name="remember" defaultValue="true" />
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-gray-300 font-medium text-sm">Correo Electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-[#ED1C24] focus:border-[#ED1C24] focus:z-10 sm:text-sm transition-colors duration-200 mt-1"
                placeholder="admin@opomelilla.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-300 font-medium text-sm">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-[#ED1C24] focus:border-[#ED1C24] focus:z-10 sm:text-sm transition-colors duration-200 mt-1"
                placeholder="Tu contraseña secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading ? 'bg-gray-600' : 'bg-[#ED1C24] hover:bg-[#DE2D44] focus:ring-2 focus:ring-offset-2 focus:ring-[#ED1C24] focus:ring-offset-gray-900'} transition-all duration-200 uppercase tracking-wider font-outfit`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
