import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
];

const initialForm = { 
  full_name: '', 
  username: '', 
  email: '', 
  password: '', 
  role: 'user',
  zone: '',
  brands: [] as string[],
  specialty: '',
  rating: undefined as number | undefined
};

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
    setForm({ 
      ...user, 
      password: '',
      brands: user.brands || [],
      zone: user.zone || '',
      specialty: user.specialty || '',
      rating: user.rating
    });
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
    const { name, value } = e.target;
    
    if (name === 'brands') {
      // Convertir string de marcas separadas por comas a array
      const brandsArray = value ? value.split(',').map(b => b.trim()).filter(b => b) : [];
      setForm({ ...form, [name]: brandsArray });
    } else if (name === 'rating') {
      // Convertir rating a número
      const ratingNum = value ? parseFloat(value) : undefined;
      setForm({ ...form, [name]: ratingNum });
    } else {
      setForm({ ...form, [name]: value });
    }
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
        zone: form.zone || undefined,
        brands: form.brands.length > 0 ? form.brands : undefined,
        specialty: form.specialty || undefined,
        rating: form.rating,
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
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.zone && u.zone.toLowerCase().includes(search.toLowerCase())) ||
    (u.specialty && u.specialty.toLowerCase().includes(search.toLowerCase())) ||
    (u.brands && u.brands.some(brand => brand.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Administration</h1>
                      <Button onClick={handleOpenCreate}>Create User</Button>
        </div>
        <div className="mb-4 flex gap-2">
          <Input
                            placeholder="Search by name, username, email, zone, specialty or brands"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 rounded-lg text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Zone</th>
                <th className="px-2 py-2">Brands</th>
                <th className="px-2 py-2">Specialty</th>
                <th className="px-2 py-2">Rating</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="px-2 py-2">{user.full_name}</td>
                  <td className="px-2 py-2">{user.username}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{user.role}</td>
                  <td className="px-2 py-2">{user.zone || '-'}</td>
                  <td className="px-2 py-2">
                    {user.brands && user.brands.length > 0 ? user.brands.join(', ') : '-'}
                  </td>
                  <td className="px-2 py-2">{user.specialty || '-'}</td>
                  <td className="px-2 py-2">
                    {user.rating !== undefined ? `${user.rating}/5` : '-'}
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(user)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Create User Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                              <h2 className="text-xl font-bold mb-2">Create User</h2>
              <Input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" required />
              <Input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
              <Input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required />
              <Select name="role" value={form.role} onChange={handleChange} options={roleOptions} required />
              <Input name="zone" value={form.zone} onChange={handleChange} placeholder="Zone (e.g., Bogotá, Medellín)" />
              <Input name="brands" value={form.brands.join(', ')} onChange={handleChange} placeholder="Brands (comma separated, e.g., CAT, Komatsu)" />
              <Input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Specialty (e.g., Excavators, Loaders)" />
              <Input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating?.toString() || ''} onChange={handleChange} placeholder="Rating (0-5)" />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </div>
        )}
        {/* Edit User Modal */}
        {showEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleEdit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold mb-2">Edit User</h2>
              <Input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" required />
              <Input name="username" value={form.username} onChange={handleChange} placeholder="Username" required disabled />
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
              <Input name="password" value={form.password} onChange={handleChange} placeholder="New password (optional)" type="password" />
              <Select name="role" value={form.role} onChange={handleChange} options={roleOptions} required />
              <Input name="zone" value={form.zone} onChange={handleChange} placeholder="Zone (e.g., Bogotá, Medellín)" />
              <Input name="brands" value={form.brands.join(', ')} onChange={handleChange} placeholder="Brands (comma separated, e.g., CAT, Komatsu)" />
              <Input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Specialty (e.g., Excavators, Loaders)" />
              <Input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating?.toString() || ''} onChange={handleChange} placeholder="Rating (0-5)" />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}; 