import React, { useState } from 'react';
import { notificationService, PushNotificationDto } from '../services/notificationService';

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
      const payload: PushNotificationDto = {
        title,
        body,
        userId: userId.trim() ? userId.trim() : undefined
      };
      
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
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl shadow-sm">
            🔔
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enviar Notificaciones Push</h2>
            <p className="text-gray-500 text-sm mt-1">Envía alertas a los dispositivos móviles de los jugadores.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título de la Notificación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Entrenamiento Cancelado"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Ej: El entrenamiento de hoy pasa al Pabellón B a las 20:00."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 focus:bg-white resize-none"
              ></textarea>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID del Usuario (Opcional)
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Si se deja en blanco, se enviará a TODOS los usuarios (Broadcast)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50 focus:bg-white"
              />
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Dejar vacío para un aviso general a toda la plantilla.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-medium shadow-sm transition-all
                ${loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <span>Enviar Push</span>
                  {userId.trim() ? ' a Jugador' : ' a Todos'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NotificationsPanel;
