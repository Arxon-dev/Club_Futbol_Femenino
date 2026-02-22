import React, { useState, useEffect } from 'react';
import { Event, eventService } from '../../services/eventService';
import { Calendar, MapPin, Loader2, Plus, CalendarPlus, Users } from 'lucide-react';
import EventAttendancesModal from './EventAttendancesModal';

export default function EventsPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'MATCH' | 'TRAINING' | 'OTHER'>('TRAINING');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getEvents();
      // Asegurar que solo eventos futuros o recientes se muestren
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando eventos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    try {
      setIsCreating(true);
      await eventService.createEvent({
        title,
        type,
        date: new Date(date).toISOString(),
        location,
        description: ''
      });
      // Limpiar formulario
      setTitle('');
      setDate('');
      setLocation('');
      // Recargar lista
      await loadEvents();
    } catch (err: any) {
      setError(err.message || 'Error al crear evento');
    } finally {
      setIsCreating(false);
    }
  };

  const openAttendances = (eventId: string, eventTitle: string) => {
      setSelectedEventId(eventId);
      setSelectedEventTitle(eventTitle);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <CalendarPlus className="text-indigo-600" /> Nuevo Evento
        </h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Jornada 5 vs Equipo B"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select 
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="TRAINING">Entrenamiento</option>
              <option value="MATCH">Partido</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
             <input 
              type="datetime-local" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isCreating}
            className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4"/> Crear</>}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-200">
             <h3 className="text-lg font-medium leading-6 flex items-center gap-2 text-indigo-900">
                <Calendar className="w-5 h-5 text-indigo-500" /> Próximos Eventos
             </h3>
         </div>
         {error && <p className="text-red-500 p-6">{error}</p>}
         
         {isLoading ? (
             <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
         ) : events.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No hay eventos programados.</div>
         ) : (
             <ul className="divide-y divide-gray-200">
                 {events.map((evt) => (
                     <li key={evt.id} className="p-6 hover:bg-slate-50 transition-colors">
                         <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                               <p className="text-sm font-semibold text-indigo-600 truncate mb-1">
                                 {evt.type === 'MATCH' ? '🏆 Partido' : '⚽ Entrenamiento'}
                               </p>
                               <p className="text-lg font-medium text-gray-900">{evt.title}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="flex flex-col items-start md:items-end text-sm text-gray-500 gap-1">
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(evt.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    {evt.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {evt.location}</span>}
                                </div>
                                <button
                                    onClick={() => openAttendances(evt.id, evt.title)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2"
                                >
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span>Ver Asistencias</span>
                                </button>
                            </div>
                         </div>
                     </li>
                 ))}
             </ul>
         )}
      </div>

      {selectedEventId && (
        <EventAttendancesModal
            eventId={selectedEventId}
            eventTitle={selectedEventTitle}
            onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
