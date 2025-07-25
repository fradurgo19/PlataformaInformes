import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';

interface Resource {
  id: string;
  model: string;
  resource_name: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

export const ResourcesPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ model: '', resource_name: '', resource_url: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/resources', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ model: '', resource_name: '', resource_url: '' });
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Resources</h1>
        <p className="text-slate-600 mb-8">Access technical resources by model. Admins can add new resources.</p>

        {authState.user?.role === 'admin' && (
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
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Resource'}
              </Button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Resource List</h2>
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
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id}>
                      <td className="border px-2 py-1">{r.model}</td>
                      <td className="border px-2 py-1">{r.resource_name}</td>
                      <td className="border px-2 py-1">
                        <a href={r.resource_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View Resource
                        </a>
                      </td>
                    </tr>
                  ))}
                  {resources.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-slate-400 py-4">No resources found</td>
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