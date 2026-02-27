import React, { useState, useEffect } from 'react';
import { presidentLetterService, PresidentLetter } from '../services/presidentLetterService';
import { authService } from '../services/authService';
import { FileText, Edit2, Save, AlertCircle } from 'lucide-react';

const PresidentLetterPage: React.FC = () => {
  const [letter, setLetter] = useState<PresidentLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchLetter();
  }, []);

  const fetchLetter = async () => {
    try {
      setLoading(true);
      const data = await presidentLetterService.getLetter();
      setLetter(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la carta del presidente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedLetter = await presidentLetterService.updateLetter(editTitle, editContent);
      setLetter(updatedLetter);
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (letter) {
      setEditTitle(letter.title);
      setEditContent(letter.content);
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Carta del Presidente</h1>
          <p className="text-gray-400">Mensaje oficial de la presidencia del club.</p>
        </div>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-medium transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Editar Carta
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="elite-card">
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-elite-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Título de la carta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contenido</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={15}
                className="w-full bg-elite-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-serif resize-y"
                placeholder="Escribe el contenido de la carta aquí..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(202,240,15,0.3)] hover:shadow-[0_0_25px_rgba(202,240,15,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(202,240,15,0.3)]"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-primary max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-white text-center font-serif flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              {letter?.title || 'Sin título'}
            </h2>
            <div className="whitespace-pre-wrap text-gray-300 font-serif leading-relaxed text-lg mb-8 text-center sm:text-left">
              {letter?.content || 'No hay contenido disponible.'}
            </div>
            {letter?.updatedAt && (
              <div className="text-right text-sm text-gray-500 italic mt-8 pt-6 border-t border-white/5">
                Última actualización: {new Date(letter.updatedAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresidentLetterPage;
