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

const USER_COST_FIELDS = [
  { key: 'cost_mtto_250h' as const, label: 'Costo Mtto 250 horas' },
  { key: 'cost_mtto_500h' as const, label: 'Costo Mtto 500 horas' },
  { key: 'cost_mtto_1000h' as const, label: 'Costo Mtto 1000 horas' },
  { key: 'cost_mtto_2000h' as const, label: 'Costo Mtto 2000 horas' },
  { key: 'cost_desplazamiento_km' as const, label: 'Costo desplazamiento / km' },
  { key: 'cost_hospedaje_dia' as const, label: 'Costo hospedaje / día' },
  { key: 'cost_alimentacion_dia' as const, label: 'Costo alimentación / día' },
  { key: 'cost_hora_viaje_tecnico' as const, label: 'Costo hora viaje técnico' },
  { key: 'cost_valor_hora_mano_obra' as const, label: 'Costo valor hora mano de obra' },
];

const emptyCostForm = (): Record<(typeof USER_COST_FIELDS)[number]['key'], number | undefined> =>
  USER_COST_FIELDS.reduce(
    (acc, { key }) => {
      acc[key] = undefined;
      return acc;
    },
    {} as Record<(typeof USER_COST_FIELDS)[number]['key'], number | undefined>
  );

const parseOptionalNumber = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const formatCostCell = (v: number | string | undefined): string => {
  const n = parseOptionalNumber(v);
  return n === undefined ? '-' : n.toLocaleString('es-CO', { maximumFractionDigits: 2 });
};

const initialForm = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  zone: '',
  brands: [] as string[],
  specialty: '',
  rating: undefined as number | undefined,
  contact: '',
  payment_method: '',
  ...emptyCostForm(),
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
  const [success, setSuccess] = useState<string | null>(null);

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
    const costs = emptyCostForm();
    USER_COST_FIELDS.forEach(({ key }) => {
      costs[key] = parseOptionalNumber(user[key as keyof User]);
    });
    setForm({
      ...user,
      password: '',
      brands: user.brands || [],
      zone: user.zone || '',
      specialty: user.specialty || '',
      rating: parseOptionalNumber(user.rating),
      contact: user.contact ?? '',
      payment_method: user.payment_method ?? '',
      ...costs,
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
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'brands') {
      // Convertir string de marcas separadas por comas a array
      const brandsArray = value ? value.split(',').map(b => b.trim()).filter(b => b) : [];
      setForm({ ...form, [name]: brandsArray });
    } else if (name === 'rating') {
      const ratingNum = value ? parseFloat(value) : undefined;
      setForm({ ...form, [name]: ratingNum });
    } else if (name.startsWith('cost_')) {
      const num = value === '' ? undefined : Number.parseFloat(value);
      setForm({ ...form, [name]: num !== undefined && Number.isFinite(num) ? num : undefined });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!form.full_name || !form.email || !form.username || !form.password || !form.role) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Validar rating si se proporciona
    if (form.rating !== undefined && (form.rating < 0 || form.rating > 5)) {
      setError('Rating must be between 0 and 5');
      setLoading(false);
      return;
    }

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
        ...USER_COST_FIELDS.reduce(
          (acc, { key }) => {
            const v = form[key];
            if (typeof v === 'number' && Number.isFinite(v)) acc[key] = v;
            return acc;
          },
          {} as Record<string, number>
        ),
        contact: form.contact?.trim() || undefined,
        payment_method: form.payment_method?.trim() || undefined,
      });
      if (res.success) {
        setSuccess('User created successfully');
        fetchUsers();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setError(res.error || 'Error creating user');
      }
    } catch (e: any) {
      setError(e.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validaciones
    if (!form.full_name || !form.email || !form.role) {
      setError('Full name, email and role are required');
      setLoading(false);
      return;
    }

    // Validar rating si se proporciona
    if (form.rating !== undefined && (form.rating < 0 || form.rating > 5)) {
      setError('Rating must be between 0 and 5');
      setLoading(false);
      return;
    }

    try {
      if (!editId) {
        setError('No user selected for editing');
        return;
      }

      const res = await apiService.updateUser(editId, {
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        zone: form.zone || undefined,
        brands: form.brands.length > 0 ? form.brands : undefined,
        specialty: form.specialty || undefined,
        rating: form.rating,
        password: form.password || undefined,
        ...USER_COST_FIELDS.reduce(
          (acc, { key }) => {
            const v = form[key];
            if (typeof v === 'number' && Number.isFinite(v)) acc[key] = v;
            return acc;
          },
          {} as Record<string, number>
        ),
        contact: form.contact?.trim() || undefined,
        payment_method: form.payment_method?.trim() || undefined,
      });
      
      if (res.success) {
        setSuccess('User updated successfully');
        fetchUsers();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setError(res.error || 'Error updating user');
      }
    } catch (e: any) {
      setError(e.message || 'Error updating user');
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
    (u.brands && u.brands.some(brand => brand.toLowerCase().includes(search.toLowerCase()))) ||
    (u.contact && u.contact.toLowerCase().includes(search.toLowerCase())) ||
    (u.payment_method && u.payment_method.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="max-w-[min(96rem,100%)] mx-auto py-8 px-2">
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
                <th className="px-2 py-2 text-left">Contacto</th>
                <th className="px-2 py-2 text-left">Forma de pago</th>
                {USER_COST_FIELDS.map(({ key, label }) => (
                  <th key={key} className="px-2 py-2 whitespace-nowrap text-left text-xs max-w-[7rem]" title={label}>
                    {label.replace(/^Costo /, '')}
                  </th>
                ))}
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
                  <td className="px-2 py-2 max-w-[10rem] truncate" title={user.contact || undefined}>
                    {user.contact || '-'}
                  </td>
                  <td className="px-2 py-2 max-w-[8rem] truncate" title={user.payment_method || undefined}>
                    {user.payment_method || '-'}
                  </td>
                  {USER_COST_FIELDS.map(({ key }) => (
                    <td key={key} className="px-2 py-2 text-xs whitespace-nowrap">
                      {formatCostCell(user[key as keyof User])}
                    </td>
                  ))}
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
            <form onSubmit={handleCreate} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-3">
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
              <Input name="contact" value={form.contact} onChange={handleChange} placeholder="Contacto (tel., nombre, etc.)" />
              <Input name="payment_method" value={form.payment_method} onChange={handleChange} placeholder="Forma de pago" />
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-700">Costos (opcional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {USER_COST_FIELDS.map(({ key, label }) => (
                    <Input
                      key={key}
                      name={key}
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        typeof form[key] === 'number' && Number.isFinite(form[key])
                          ? String(form[key])
                          : ''
                      }
                      onChange={handleChange}
                      placeholder={label}
                    />
                  ))}
                </div>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </div>
        )}
        {/* Edit User Modal */}
        {showEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2">
            <form onSubmit={handleEdit} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-3">
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
              <Input name="contact" value={form.contact} onChange={handleChange} placeholder="Contacto (tel., nombre, etc.)" />
              <Input name="payment_method" value={form.payment_method} onChange={handleChange} placeholder="Forma de pago" />
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-700">Costos (opcional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {USER_COST_FIELDS.map(({ key, label }) => (
                    <Input
                      key={key}
                      name={key}
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        typeof form[key] === 'number' && Number.isFinite(form[key])
                          ? String(form[key])
                          : ''
                      }
                      onChange={handleChange}
                      placeholder={label}
                    />
                  ))}
                </div>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
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