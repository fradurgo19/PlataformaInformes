import pool from '../config/database';

export interface ComponentType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const getAllComponentTypes = async (): Promise<ComponentType[]> => {
  const result = await pool.query('SELECT * FROM component_types ORDER BY name ASC');
  return result.rows;
};

export const getComponentTypeById = async (id: string): Promise<ComponentType | null> => {
  const result = await pool.query('SELECT * FROM component_types WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createComponentType = async (name: string, description?: string): Promise<ComponentType> => {
  const result = await pool.query(
    'INSERT INTO component_types (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  return result.rows[0];
};

export const updateComponentType = async (id: string, name: string, description?: string): Promise<ComponentType | null> => {
  const result = await pool.query(
    'UPDATE component_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description || null, id]
  );
  return result.rows[0] || null;
};

export const deleteComponentType = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM component_types WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}; 