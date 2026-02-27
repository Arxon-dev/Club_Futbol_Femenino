import React, { useState } from 'react';
import { notificationService, PushNotificationDto } from '../services/notificationService';
import { Bell, Send } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import { EliteInput, EliteTextarea } from '../components/ui/EliteInput';

export const NotificationsPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload: PushNotificationDto = { title, body, userId: userId.trim() ? userId.trim() : undefined };
      const res = await notificationService.sendNotification(payload);
      if (payload.userId) {
        setSuccessMsg('Notificación enviada al usuario correctamente.');
      } else {
        setSuccessMsg(`Notificación enviada a todos (${res.successCount} éxitos, ${res.failureCount} fallos).`);
      }
      setTitle('');
      setBody('');
      setUserId('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar la notificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <PageHeader
        title="Notificaciones Push"
        subtitle="Envía alertas a los dispositivos móviles de los jugadores."
      />

      <EliteCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-elite-primary/15 flex items-center justify-center text-elite-primary-hover">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Componer Notificación</h3>
        </div>

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2 text-sm">
            <span>✅</span>
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-elite-accent/10 text-elite-accent border border-elite-accent/20 flex items-center gap-2 text-sm">
            <span>⚠️</span>
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <EliteInput
            label="Título de la Notificación *"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Entrenamiento Cancelado"
          />

          <EliteTextarea
            label="Mensaje *"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Ej: El entrenamiento de hoy pasa al Pabellón B a las 20:00."
          />

          <div>
            <EliteInput
              label="ID del Usuario (Opcional)"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Si se deja en blanco, se enviará a TODOS"
            />
            <p className="text-xs text-slate-600 mt-1.5 ml-1">
              Dejar vacío para un aviso general a toda la plantilla.
            </p>
          </div>

          <div className="pt-3 flex justify-end border-t border-white/5">
            <EliteButton
              type="submit"
              loading={loading}
              icon={!loading ? <Send className="w-4 h-4" /> : undefined}
            >
              {userId.trim() ? 'Enviar a Jugador' : 'Enviar a Todos'}
            </EliteButton>
          </div>
        </form>
      </EliteCard>
    </div>
  );
};

export default NotificationsPanel;
