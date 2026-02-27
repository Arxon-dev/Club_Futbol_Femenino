import { useEffect, useState } from 'react';
import { newsService, NewsArticle } from '../services/newsService';
import { authService } from '../services/authService';
import { Plus, Calendar, Edit2, Trash2, Loader2, AlertCircle, Newspaper, Tag } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteModal from '../components/ui/EliteModal';
import { EliteInput, EliteSelect, EliteTextarea } from '../components/ui/EliteInput';

const emptyArticle: Partial<NewsArticle> = { title: '', content: '', imageUrl: '', category: 'General', author: '' };

const categoryStyles: Record<string, string> = {
  General: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20',
  Partido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Plantilla: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Club: 'bg-elite-primary/15 text-elite-primary-hover border-elite-primary/20',
};

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState(emptyArticle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadNews(); }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getAllNews();
      setArticles(data);
    } catch { setError('Error al cargar noticias'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingArticle(null); setForm(emptyArticle); setModalOpen(true); };
  const openEdit = (a: NewsArticle) => {
    setEditingArticle(a);
    setForm({ title: a.title, content: a.content, imageUrl: a.imageUrl || '', category: a.category, author: a.author || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editingArticle) { await newsService.updateNews(editingArticle.id, form); }
      else { await newsService.createNews(form); }
      setModalOpen(false);
      await loadNews();
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia?')) return;
    try { await newsService.deleteNews(id); await loadNews(); }
    catch { alert('Error al eliminar'); }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return iso; }
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
        title="Noticias"
        subtitle="Últimas novedades y comunicados del club."
        actions={
          isAdmin ? (
            <EliteButton icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Nueva Noticia</EliteButton>
          ) : undefined
        }
      />

      {articles.length === 0 ? (
        <EliteCard className="text-center py-16">
          <Newspaper className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay noticias publicadas todavía.</p>
          {isAdmin && <EliteButton className="mt-4" size="sm" onClick={openCreate}>Publicar Primera Noticia</EliteButton>}
        </EliteCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {articles.map((article) => {
            const catCls = categoryStyles[article.category] || categoryStyles.General;
            return (
              <EliteCard key={article.id} padding="p-0" className="group hover:border-white/10 transition-all overflow-hidden flex flex-col">
                {/* Image Header */}
                {article.imageUrl ? (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-elite-surface/90 via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${catCls}`}>
                      {article.category}
                    </span>
                  </div>
                ) : (
                  <div className="relative h-32 bg-gradient-to-br from-elite-primary/10 to-elite-secondary/10 flex items-center justify-center">
                    <Newspaper className="w-10 h-10 text-slate-600" />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${catCls}`}>
                      {article.category}
                    </span>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-white font-semibold font-heading text-lg leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                    {article.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.createdAt)}
                      </span>
                      {article.author && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {article.author}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(article)} className="p-1.5 text-slate-500 hover:text-elite-secondary hover:bg-elite-secondary/10 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 text-slate-500 hover:text-elite-accent hover:bg-elite-accent/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </EliteCard>
            );
          })}
        </div>
      )}

      {/* News Article Modal */}
      <EliteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingArticle ? 'Editar Noticia' : 'Nueva Noticia'} maxWidth="max-w-lg">
        {error && (
          <div className="mb-4 bg-elite-accent/10 text-elite-accent p-3 rounded-xl flex items-center gap-2 text-sm border border-elite-accent/20">
            <AlertCircle className="w-4 h-4" /> <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <EliteInput label="Título *" required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título de la noticia" />
          <EliteTextarea label="Contenido *" required rows={6} value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escribe el contenido de la noticia..." />
          <EliteInput label="URL de Imagen (opcional)" type="url" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://...imagen.jpg" />
          <div className="grid grid-cols-2 gap-3">
            <EliteSelect label="Categoría" value={form.category || 'General'} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="General">General</option>
              <option value="Partido">Partido</option>
              <option value="Plantilla">Plantilla</option>
              <option value="Club">Club</option>
            </EliteSelect>
            <EliteInput label="Autor (opcional)" value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Nombre del autor" />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</EliteButton>
            <EliteButton type="submit" loading={saving}>Publicar</EliteButton>
          </div>
        </form>
      </EliteModal>
    </div>
  );
}
