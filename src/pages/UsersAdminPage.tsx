import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

const initialForm = { full_name: '', username: '', email: '', password: '', role: 'user' };

export const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (e) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenCreate = () => {
    setForm(initialForm);
    setShowCreate(true);
    setShowEdit(false);
    setEditId(null);
  };

  const handleOpenEdit = (user: User) => {
    setForm({ ...user, password: '' });
    setShowEdit(true);
    setShowCreate(false);
    setEditId(user.id);
  };

  const handleCloseModal = () => {
    setShowCreate(false);
    setShowEdit(false);
    setForm(initialForm);
    setEditId(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.register({
        username: form.username,
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
      });
      if (res.success) {
        fetchUsers();
        handleCloseModal();
      } else {
        setError(res.error || 'Error creating user');
      }
    } catch (e) {
      setError('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Implementar endpoint de edición en el backend si es necesario
      setError('Funcionalidad de edición aún no implementada');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
          <Button onClick={handleOpenCreate}>Crear Usuario</Button>
        </div>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Buscar por nombre, usuario o email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 rounded-lg text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2">Nombre</th>
                <th className="px-2 py-2">Usuario</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Rol</th>
                <th className="px-2 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="px-2 py-2">{user.full_name}</td>
                  <td className="px-2 py-2">{user.username}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{user.role}</td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal Crear Usuario */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold mb-2">Crear Usuario</h2>
              <Input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nombre completo" required />
              <Input name="username" value={form.username} onChange={handleChange} placeholder="Usuario" required />
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
              <Input name="password" value={form.password} onChange={handleChange} placeholder="Contraseña" type="password" required />
              <Select name="role" value={form.role} onChange={handleChange} options={roleOptions} required />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        )}
        {/* Modal Editar Usuario */}
        {showEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleEdit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold mb-2">Editar Usuario</h2>
              <Input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nombre completo" required />
              <Input name="username" value={form.username} onChange={handleChange} placeholder="Usuario" required disabled />
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
              <Input name="password" value={form.password} onChange={handleChange} placeholder="Nueva contraseña (opcional)" type="password" />
              <Select name="role" value={form.role} onChange={handleChange} options={roleOptions} required />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}; 