import { useEffect, useState, useRef, useCallback } from 'react';
import { chatService, ChatMessage } from '../services/chatService';
import { authService } from '../services/authService';
import { Loader2, Send, MessageCircle } from 'lucide-react';
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

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.getMessages();
      setMessages(data);
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
      const msg = await chatService.sendMessage(newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch {
      setError('Error al enviar mensaje');
    } finally {
      setSending(false);
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
      <PageHeader title="Chat del Club" subtitle="Canal de comunicación del equipo." />

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
                  return (
                    <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
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
                        <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${own ? 'text-elite-primary/50 text-right' : 'text-slate-600'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
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
          className="flex-1 bg-elite-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-elite-primary/40 transition-colors"
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
