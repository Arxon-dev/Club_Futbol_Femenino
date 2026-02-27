import { useEffect, useState, useRef } from 'react';
import { rosterService, RosterMember, AddMemberData, UpdateMemberData } from '../services/rosterService';
import { uploadProfilePhoto } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { Loader2, Users, Shield, User, Plus, Pencil, Trash2, Camera } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteModal from '../components/ui/EliteModal';
import { EliteInput, EliteSelect } from '../components/ui/EliteInput';

const positionStyles: Record<string, string> = {
  Portera: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Cierre: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Ala: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20',
  'Pívot': 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Universal: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
};

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '?';
}

const emptyForm: AddMemberData = {
  email: '', password: '', role: 'PLAYER', firstName: '', lastName: '',
  dorsal: undefined, position: '', phone: '', clothingSize: '', medicalInfo: '', birthdate: '', photoUrl: ''
};

export default function RosterPage() {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RosterMember | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyForm });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = authService.getCurrentUser()?.role === 'ADMIN';

  useEffect(() => { loadRoster(); }, []);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const data = await rosterService.getRoster();
      setMembers(data);
    } catch { setError('Error al cargar la plantilla'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyForm });
    setPhotoFile(null);
    setPhotoPreview(null);
    setModalOpen(true);
  };

  const openEdit = (m: RosterMember) => {
    setEditing(m);
    setFormData({
      firstName: m.profile?.firstName || '', lastName: m.profile?.lastName || '',
      dorsal: m.profile?.dorsal || undefined, position: m.profile?.position || '',
      phone: m.profile?.phone || '', clothingSize: m.profile?.clothingSize || '',
      medicalInfo: m.profile?.medicalInfo || '', birthdate: m.profile?.birthdate || '',
      role: m.role, photoUrl: m.profile?.photoUrl || ''
    });
    setPhotoFile(null);
    setPhotoPreview(m.profile?.photoUrl || null);
    setModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let photoUrl = formData.photoUrl;

      if (editing) {
        // Upload photo if new file selected
        if (photoFile) {
          photoUrl = await uploadProfilePhoto(photoFile, editing.id);
        }
        const updateData: UpdateMemberData = {
          firstName: formData.firstName, lastName: formData.lastName,
          dorsal: formData.dorsal ? parseInt(formData.dorsal) : null,
          position: formData.position, phone: formData.phone,
          clothingSize: formData.clothingSize, medicalInfo: formData.medicalInfo,
          birthdate: formData.birthdate, photoUrl, role: formData.role
        };
        await rosterService.updateMember(editing.id, updateData);
      } else {
        // Create new member first
        if (!formData.email || !formData.password) {
          alert('Email y contraseña son obligatorios');
          setSaving(false);
          return;
        }
        const addData: AddMemberData = {
          email: formData.email, password: formData.password, role: formData.role,
          firstName: formData.firstName, lastName: formData.lastName,
          dorsal: formData.dorsal ? parseInt(formData.dorsal) : undefined,
          position: formData.position, phone: formData.phone,
          clothingSize: formData.clothingSize, medicalInfo: formData.medicalInfo,
          birthdate: formData.birthdate
        };
        const created = await rosterService.addMember(addData);
        // Upload photo after creation (we need the user id)
        if (photoFile && created.id) {
          photoUrl = await uploadProfilePhoto(photoFile, created.id);
          await rosterService.updateMember(created.id, { photoUrl });
        }
      }
      setModalOpen(false);
      await loadRoster();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await rosterService.removeMember(id);
      setDeleteConfirm(null);
      await loadRoster();
    } catch (err: any) { alert('Error: ' + err.message); }
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
      <PageHeader
        title="Plantilla"
        subtitle="Jugadoras y cuerpo técnico del club."
        actions={
          isAdmin ? (
            <EliteButton icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
              Añadir Jugadora
            </EliteButton>
          ) : undefined
        }
      />

      {/* Players Section */}
      {players.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-elite-primary" />
            <h2 className="text-lg font-heading font-semibold text-white">Jugadoras</h2>
            <span className="text-xs text-slate-500 ml-1">({players.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {players.map((p) => (
              <MemberCard key={p.id} member={p} isAdmin={isAdmin} onEdit={openEdit} onDelete={(id) => setDeleteConfirm(id)} />
            ))}
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
            {staff.map((s) => (
              <MemberCard key={s.id} member={s} isStaff isAdmin={isAdmin} onEdit={openEdit} onDelete={(id) => setDeleteConfirm(id)} />
            ))}
          </div>
        </section>
      )}

      {members.length === 0 && (
        <EliteCard className="text-center py-16">
          <User className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No hay miembros en la plantilla.</p>
          {isAdmin && (
            <EliteButton className="mt-4" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
              Añadir primera jugadora
            </EliteButton>
          )}
        </EliteCard>
      )}

      {/* Add/Edit Modal */}
      <EliteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar — ${editing.profile?.firstName || ''} ${editing.profile?.lastName || ''}` : 'Añadir Jugadora'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Photo upload */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-24 h-24 rounded-full object-cover border-2 border-elite-primary/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-elite-primary/10 border-2 border-dashed border-elite-primary/30 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-elite-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>

          {!editing && (
            <div className="grid grid-cols-2 gap-3">
              <EliteInput label="Email *" type="email" required value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <EliteInput label="Contraseña *" type="password" required value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Nombre" value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            <EliteInput label="Apellidos" value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <EliteSelect label="Rol" value={formData.role || 'PLAYER'} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="PLAYER">Jugadora</option>
              <option value="COACH">Cuerpo Técnico</option>
            </EliteSelect>
            <EliteSelect label="Posición" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="Portera">Portera</option>
              <option value="Cierre">Cierre</option>
              <option value="Ala">Ala</option>
              <option value="Pívot">Pívot</option>
              <option value="Universal">Universal</option>
            </EliteSelect>
            <EliteInput label="Dorsal" type="number" value={formData.dorsal || ''} onChange={(e) => setFormData({ ...formData, dorsal: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Teléfono" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <EliteInput label="Fecha Nacimiento" type="date" value={formData.birthdate || ''} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} />
          </div>

          <EliteSelect label="Talla Ropa" value={formData.clothingSize || ''} onChange={(e) => setFormData({ ...formData, clothingSize: e.target.value })}>
            <option value="">Seleccionar...</option>
            <option value="XS">XS</option><option value="S">S</option><option value="M">M</option>
            <option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
          </EliteSelect>

          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</EliteButton>
            <EliteButton type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? 'Guardar' : 'Añadir'}
            </EliteButton>
          </div>
        </form>
      </EliteModal>

      {/* Delete Confirmation Modal */}
      <EliteModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar eliminación"
        maxWidth="max-w-sm"
      >
        <p className="text-slate-300 mb-4">¿Estás seguro de que quieres eliminar a este miembro de la plantilla? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <EliteButton variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</EliteButton>
          <EliteButton variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            <Trash2 className="w-4 h-4" /> Eliminar
          </EliteButton>
        </div>
      </EliteModal>
    </div>
  );
}

function MemberCard({
  member, isStaff = false, isAdmin, onEdit, onDelete
}: {
  member: RosterMember; isStaff?: boolean; isAdmin: boolean;
  onEdit: (m: RosterMember) => void; onDelete: (id: string) => void;
}) {
  const profile = member.profile;
  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const dorsal = profile?.dorsal;
  const position = profile?.position || (isStaff ? 'Staff' : '');
  const initials = getInitials(firstName, lastName);
  const posCls = positionStyles[position] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  const photoUrl = profile?.photoUrl;

  return (
    <EliteCard padding="p-0" className="group hover:border-elite-primary/20 transition-all overflow-hidden text-center relative">
      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="w-7 h-7 rounded-full bg-elite-surface/90 border border-white/10 flex items-center justify-center text-elite-secondary hover:text-elite-primary transition-colors"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="w-7 h-7 rounded-full bg-elite-surface/90 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Avatar / Dorsal Header */}
      <div className="relative pt-6 pb-4 bg-gradient-to-b from-elite-primary/5 to-transparent">
        {dorsal != null && (
          <span className="absolute top-2 right-3 text-2xl font-bold text-elite-primary/20 font-heading">
            #{dorsal}
          </span>
        )}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-elite-primary/20"
          />
        ) : (
          <div className="w-16 h-16 mx-auto rounded-full bg-elite-primary/10 border-2 border-elite-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-elite-primary font-heading">{initials}</span>
          </div>
        )}
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
