import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../services/userService';
import { uploadProfilePhoto } from '../services/supabaseClient';
import { Plus, Loader2, UserCircle, Camera } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EliteCard from '../components/ui/EliteCard';
import EliteButton from '../components/ui/EliteButton';
import EliteTable from '../components/ui/EliteTable';
import EliteModal from '../components/ui/EliteModal';
import { EliteInput, EliteSelect, EliteTextarea } from '../components/ui/EliteInput';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  position?: string;
  dorsal?: number;
  clothingSize?: string;
  medicalInfo?: string;
  photoUrl?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({});
  const [newUserFormData, setNewUserFormData] = useState({ email: '', password: '', role: 'PLAYER', firstName: '', lastName: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const openEditor = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.profile?.firstName || '', lastName: user.profile?.lastName || '',
      phone: user.profile?.phone || '', birthdate: user.profile?.birthdate || '',
      position: user.profile?.position || '', dorsal: user.profile?.dorsal,
      clothingSize: user.profile?.clothingSize || '', medicalInfo: user.profile?.medicalInfo || '',
      photoUrl: user.profile?.photoUrl || '',
    });
    setPhotoFile(null);
    setPhotoPreview(user.profile?.photoUrl || null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        photoUrl = await uploadProfilePhoto(photoFile, editingUser.id);
      }
      await userService.updateProfile(editingUser.id, { ...formData, photoUrl });
      setEditingUser(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      await loadUsers();
    } catch (err: any) { alert('Error al guardar: ' + err.message); }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser(newUserFormData);
      setIsCreatingUser(false);
      setNewUserFormData({ email: '', password: '', role: 'PLAYER', firstName: '', lastName: '' });
      await loadUsers();
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-elite-accent/15 text-elite-accent border-elite-accent/20',
      COACH: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      PLAYER: 'bg-elite-secondary/15 text-elite-secondary border-elite-secondary/20',
      PARENT: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    };
    return colors[role] || 'bg-white/5 text-slate-400 border-white/10';
  };

  const columns = [
    {
      key: 'name',
      header: 'Usuario',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-elite-primary/15 flex items-center justify-center text-elite-primary-hover flex-shrink-0">
            <UserCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">
              {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'Sin nombre'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'position',
      header: 'Posición / Dorsal',
      render: (user: User) => (
        <div>
          <p className="text-slate-300">{user.profile?.position || '-'}</p>
          <p className="text-xs text-slate-500">{user.profile?.dorsal ? `#${user.profile.dorsal}` : ''}</p>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contacto',
      render: (user: User) => <span className="text-slate-400">{user.profile?.phone || '-'}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadge(user.role)}`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user: User) => (
        <button
          onClick={() => openEditor(user)}
          className="text-sm text-elite-secondary hover:text-elite-secondary/80 font-medium transition-colors"
        >
          Editar
        </button>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-elite-primary" />
      </div>
    );
  }

  if (error) return <div className="p-4 text-elite-accent">{error}</div>;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Directorio"
        subtitle="Gestión de jugadoras, cuerpo técnico y staff del club."
        actions={
          <EliteButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreatingUser(true)}>
            Añadir Usuario
          </EliteButton>
        }
      />

      <EliteCard padding="p-0">
        <EliteTable columns={columns} data={users} keyExtractor={(u) => u.id} emptyMessage="No hay usuarios registrados." />
      </EliteCard>

      {/* Edit Profile Modal */}
      <EliteModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Editar Perfil — ${editingUser?.email || ''}`} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          {/* Photo upload */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 border-elite-primary/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-elite-primary/10 border-2 border-dashed border-elite-primary/30 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-elite-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Nombre" value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            <EliteInput label="Apellidos" value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Teléfono" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <EliteInput label="Fecha de Nacimiento" type="date" value={formData.birthdate || ''} onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <EliteSelect label="Posición" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="Portera">Portera</option>
              <option value="Cierre">Cierre</option>
              <option value="Ala">Ala</option>
              <option value="Pívot">Pívot</option>
              <option value="Universal">Universal</option>
            </EliteSelect>
            <EliteInput label="Dorsal" type="number" value={formData.dorsal || ''} onChange={(e) => setFormData({ ...formData, dorsal: parseInt(e.target.value) || undefined })} />
            <EliteSelect label="Talla Ropa" value={formData.clothingSize || ''} onChange={(e) => setFormData({ ...formData, clothingSize: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="XS">XS</option><option value="S">S</option><option value="M">M</option>
              <option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
            </EliteSelect>
          </div>
          <EliteTextarea label="Información Médica / Alergias" rows={3} value={formData.medicalInfo || ''} onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })} placeholder="Alergias, medicamentos, lesiones..." />
          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setEditingUser(null)}>Cancelar</EliteButton>
            <EliteButton type="submit">Guardar</EliteButton>
          </div>
        </form>
      </EliteModal>

      {/* Create User Modal */}
      <EliteModal isOpen={isCreatingUser} onClose={() => setIsCreatingUser(false)} title="Añadir Nuevo Usuario" maxWidth="max-w-md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <EliteInput label="Email *" type="email" required value={newUserFormData.email} onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })} />
          <EliteInput label="Contraseña Inicial *" type="password" required value={newUserFormData.password} onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })} />
          <EliteSelect label="Rol *" value={newUserFormData.role} onChange={(e) => setNewUserFormData({ ...newUserFormData, role: e.target.value })}>
            <option value="PLAYER">Jugadora (PLAYER)</option>
            <option value="COACH">Entrenador (COACH)</option>
            <option value="ADMIN">Administrador (ADMIN)</option>
            <option value="PARENT">Familiar (PARENT)</option>
          </EliteSelect>
          <div className="grid grid-cols-2 gap-3">
            <EliteInput label="Nombre" value={newUserFormData.firstName} onChange={(e) => setNewUserFormData({ ...newUserFormData, firstName: e.target.value })} />
            <EliteInput label="Apellidos" value={newUserFormData.lastName} onChange={(e) => setNewUserFormData({ ...newUserFormData, lastName: e.target.value })} />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
            <EliteButton type="button" variant="ghost" onClick={() => setIsCreatingUser(false)}>Cancelar</EliteButton>
            <EliteButton type="submit">Crear Usuario</EliteButton>
          </div>
        </form>
      </EliteModal>
    </div>
  );
}
