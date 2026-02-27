import { useEffect, useState } from 'react';
import { presidentLetterService } from '../services/presidentLetterService';
import { authService } from '../services/authService';
import { FileText, Edit2, Save, X, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import { EliteInput } from '../components/ui/EliteInput';

export default function PresidentLetterPage() {
  const [letter, setLetter] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [saving, setSaving] = useState(false);
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { fetchLetter(); }, []);

  const fetchLetter = async () => {
    try {
      const data = await presidentLetterService.getLetter();
      setLetter(data);
      setDraftTitle(data?.title || '');
      setDraftContent(data?.content || '');
    } catch {
      setLetter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await presidentLetterService.updateLetter(draftTitle, draftContent);
      setLetter(updated);
      setEditing(false);
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <PageHeader
        title="Carta del Presidente"
        subtitle="Mensaje oficial del presidente del club."
        actions={
          isAdmin && !editing ? (
            <EliteButton icon={<Edit2 className="w-4 h-4" />} onClick={() => setEditing(true)}>
              Editar Carta
            </EliteButton>
          ) : undefined
        }
      />

      <EliteCard>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-elite-primary/15 flex items-center justify-center text-elite-primary-hover">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white font-heading">Mensaje del Presidente</h3>
            <p className="text-xs text-slate-500">Club de Fútbol Femenino Torreblanca</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <EliteInput
              label="Título"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Título de la carta..."
            />
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contenido</label>
              <textarea
                className="w-full bg-elite-bg/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-elite-primary/60 focus:border-elite-primary/40 transition-all text-sm leading-relaxed resize-y"
                rows={12}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Escribe el mensaje del presidente aquí..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <EliteButton variant="ghost" onClick={() => { setEditing(false); setDraftTitle(letter?.title || ''); setDraftContent(letter?.content || ''); }} icon={<X className="w-4 h-4" />}>
                Cancelar
              </EliteButton>
              <EliteButton onClick={handleSave} loading={saving} icon={!saving ? <Save className="w-4 h-4" /> : undefined}>
                Guardar
              </EliteButton>
            </div>
          </div>
        ) : (
          <div>
            {letter?.content ? (
              <div>
                {letter.title && <h2 className="text-xl font-bold text-white font-heading mb-4">{letter.title}</h2>}
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{letter.content}</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No hay carta publicada todavía.</p>
                {isAdmin && (
                  <EliteButton className="mt-4" size="sm" onClick={() => setEditing(true)}>
                    Escribir Carta
                  </EliteButton>
                )}
              </div>
            )}
          </div>
        )}
      </EliteCard>
    </div>
  );
}
