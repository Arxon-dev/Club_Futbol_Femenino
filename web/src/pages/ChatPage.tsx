import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { chatService, ChatMessage } from '../services/chatService';
import { authService } from '../services/authService';
import { Loader2, Send, MessageCircle, Trash2, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getCurrentUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const privateUserId = searchParams.get('userId');

  const loadMessages = useCallback(async () => {
    try {
      if (privateUserId) {
        const data = await chatService.getPrivateMessages(privateUserId);
        setMessages(data);
      } else {
        const data = await chatService.getMessages();
        setMessages(data);
      }
      setError('');
    } catch {
      setError('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const msg = await chatService.sendMessage(newMessage.trim(), privateUserId || undefined);
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este mensaje?')) return;
    try {
      await chatService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError('Error al eliminar mensaje');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getUserName = (msg: ChatMessage) => {
    const p = msg.user?.profile;
    if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
    return 'Usuario';
  };

  const isOwn = (msg: ChatMessage) => msg.userId === currentUser?.id;

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] });
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-slide-up">
      <div className="flex items-center gap-4 mb-4">
        {privateUserId && (
          <button
            onClick={() => navigate('/chat')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
            title="Volver al Chat Global"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <PageHeader 
          title={privateUserId ? "Chat Privado" : "Chat del Club"} 
          subtitle={privateUserId ? "Comunicación directa." : "Canal de comunicación global del equipo."} 
        />
      </div>

      {error && (
        <div className="mb-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm">{error}</div>
      )}

      {/* Messages Area */}
      <EliteCard className="flex-1 overflow-y-auto mb-4 !p-4" padding="p-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <MessageCircle className="w-14 h-14 mb-3 text-slate-700" />
            <p>No hay mensajes aún. ¡Sé el primero!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="text-[10px] text-slate-500 bg-elite-card px-3 py-1 rounded-full border border-white/5">
                    {group.date}
                  </span>
                </div>
                {group.msgs.map((msg) => {
                  const own = isOwn(msg);
                  const canDelete = currentUser?.role === 'ADMIN';
                  return (
                    <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2 group/msg w-full`}>
                      <div className={`flex items-end gap-2 max-w-[85%] ${own ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            own
                              ? 'bg-elite-primary/15 border border-elite-primary/20 rounded-br-sm'
                              : 'bg-white/5 border border-white/5 rounded-bl-sm'
                          }`}
                        >
                          {!own && (
                            <p className="text-[11px] font-semibold text-elite-secondary mb-0.5">
                              {getUserName(msg)}
                            </p>
                          )}
                          {own && (
                            <p className="text-[11px] font-semibold text-elite-primary/70 mb-0.5 text-right">
                              Tú
                            </p>
                          )}
                          <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${own ? 'text-elite-primary/50 text-right' : 'text-slate-600'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover/msg:opacity-100"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </EliteCard>

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          style={{ backgroundColor: '#1a2236', color: '#ffffff' }}
          className="flex-1 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-elite-primary/40 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="bg-elite-primary hover:bg-elite-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
