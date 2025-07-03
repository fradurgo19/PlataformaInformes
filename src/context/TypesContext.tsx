import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MachineType, ComponentType } from '../types';
import { apiService } from '../services/api';

interface TypesContextType {
  machineTypes: MachineType[];
  componentTypes: ComponentType[];
  loading: boolean;
  error: string | null;
  refreshMachineTypes: () => Promise<void>;
  refreshComponentTypes: () => Promise<void>;
  createMachineType: (data: { name: string; description: string }) => Promise<void>;
  createComponentType: (data: { name: string; description: string }) => Promise<void>;
  updateMachineType: (id: string, data: { name: string; description: string }) => Promise<void>;
  updateComponentType: (id: string, data: { name: string; description: string }) => Promise<void>;
  deleteMachineType: (id: string) => Promise<void>;
  deleteComponentType: (id: string) => Promise<void>;
}

const TypesContext = createContext<TypesContextType | undefined>(undefined);

export const useTypes = () => {
  const context = useContext(TypesContext);
  if (context === undefined) {
    throw new Error('useTypes must be used within a TypesProvider');
  }
  return context;
};

interface TypesProviderProps {
  children: ReactNode;
}

export const TypesProvider: React.FC<TypesProviderProps> = ({ children }) => {
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachineTypes = async () => {
    try {
      setError(null);
      const response = await apiService.getMachineTypes();
      if (response.success && response.data) {
        setMachineTypes(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching machine types');
      console.error('Error fetching machine types:', err);
    }
  };

  const fetchComponentTypes = async () => {
    try {
      setError(null);
      const response = await apiService.getComponentTypes();
      if (response.success && response.data) {
        setComponentTypes(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching component types');
      console.error('Error fetching component types:', err);
    }
  };

  const refreshMachineTypes = async () => {
    await fetchMachineTypes();
  };

  const refreshComponentTypes = async () => {
    await fetchComponentTypes();
  };

  const createMachineType = async (data: { name: string; description: string }) => {
    try {
      setError(null);
      const response = await apiService.createMachineType(data);
      if (response.success) {
        await fetchMachineTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating machine type');
      throw err;
    }
  };

  const createComponentType = async (data: { name: string; description: string }) => {
    try {
      setError(null);
      const response = await apiService.createComponentType(data);
      if (response.success) {
        await fetchComponentTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating component type');
      throw err;
    }
  };

  const updateMachineType = async (id: string, data: { name: string; description: string }) => {
    try {
      setError(null);
      const response = await apiService.updateMachineType(id, data);
      if (response.success) {
        await fetchMachineTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating machine type');
      throw err;
    }
  };

  const updateComponentType = async (id: string, data: { name: string; description: string }) => {
    try {
      setError(null);
      const response = await apiService.updateComponentType(id, data);
      if (response.success) {
        await fetchComponentTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating component type');
      throw err;
    }
  };

  const deleteMachineType = async (id: string) => {
    try {
      setError(null);
      const response = await apiService.deleteMachineType(id);
      if (response.success) {
        await fetchMachineTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting machine type');
      throw err;
    }
  };

  const deleteComponentType = async (id: string) => {
    try {
      setError(null);
      const response = await apiService.deleteComponentType(id);
      if (response.success) {
        await fetchComponentTypes();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting component type');
      throw err;
    }
  };

  useEffect(() => {
    const initializeTypes = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMachineTypes(), fetchComponentTypes()]);
      } catch (err) {
        console.error('Error initializing types:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeTypes();
  }, []);

  const value: TypesContextType = {
    machineTypes,
    componentTypes,
    loading,
    error,
    refreshMachineTypes,
    refreshComponentTypes,
    createMachineType,
    createComponentType,
    updateMachineType,
    updateComponentType,
    deleteMachineType,
    deleteComponentType,
  };

  return (
    <TypesContext.Provider value={value}>
      {children}
    </TypesContext.Provider>
  );
}; 