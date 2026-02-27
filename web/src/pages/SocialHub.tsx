import React, { useState, useEffect } from 'react';
import { socialLinkService, SocialLinks } from '../services/socialLinkService';
import { authService } from '../services/authService';
import { Edit2, Save, AlertCircle, X } from 'lucide-react';

const SocialHub: React.FC = () => {
  const [links, setLinks] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ instagramUrl: '', facebookUrl: '', youtubeUrl: '', twitterUrl: '' });
  const [saving, setSaving] = useState(false);

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await socialLinkService.getLinks();
      setLinks(data);
      setEditData({
        instagramUrl: data.instagramUrl || '',
        facebookUrl: data.facebookUrl || '',
        youtubeUrl: data.youtubeUrl || '',
        twitterUrl: data.twitterUrl || ''
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los enlaces sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await socialLinkService.updateLinks(editData);
      setLinks({ ...links!, ...updated });
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los enlaces');
    } finally {
      setSaving(false);
    }
  };

  const socialCards = [
    {
      name: 'Instagram',
      urlKey: 'instagramUrl' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    },
    {
      name: 'Facebook',
      urlKey: 'facebookUrl' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      ),
      color: 'bg-blue-600',
    },
    {
      name: 'YouTube',
      urlKey: 'youtubeUrl' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768 1.56.418 7.814.418 7.814.418s6.254 0 7.814-.418c.861-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM10 15.464V8.536L16 12l-6 3.464z"/>
        </svg>
      ),
      color: 'bg-red-600',
    },
    {
      name: 'X (Twitter)',
      urlKey: 'twitterUrl' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-gray-800',
    }
  ];

  // Filter out cards with empty URLs (unless in editing mode)
  const visibleCards = isEditing
    ? socialCards
    : socialCards.filter(card => links && links[card.urlKey]);

  if (loading) {
    return (
      <div className="elite-bg p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="elite-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-inter text-white tracking-tight mb-4">
            Social Hub
          </h1>
          <p className="text-lg text-gray-400 font-outfit">
            Conecta con nosotros a través de nuestras redes sociales oficiales.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Edit Button */}
        {isAdmin && !isEditing && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Editar Enlaces
            </button>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Configurar Enlaces Sociales</h2>
            {socialCards.map(card => (
              <div key={card.urlKey} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-white font-medium w-28 flex-shrink-0">{card.name}:</label>
                <input
                  type="url"
                  placeholder={`https://${card.name.toLowerCase().replace(/\s.*/, '')}.com/...`}
                  value={editData[card.urlKey]}
                  onChange={e => setEditData({ ...editData, [card.urlKey]: e.target.value })}
                  className="flex-1 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (links) {
                    setEditData({
                      instagramUrl: links.instagramUrl || '',
                      facebookUrl: links.facebookUrl || '',
                      youtubeUrl: links.youtubeUrl || '',
                      twitterUrl: links.twitterUrl || ''
                    });
                  }
                }}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Social Cards */}
        {visibleCards.length === 0 && !isEditing ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No hay enlaces sociales configurados aún.</p>
            {isAdmin && <p className="text-sm mt-2">Haz clic en "Editar Enlaces" para añadir las URLs de tus redes sociales.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleCards.map((card) => {
              const url = links ? links[card.urlKey] : '';
              if (!url && !isEditing) return null;
              return (
                <a
                  key={card.name}
                  href={url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`elite-surface rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] group ${!url ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white mb-6 transform transition-transform duration-500 group-hover:rotate-12 ${card.color}`}>
                    {card.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white font-inter">
                    {card.name}
                  </h2>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;
