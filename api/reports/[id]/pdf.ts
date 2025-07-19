import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../../../backend/src/config/database';
import { PDFService } from '../../../backend/src/services/pdfService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Generar el PDF usando tu servicio real
    const pdfBuffer = await PDFService.generatePDF(
      report,
      components,
      allPhotos,
      suggestedPartsResult.rows
    );

    // Enviar el PDF como respuesta
    const filename = `Reporte_${report.client_name}_${report.machine_type}_${new Date(report.report_date).toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
} 