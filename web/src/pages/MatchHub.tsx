import { useEffect, useState } from 'react';
import { matchService, Match } from '../services/matchService';
import { authService } from '../services/authService';
import { Plus, Calendar, Clock, MapPin, Trophy, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteModal from '../components/ui/EliteModal';
import { EliteInput, EliteSelect } from '../components/ui/EliteInput';

/** Convierte un ISO datetime a formato YYYY-MM-DD para <input type="date"> */
function toDateInputValue(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch { return ''; }
}

/** Formatea una fecha ISO a DD-MM-YYYY para mostrar en la UI */
function formatDateDisplay(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch { return isoDate; }
}

const emptyMatch: Partial<Match> = { opponentName: '', date: '', time: '', location: '', result: '', competition: 'Liga' };

export default function MatchHubPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [form, setForm] = useState(emptyMatch);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchService.getAllMatches();
      setMatches(data);
    } catch { setError('Error al cargar partidos'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingMatch(null); setForm(emptyMatch); setModalOpen(true); };
  const openEdit = (m: Match) => {
    setEditingMatch(m);
    setForm({
      opponentName: m.opponentName,
      date: toDateInputValue(m.date),
      time: m.time || '',
      location: m.location || '',
      result: m.result || '',
      competition: m.competition || 'Liga'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editingMatch) { await matchService.updateMatch(editingMatch.id, form); }
      else { await matchService.createMatch(form); }
      setModalOpen(false);
      await loadMatches();
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este partido?')) return;
    try { await matchService.deleteMatch(id); await loadMatches(); }
    catch { alert('Error al eliminar'); }
  };

  const compLabels: Record<string, { text: string; cls: string }> = {
    Liga: { text: 'Liga', cls: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20' },
    Copa: { text: 'Copa', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    Amistoso: { text: 'Amistoso', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Partidos"
        subtitle="Calendario y resultados de los partidos del club."
        actions={
          isAdmin ? (
            <EliteButton icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nuevo Partido</EliteButton>
          ) : undefined
        }
      />

      {matches.length === 0 ? (
        <EliteCard className="text-center py-16">
          <Trophy className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay partidos registrados todavía.</p>
          {isAdmin && <EliteButton className="mt-4" size="sm" onClick={openCreate}>Crear Partido</EliteButton>}
        </EliteCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => {
            const compInfo = compLabels[match.competition] || { text: match.competition || 'Otro', cls: 'bg-white/5 text-slate-400 border-white/10' };
            return (
              <EliteCard key={match.id} className="group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${compInfo.cls}`}>
                        {compInfo.text}
                      </span>
                      {match.result && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-elite-primary/15 text-elite-primary-hover border-elite-primary/20">
                          {match.result}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold font-heading text-lg">vs {match.opponentName}</h3>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {formatDateDisplay(match.date)}
                        {match.time && (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-600 ml-2" />
                            <span>{match.time}h</span>
                          </>
                        )}
                      </span>
                      {match.location && (
                        <span className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          {match.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(match)} className="p-1.5 text-slate-500 hover:text-elite-secondary hover:bg-elite-secondary/10 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(match.id)} className="p-1.5 text-slate-500 hover:text-elite-accent hover:bg-elite-accent/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </EliteCard>
            );
          })}
        </div>
      )}

      {/* Match Modal */}
      <EliteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMatch ? 'Editar Partido' : 'Nuevo Partido'} maxWidth="max-w-md">
        {error && (
          <div className="mb-4 bg-elite-accent/10 text-elite-accent p-3 rounded-xl flex items-center gap-2 text-sm border border-elite-accent/20">
            <AlertCircle className="w-4 h-4" /> <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <EliteInput label="Rival *" required value={form.opponentName || ''} onChange={(e) => setForm({ ...form, opponentName: e.target.value })} placeholder="Nombre del equipo rival" />
          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Fecha *" type="date" required value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <EliteInput label="Hora" type="time" value={form.time || ''} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <EliteInput label="Ubicación" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Campo, pabellón..." />
          <EliteSelect label="Competición" value={form.competition || 'Liga'} onChange={(e) => setForm({ ...form, competition: e.target.value })}>
            <option value="Liga">Liga</option>
            <option value="Copa">Copa</option>
            <option value="Amistoso">Amistoso</option>
          </EliteSelect>
          <EliteInput label="Resultado" value={form.result || ''} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="Ej: 3-1" />
          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</EliteButton>
            <EliteButton type="submit" loading={saving}>Guardar</EliteButton>
          </div>
        </form>
      </EliteModal>
    </div>
  );
}
