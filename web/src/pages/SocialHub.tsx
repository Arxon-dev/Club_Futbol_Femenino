import { useEffect, useState } from 'react';
import { socialLinkService, SocialLinks } from '../services/socialLinkService';
import { authService } from '../services/authService';
import { Loader2, Twitter, Facebook, Youtube, Save } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';


interface SocialField {
  key: keyof Omit<SocialLinks, 'id' | 'updatedAt'>;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  colors: string;
}

const fields: SocialField[] = [
  { key: 'instagramUrl', label: 'Instagram', icon: <img src="/instagram.png" alt="Instagram" className="w-5 h-5 object-contain" />, placeholder: 'https://instagram.com/...', colors: 'from-pink-500/20 to-purple-500/20 text-pink-400' },
  { key: 'facebookUrl', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, placeholder: 'https://facebook.com/...', colors: 'from-blue-600/20 to-blue-500/20 text-blue-400' },
  { key: 'twitterUrl', label: 'Twitter / X', icon: <Twitter className="w-5 h-5" />, placeholder: 'https://twitter.com/...', colors: 'from-sky-500/20 to-blue-500/20 text-sky-400' },
  { key: 'youtubeUrl', label: 'YouTube', icon: <Youtube className="w-5 h-5" />, placeholder: 'https://youtube.com/...', colors: 'from-red-500/20 to-rose-500/20 text-red-400' },
];

export default function SocialHubPage() {
  const [links, setLinks] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<SocialLinks>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await socialLinkService.getLinks();
      setLinks(data);
      setForm({ instagramUrl: data.instagramUrl, facebookUrl: data.facebookUrl, twitterUrl: data.twitterUrl, youtubeUrl: data.youtubeUrl });
    } catch { setError('Error al cargar redes sociales'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccessMsg('');
    try {
      const updated = await socialLinkService.updateLinks(form);
      setLinks(updated);
      setEditing(false);
      setSuccessMsg('Redes sociales actualizadas correctamente.');
    } catch (err: any) { setError(err.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <PageHeader
        title="Social Hub"
        subtitle="Redes sociales del club."
        actions={
          isAdmin && !editing ? (
            <EliteButton onClick={() => setEditing(true)}>Editar Enlaces</EliteButton>
          ) : undefined
        }
      />

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-elite-accent/10 text-elite-accent border border-elite-accent/20 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => {
          const url = editing ? (form[field.key] || '') : (links?.[field.key] || '');
          return (
            <EliteCard key={field.key} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${field.colors} flex items-center justify-center flex-shrink-0`}>
                {field.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{field.label}</p>
                {editing ? (
                  <input
                    type="url"
                    className="w-full bg-elite-bg/80 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-elite-primary/60 text-sm"
                    placeholder={field.placeholder}
                    value={url}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                ) : url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-elite-secondary hover:text-elite-secondary/80 truncate block transition-colors"
                  >
                    {url.replace(/https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  <p className="text-sm text-slate-600 italic">No configurado</p>
                )}
              </div>
            </EliteCard>
          );
        })}
      </div>

      {editing && (
        <div className="flex justify-end gap-2">
          <EliteButton variant="ghost" onClick={() => { setEditing(false); if (links) setForm({ instagramUrl: links.instagramUrl, facebookUrl: links.facebookUrl, twitterUrl: links.twitterUrl, youtubeUrl: links.youtubeUrl }); }}>
            Cancelar
          </EliteButton>
          <EliteButton onClick={handleSave} loading={saving} icon={!saving ? <Save className="w-4 h-4" /> : undefined}>
            Guardar
          </EliteButton>
        </div>
      )}
    </div>
  );
}
