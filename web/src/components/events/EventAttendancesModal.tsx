import { useState, useEffect } from 'react';
import { Loader2, X, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { eventService } from '../../services/eventService';

interface Attendance {
    id: string;
    status: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING';
    reason: string | null;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface Props {
    eventId: string;
    eventTitle: string;
    onClose: () => void;
}

export default function EventAttendancesModal({ eventId, eventTitle, onClose }: Props) {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAttendances = async () => {
            try {
                setIsLoading(true);
                const data = await eventService.getEventAttendances(eventId);
                setAttendances(data);
            } catch (err: any) {
                setError(err.message || 'Error cargando asistencias');
            } finally {
                setIsLoading(false);
            }
        };

        loadAttendances();
    }, [eventId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ATTENDING': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'NOT_ATTENDING': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <HelpCircle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ATTENDING': return 'Asiste';
            case 'NOT_ATTENDING': return 'No asiste';
            default: return 'Pendiente';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Asistencias</h2>
                        <p className="text-sm text-gray-500 mt-1">{eventTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
                    ) : error ? (
                        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
                    ) : attendances.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            Nadie ha confirmado asistencia todavía.
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugadora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {att.user.first_name || 'Sin nombre'} {att.user.last_name || ''}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{att.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(att.status)}
                                                    <span className="text-sm text-gray-700">{getStatusText(att.status)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 italic">
                                                    {att.reason || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
