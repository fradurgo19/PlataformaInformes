import pool from '../config/database';

export interface Parameter {
	id: string;
	parameter: string;
	parameter_type: string;
	model: string;
	min_range: number;
	max_range: number;
	limit_range?: string;
	resource_url: string;
	observation?: string;
	created_at: string;
	updated_at: string;
}

export const getAllParameters = async (): Promise<Parameter[]> => {
	const result = await pool.query('SELECT * FROM parameters ORDER BY model ASC, parameter ASC');
	return result.rows;
};

export const createParameter = async (data: { parameter: string; parameter_type: string; model: string; min_range: number; max_range: number; resource_url: string; observation?: string; limit_range?: string }): Promise<Parameter> => {
	// Inserción segura que incluye limit_range si la columna existe (asumimos migración aplicada)
	const result = await pool.query(
		'INSERT INTO parameters (parameter, parameter_type, model, min_range, max_range, limit_range, resource_url, observation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
		[data.parameter, data.parameter_type, data.model, data.min_range, data.max_range, data.limit_range || null, data.resource_url, data.observation || '']
	);
	return result.rows[0];
};

export const deleteParameter = async (id: string): Promise<void> => {
	await pool.query('DELETE FROM parameters WHERE id = $1', [id]);
}; 