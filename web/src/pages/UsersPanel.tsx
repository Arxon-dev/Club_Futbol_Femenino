import React, { useState, useEffect } from 'react';
import { userService, UserDto, ProfileDto } from '../services/userService';

export default function UsersPanel() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileDto>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditor = (user: UserDto) => {
    setEditingUser(user);
    setFormData({
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phone: user.profile?.phone || '',
      clothingSize: user.profile?.clothingSize || '',
      dorsal: user.profile?.dorsal || undefined,
      position: user.profile?.position || '',
      birthdate: user.profile?.birthdate || '',
      medicalInfo: user.profile?.medicalInfo || '',
    });
  };

  const closeEditor = () => {
    setEditingUser(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await userService.updateProfile(editingUser.id, formData);
      await fetchUsers();
      closeEditor();
    } catch (err: any) {
      alert(err.message || 'Error saving profile');
    }
  };

  if (loading) return <div className="p-4">Cargando directorio...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 shadow rounded-lg">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Directorio de Jugadoras y Staff</h3>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona los perfiles, fichas médicas y deportivas de todos los miembros del club.
        </p>
      </div>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición / Dorsal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'Sin nombre configurado'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.profile?.position || '-'}</div>
                        <div className="text-sm text-gray-500">{user.profile?.dorsal ? `#${user.profile.dorsal}` : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.profile?.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'COACH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditor(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar Perfil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeEditor}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <form onSubmit={handleSave}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    Editar Perfil - {editingUser.email}
                  </h3>
                  <div className="grid grid-cols-6 gap-6">
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="mt-1 flex-1 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
                      <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="mt-1 flex-1 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input type="text" name="phone" id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 flex-1 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <input type="date" name="birthdate" id="birthdate" value={formData.birthdate} onChange={e => setFormData({...formData, birthdate: e.target.value})} className="mt-1 flex-1 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">Posición</label>
                      <select id="position" name="position" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Seleccionar...</option>
                        <option value="Portera">Portera</option>
                        <option value="Cierre">Cierre</option>
                        <option value="Ala">Ala</option>
                        <option value="Pívot">Pívot</option>
                        <option value="Universal">Universal</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="dorsal" className="block text-sm font-medium text-gray-700">Dorsal</label>
                      <input type="number" name="dorsal" id="dorsal" value={formData.dorsal || ''} onChange={e => setFormData({...formData, dorsal: parseInt(e.target.value) || undefined})} className="mt-1 flex-1 block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label htmlFor="clothingSize" className="block text-sm font-medium text-gray-700">Talla Ropa</label>
                      <select id="clothingSize" name="clothingSize" value={formData.clothingSize} onChange={e => setFormData({...formData, clothingSize: e.target.value})} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Seleccionar...</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700">Información Médica / Alergias</label>
                      <textarea id="medicalInfo" name="medicalInfo" rows={3} value={formData.medicalInfo} onChange={e => setFormData({...formData, medicalInfo: e.target.value})} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md" placeholder="Alergias, medicamentos, lesiones..."></textarea>
                    </div>

                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Guardar
                  </button>
                  <button type="button" onClick={closeEditor} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
