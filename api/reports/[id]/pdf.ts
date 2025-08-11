import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../../../backend/src/config/database';
import { PDFService } from '../../../backend/src/services/pdfService';
import jwt from 'jsonwebtoken';

// Función para sanitizar nombres de archivo (remover caracteres especiales)
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ÁÄÂÀ]/g, 'A')
    .replace(/[ÉËÊÈ]/g, 'E')
    .replace(/[ÍÏÎÌ]/g, 'I')
    .replace(/[ÓÖÔÒ]/g, 'O')
    .replace(/[ÚÜÛÙ]/g, 'U')
    .replace(/[Ñ]/g, 'N')
    .replace(/[^a-zA-Z0-9\s\-_\.]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/\s+/g, '_') // Reemplazar espacios con _
    .replace(/_+/g, '_') // Reemplazar múltiples _ con uno solo
    .trim();
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
    if (!['admin', 'user', 'viewer'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing report id' });
    }

    // Obtener datos del reporte, componentes, fotos y partes sugeridas
    const reportResult = await pool.query(
      `SELECT r.*, u.full_name as user_full_name FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = $1`,
      [id]
    );
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = reportResult.rows[0];

    const componentsResult = await pool.query(
      'SELECT * FROM components WHERE report_id = $1',
      [id]
    );
    const components = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const photosResult = await pool.query(
          'SELECT * FROM photos WHERE component_id = $1',
          [component.id]
        );
        return {
          ...component,
          parameters: component.parameters ? JSON.parse(component.parameters) : [],
          photos: photosResult.rows
        };
      })
    );
    const suggestedPartsResult = await pool.query(
      'SELECT * FROM suggested_parts WHERE report_id = $1',
      [id]
    );
    const allPhotos = components.flatMap((component: any) => component.photos);

    // Generar el PDF basado en el rol del usuario
    let pdfBuffer: Buffer;
    if (user.role === 'viewer') {
      pdfBuffer = await PDFService.generatePDFWithoutLogo(
        report,
        components,
        allPhotos,
        suggestedPartsResult.rows
      );
    } else {
      pdfBuffer = await PDFService.generatePDF(
        report,
        components,
        allPhotos,
        suggestedPartsResult.rows
      );
    }

    // Enviar el PDF como respuesta
    const filename = `Reporte_${report.client_name}_${report.machine_type}_${new Date(report.report_date).toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(filename)}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
} 