import React, { useState } from 'react';
import { useTypes } from '../context/TypesContext';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

interface TypeFormData {
  name: string;
  description: string;
}

const AdminPage: React.FC = () => {
  const {
    machineTypes,
    componentTypes,
    loading,
    error,
    createMachineType,
    createComponentType,
    updateMachineType,
    updateComponentType,
    deleteMachineType,
    deleteComponentType,
  } = useTypes();

  const [activeTab, setActiveTab] = useState<'machines' | 'components'>('machines');
  const [editingMachine, setEditingMachine] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [machineForm, setMachineForm] = useState<TypeFormData>({ name: '', description: '' });
  const [componentForm, setComponentForm] = useState<TypeFormData>({ name: '', description: '' });

  const navigate = useNavigate();

  const handleMachineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await updateMachineType(editingMachine, machineForm);
        setEditingMachine(null);
      } else {
        await createMachineType(machineForm);
      }
      setMachineForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving machine type:', error);
    }
  };

  const handleComponentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingComponent) {
        await updateComponentType(editingComponent, componentForm);
        setEditingComponent(null);
      } else {
        await createComponentType(componentForm);
      }
      setComponentForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving component type:', error);
    }
  };

  const handleEditMachine = (machine: any) => {
    setEditingMachine(machine.id);
    setMachineForm({ name: machine.name, description: machine.description });
  };

  const handleEditComponent = (component: any) => {
    setEditingComponent(component.id);
    setComponentForm({ name: component.name, description: component.description });
  };

  const handleCancelEdit = () => {
    setEditingMachine(null);
    setEditingComponent(null);
    setMachineForm({ name: '', description: '' });
    setComponentForm({ name: '', description: '' });
  };

  const handleDeleteMachine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this machine type?')) {
      try {
        await deleteMachineType(id);
      } catch (error) {
        console.error('Error deleting machine type:', error);
      }
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this component type?')) {
      try {
        await deleteComponentType(id);
      } catch (error) {
        console.error('Error deleting component type:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">Manage machine and component types in the system</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to main page
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('machines')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'machines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Machine Types ({machineTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'components'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Component Types ({componentTypes.length})
          </button>
        </nav>
      </div>

      {/* Machine Types Tab */}
      {activeTab === 'machines' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingMachine ? 'Edit Machine Type' : 'New Machine Type'}
            </h2>
            <form onSubmit={handleMachineSubmit} className="space-y-4">
              <div>
                <label htmlFor="machine-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  id="machine-name"
                  type="text"
                  value={machineForm.name}
                  onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                  placeholder="E.g.: Backhoe loader"
                  required
                />
              </div>
              <div>
                <label htmlFor="machine-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="machine-description"
                  value={machineForm.description}
                  onChange={(e) => setMachineForm({ ...machineForm, description: e.target.value })}
                  placeholder="Description of the machine type"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" variant="primary">
                  {editingMachine ? 'Update' : 'Create'}
                </Button>
                {editingMachine && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Existing Machine Types</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {machineTypes.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No machine types registered
                </div>
              ) : (
                machineTypes.map((machine) => (
                  <div key={machine.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{machine.name}</h4>
                        <p className="text-gray-600">{machine.description}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Created: {new Date(machine.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditMachine(machine)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMachine(machine.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Component Types Tab */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingComponent ? 'Edit Component Type' : 'New Component Type'}
            </h2>
            <form onSubmit={handleComponentSubmit} className="space-y-4">
              <div>
                <label htmlFor="component-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  id="component-name"
                  type="text"
                  value={componentForm.name}
                  onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
                  placeholder="E.g.: Main Engine"
                  required
                />
              </div>
              <div>
                <label htmlFor="component-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="component-description"
                  value={componentForm.description}
                  onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })}
                  placeholder="Description of the component type"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" variant="primary">
                  {editingComponent ? 'Update' : 'Create'}
                </Button>
                {editingComponent && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Existing Component Types</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {componentTypes.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No component types registered
                </div>
              ) : (
                componentTypes.map((component) => (
                  <div key={component.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{component.name}</h4>
                        <p className="text-gray-600">{component.description}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Created: {new Date(component.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditComponent(component)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 