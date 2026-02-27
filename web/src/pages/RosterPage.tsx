import { useEffect, useState } from 'react';
import { rosterService, RosterMember } from '../services/rosterService';
import { Loader2, Users, Shield, User } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';

const positionStyles: Record<string, string> = {
  Portera: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Defensa: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Centrocampista: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20',
  Delantera: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '?';
}

export default function RosterPage() {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoster();
  }, []);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const data = await rosterService.getRoster();
      setMembers(data);
    } catch { setError('Error al cargar la plantilla'); }
    finally { setLoading(false); }
  };

  const players = members.filter((m) => m.role === 'PLAYER');
  const staff = members.filter((m) => m.role === 'COACH');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-slide-up">
        <PageHeader title="Plantilla" subtitle="Jugadoras y cuerpo técnico del club." />
        <EliteCard className="text-center py-12">
          <p className="text-elite-accent">{error}</p>
        </EliteCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <PageHeader title="Plantilla" subtitle="Jugadoras y cuerpo técnico del club." />

      {/* Players Section */}
      {players.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-elite-primary" />
            <h2 className="text-lg font-heading font-semibold text-white">Jugadoras</h2>
            <span className="text-xs text-slate-500 ml-1">({players.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {players.map((p) => <MemberCard key={p.id} member={p} />)}
          </div>
        </section>
      )}

      {/* Staff Section */}
      {staff.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-elite-secondary" />
            <h2 className="text-lg font-heading font-semibold text-white">Cuerpo Técnico</h2>
            <span className="text-xs text-slate-500 ml-1">({staff.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {staff.map((s) => <MemberCard key={s.id} member={s} isStaff />)}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <EliteCard className="text-center py-16">
          <User className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay miembros en la plantilla.</p>
        </EliteCard>
      )}
    </div>
  );
}

function MemberCard({ member, isStaff = false }: { member: RosterMember; isStaff?: boolean }) {
  const profile = member.profile;
  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const dorsal = profile?.dorsal;
  const position = profile?.position || (isStaff ? 'Staff' : '');
  const initials = getInitials(firstName, lastName);
  const posCls = positionStyles[position] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';

  return (
    <EliteCard padding="p-0" className="group hover:border-elite-primary/20 transition-all overflow-hidden text-center">
      {/* Avatar / Dorsal Header */}
      <div className="relative pt-6 pb-4 bg-gradient-to-b from-elite-primary/5 to-transparent">
        {dorsal != null && (
          <span className="absolute top-2 right-3 text-2xl font-bold text-elite-primary/20 font-heading">
            #{dorsal}
          </span>
        )}
        <div className="w-16 h-16 mx-auto rounded-full bg-elite-primary/10 border-2 border-elite-primary/20 flex items-center justify-center">
          <span className="text-xl font-bold text-elite-primary font-heading">{initials}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pb-4 space-y-2">
        <h3 className="text-white font-semibold text-sm leading-tight truncate">
          {firstName} {lastName}
        </h3>
        {position && (
          <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${posCls}`}>
            {position}
          </span>
        )}
      </div>
    </EliteCard>
  );
}
