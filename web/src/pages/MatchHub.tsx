import React, { useState, useEffect } from 'react';
import { matchService, Match } from '../services/matchService';
import { authService } from '../services/authService';
import { Calendar, MapPin, Trophy, Plus, Edit2, Trash2, AlertCircle, Shield, X, Save } from 'lucide-react';

const MatchHubPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Match>>({
    date: new Date().toISOString().slice(0, 16),
    opponentName: '',
    opponentLogoUrl: '',
    location: 'Local',
    result: 'Pendiente',
    competition: 'Liga'
  });

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await matchService.getAllMatches();
      setMatches(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los partidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      setFormData({
        date: new Date(match.date).toISOString().slice(0, 16),
        opponentName: match.opponentName,
        opponentLogoUrl: match.opponentLogoUrl || '',
        location: match.location,
        result: match.result || 'Pendiente',
        competition: match.competition
      });
    } else {
      setEditingMatch(null);
      setFormData({
        date: new Date().toISOString().slice(0, 16),
        opponentName: '',
        opponentLogoUrl: '',
        location: 'Local',
        result: 'Pendiente',
        competition: 'Liga'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMatch(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const matchToSave = {
        ...formData,
        date: new Date(formData.date!).toISOString()
      };

      if (editingMatch) {
        await matchService.updateMatch(editingMatch.id, matchToSave);
      } else {
        await matchService.createMatch(matchToSave);
      }
      
      await fetchMatches();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el partido.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      try {
        await matchService.deleteMatch(id);
        await fetchMatches();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el partido.');
      }
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Match Hub</h1>
          <p className="text-gray-400">Calendario de partidos y resultados.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(202,240,15,0.3)] hover:shadow-[0_0_20px_rgba(202,240,15,0.4)]"
          >
            <Plus className="w-5 h-5" />
            Añadir Partido
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {matches.length === 0 && !loading && !error && (
        <div className="elite-card text-center py-12">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No hay partidos programados</h3>
          <p className="text-gray-400">Los próximos enfrentamientos aparecerán aquí.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <div key={match.id} className="elite-card flex flex-col group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(202,240,15,0.1)]">
            {/* Contenedor Superior (Fondo logo o patrón) */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Shield className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              {/* Encabezado: Competición y Botones Admin */}
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-primary uppercase tracking-wider">
                  {match.competition}
                </span>
                
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(match)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(match.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Contenido Central: Oponente */}
              <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
                {match.opponentLogoUrl ? (
                  <img src={match.opponentLogoUrl} alt={match.opponentName} className="w-20 h-20 object-contain mb-4 drop-shadow-lg" />
                ) : (
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-10 h-10 text-gray-500" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white leading-tight mb-1">{match.opponentName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{match.location}</span>
                </div>
              </div>

              {/* Pie: Fecha y Resultado */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(match.date)}</span>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-lg flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${match.result?.toLowerCase().includes('w') ? 'text-primary' : 'text-gray-500'}`} />
                  <span className="font-medium text-white">{match.result}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PARA CREAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-elite-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Rival</label>
                  <input
                    type="text"
                    required
                    value={formData.opponentName || ''}
                    onChange={e => setFormData({...formData, opponentName: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej. CD Leganés"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date || ''}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent [color-scheme:dark]"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Competición</label>
                  <input
                    type="text"
                    required
                    value={formData.competition || ''}
                    onChange={e => setFormData({...formData, competition: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej. Liga F"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Localización</label>
                  <select
                    value={formData.location || 'Local'}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Local">Local</option>
                    <option value="Visitante">Visitante</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Resultado</label>
                  <input
                    type="text"
                    value={formData.result || ''}
                    onChange={e => setFormData({...formData, result: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej. W 2-1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">URL del Escudo (Opcional)</label>
                  <input
                    type="url"
                    value={formData.opponentLogoUrl || ''}
                    onChange={e => setFormData({...formData, opponentLogoUrl: e.target.value})}
                    className="w-full bg-elite-dark border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://ejemplo.com/escudo.png"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(202,240,15,0.3)] hover:shadow-[0_0_20px_rgba(202,240,15,0.4)] disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar Partido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHubPage;
