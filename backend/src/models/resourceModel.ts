import pool from '../config/database';

export interface Resource {
  id: string;
  model: string;
  resource_name: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

export const getAllResources = async (): Promise<Resource[]> => {
  const result = await pool.query('SELECT * FROM resources ORDER BY model ASC, resource_name ASC');
  return result.rows;
};

export const createResource = async (data: { model: string; resource_name: string; resource_url: string }): Promise<Resource> => {
  const result = await pool.query(
    'INSERT INTO resources (model, resource_name, resource_url) VALUES ($1, $2, $3) RETURNING *',
    [data.model, data.resource_name, data.resource_url]
  );
  return result.rows[0];
};

export const deleteResource = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM resources WHERE id = $1', [id]);
}; 