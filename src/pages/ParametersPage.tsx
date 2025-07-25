import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Parameter } from '../types';
import { apiService } from '../services/api';

export const ParametersPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ parameter: '', parameter_type: '', model: '', min_range: '', max_range: '', resource_url: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchParameters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getParameters();
      if (data.success) {
        setParameters(data.data || []);
      } else {
        setError(data.error || 'Error fetching parameters');
      }
    } catch (err) {
      setError('Error fetching parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.parameter || !form.parameter_type || !form.model || !form.min_range || !form.max_range || !form.resource_url) {
      setFormError('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiService.createParameter({
        parameter: form.parameter,
        parameter_type: form.parameter_type,
        model: form.model,
        min_range: parseFloat(form.min_range),
        max_range: parseFloat(form.max_range),
        resource_url: form.resource_url,
      });
      if (data.success) {
        setForm({ parameter: '', parameter_type: '', model: '', min_range: '', max_range: '', resource_url: '' });
        fetchParameters();
      } else {
        setFormError(data.error || 'Error creating parameter');
      }
    } catch (err) {
      setFormError('Error creating parameter');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado de parámetros por model o nombre del parámetro
  const filteredParameters = parameters.filter((p) =>
    p.model.toLowerCase().includes(search.toLowerCase()) ||
    p.parameter.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Parameters</h1>
        <p className="text-slate-600 mb-8">Access technical parameters by model. Admins can add new parameters.</p>

        {authState.user?.role === 'admin' && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow border border-slate-200 max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Parameter</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Parameter"
                name="parameter"
                value={form.parameter}
                onChange={handleInputChange}
                placeholder="E.g. Oil Pressure"
                required
              />
              <Input
                label="Parameter Type"
                name="parameter_type"
                value={form.parameter_type}
                onChange={handleInputChange}
                placeholder="E.g. Sensor"
                required
              />
              <Input
                label="Model"
                name="model"
                value={form.model}
                onChange={handleInputChange}
                placeholder="E.g. CATERPILLAR 320D"
                required
              />
              <Input
                label="Minimum Range"
                name="min_range"
                type="number"
                value={form.min_range}
                onChange={handleInputChange}
                placeholder="E.g. 10"
                required
              />
              <Input
                label="Maximum Range"
                name="max_range"
                type="number"
                value={form.max_range}
                onChange={handleInputChange}
                placeholder="E.g. 100"
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
                {submitting ? 'Saving...' : 'Add Parameter'}
              </Button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Parameter List</h2>
          <div className="mb-4 max-w-xs">
            <Input
              label="Buscar por Model o Parameter"
              name="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Escribe el model o nombre del parámetro..."
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) :
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-2 py-1">Parameter</th>
                    <th className="border px-2 py-1">Parameter Type</th>
                    <th className="border px-2 py-1">Model</th>
                    <th className="border px-2 py-1">Minimum Range</th>
                    <th className="border px-2 py-1">Maximum Range</th>
                    <th className="border px-2 py-1">Resource</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParameters.map((p) => (
                    <tr key={p.id}>
                      <td className="border px-2 py-1">{p.parameter}</td>
                      <td className="border px-2 py-1">{p.parameter_type}</td>
                      <td className="border px-2 py-1">{p.model}</td>
                      <td className="border px-2 py-1">{p.min_range}</td>
                      <td className="border px-2 py-1">{p.max_range}</td>
                      <td className="border px-2 py-1">
                        <a href={p.resource_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View Resource
                        </a>
                      </td>
                    </tr>
                  ))}
                  {filteredParameters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-400 py-4">No parameters found</td>
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