import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Resource } from '../types';
import { apiService } from '../services/api';
import { BulkImportResources } from '../components/molecules/BulkImportResources';

export const ResourcesPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ model: '', resource_name: '', resource_url: '', observation: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getResources();
      if (data.success) {
        setResources(data.data || []);
      } else {
        setError(data.error || 'Error fetching resources');
      }
    } catch (err) {
      setError('Error fetching resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.model || !form.resource_name || !form.resource_url) {
      setFormError('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiService.createResource(form);
      if (data.success) {
        setForm({ model: '', resource_name: '', resource_url: '', observation: '' });
        fetchResources();
      } else {
        setFormError(data.error || 'Error creating resource');
      }
    } catch (err) {
      setFormError('Error creating resource');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado de recursos por model o nombre del recurso
  const filteredResources = resources.filter((r) =>
    r.model.toLowerCase().includes(search.toLowerCase()) ||
    r.resource_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      const data = await apiService.deleteResource(id);
      if (data.success) {
        fetchResources();
      } else {
        alert(data.error || 'Error deleting resource');
      }
    } catch (err) {
      alert('Error deleting resource');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Resources</h1>
        <p className="text-slate-600 mb-8">Access technical resources by model. Admins can add new resources.</p>

        {authState.user?.role === 'admin' && (
          <>
            <div className="mb-8 bg-white p-6 rounded-lg shadow border border-slate-200 max-w-xl">
              <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Model"
                  name="model"
                  value={form.model}
                  onChange={handleInputChange}
                  placeholder="E.g. CATERPILLAR 320D"
                  required
                />
                <Input
                  label="Resource Name"
                  name="resource_name"
                  value={form.resource_name}
                  onChange={handleInputChange}
                  placeholder="E.g. Manual de Operación"
                  required
                />
                <Input
                  label="Resource URL"
                  name="resource_url"
                  value={form.resource_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
                <Input
                  label="Observation"
                  name="observation"
                  value={form.observation}
                  onChange={handleInputChange}
                  placeholder="Additional notes or observations..."
                />
                {formError && <div className="text-red-600 text-sm">{formError}</div>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Resource'}
                </Button>
              </form>
            </div>

            <div className="mb-8">
              <BulkImportResources onImportSuccess={fetchResources} />
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Resource List</h2>
          <div className="mb-4 max-w-xs">
            <Input
              label="Search by Model or Resource Name"
              name="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type model or resource name..."
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-2 py-1">Model</th>
                    <th className="border px-2 py-1">Resource Name</th>
                    <th className="border px-2 py-1">Resource</th>
                    <th className="border px-2 py-1">Observation</th>
                    {authState.user?.role === 'admin' && (
                      <th className="border px-2 py-1">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((r) => (
                    <tr key={r.id}>
                      <td className="border px-2 py-1">{r.model}</td>
                      <td className="border px-2 py-1">{r.resource_name}</td>
                      <td className="border px-2 py-1">
                        <a href={r.resource_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View Resource
                        </a>
                      </td>
                      <td className="border px-2 py-1 max-w-xs truncate" title={r.observation}>
                        {r.observation || '-'}
                      </td>
                      {authState.user?.role === 'admin' && (
                        <td className="border px-2 py-1">
                          <Button
                            onClick={() => handleDeleteResource(r.id)}
                            disabled={deletingId === r.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                          >
                            {deletingId === r.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredResources.length === 0 && (
                    <tr>
                      <td colSpan={authState.user?.role === 'admin' ? 5 : 4} className="text-center text-slate-400 py-4">No resources found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}; 