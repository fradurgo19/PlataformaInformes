import pool from '../config/database';

export interface MachineType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const getAllMachineTypes = async (): Promise<MachineType[]> => {
  const result = await pool.query('SELECT * FROM machine_types ORDER BY name ASC');
  return result.rows;
};

export const getMachineTypeById = async (id: string): Promise<MachineType | null> => {
  const result = await pool.query('SELECT * FROM machine_types WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createMachineType = async (name: string, description?: string): Promise<MachineType> => {
  const result = await pool.query(
    'INSERT INTO machine_types (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  return result.rows[0];
};

export const updateMachineType = async (id: string, name: string, description?: string): Promise<MachineType | null> => {
  const result = await pool.query(
    'UPDATE machine_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description || null, id]
  );
  return result.rows[0] || null;
};

export const deleteMachineType = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM machine_types WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}; 