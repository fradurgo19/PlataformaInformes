import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../../../backend/src/config/database';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    let user: any;
    
    try {
      user = jwt.verify(token, secret);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verificar rol
    if (!['admin', 'user'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions. Only admin and user roles can update photo names.' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing photo id' });
    }

    const { photo_name } = req.body;
    if (photo_name === undefined || photo_name === null) {
      return res.status(400).json({ error: 'photo_name is required' });
    }

    // Verificar que la foto existe y pertenece al usuario o es accesible
    const photoResult = await pool.query(
      `SELECT p.*, c.report_id, r.user_id 
       FROM photos p 
       JOIN components c ON p.component_id = c.id 
       JOIN reports r ON c.report_id = r.id 
       WHERE p.id = $1`,
      [id]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = photoResult.rows[0];

    // Verificar permisos: solo el propietario del reporte o admin puede editar
    if (user.role !== 'admin' && photo.user_id !== user.id) {
      return res.status(403).json({ error: 'You can only edit photos from your own reports' });
    }

    // Actualizar el nombre de la foto
    const updateResult = await pool.query(
      'UPDATE photos SET photo_name = $1 WHERE id = $2 RETURNING *',
      [photo_name, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update photo name' });
    }

    res.json({
      success: true,
      data: updateResult.rows[0],
      message: 'Photo name updated successfully'
    });

  } catch (error) {
    console.error('Error updating photo name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
