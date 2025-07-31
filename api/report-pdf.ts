import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { report, components, photos, suggestedParts } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = height - 40;

    // Título
    page.drawText('Reporte de Inspección de Maquinaria', {
      x: 50,
      y,
      size: 18,
      font,
      color: rgb(0.15, 0.25, 0.92),
    });
    y -= 30;

    // Datos principales
    page.drawText(`Cliente: ${report.client_name || ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    page.drawText(`Tipo de máquina: ${report.machine_type || ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    page.drawText(`Modelo: ${report.model || ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    page.drawText(`Serie: ${report.serial_number || ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    page.drawText(`Fecha: ${report.report_date ? new Date(report.report_date).toLocaleDateString() : ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    page.drawText(`OTT: ${report.ott || ''}`, { x: 50, y, size: 12, font });
    y -= 18;
    if (report.reason_of_service) {
      page.drawText(`Razón del Servicio: ${report.reason_of_service}`, { x: 50, y, size: 12, font });
      y -= 18;
    }
    y -= 6;

    // Componentes
    page.drawText('Componentes:', { x: 50, y, size: 14, font });
    y -= 18;
    for (const component of components) {
      page.drawText(`- ${component.type}: ${component.status}`, { x: 60, y, size: 12, font });
      y -= 16;
      if (component.findings) {
        page.drawText(`  Hallazgos: ${component.findings}`, { x: 70, y, size: 10, font });
        y -= 14;
      }
      if (component.suggestions) {
        page.drawText(`  Sugerencias: ${component.suggestions}`, { x: 70, y, size: 10, font });
        y -= 14;
      }
      // Fotos asociadas
      const compPhotos = (component.photos || []);
      if (compPhotos.length > 0) {
        page.drawText('  Fotos:', { x: 70, y, size: 10, font });
        y -= 12;
        for (const photo of compPhotos) {
          page.drawText(`    ${photo.file_path}`, { x: 80, y, size: 8, font, color: rgb(0.1, 0.1, 0.7) });
          y -= 10;
        }
      }
      y -= 6;
      if (y < 60) {
        y = height - 40;
        pdfDoc.addPage();
      }
    }

    // Piezas sugeridas
    if (suggestedParts && suggestedParts.length > 0) {
      page.drawText('Piezas sugeridas:', { x: 50, y, size: 14, font });
      y -= 18;
      for (const part of suggestedParts) {
        page.drawText(`- ${part.part_number}: ${part.description} (x${part.quantity})`, { x: 60, y, size: 12, font });
        y -= 14;
        if (y < 60) {
          y = height - 40;
          pdfDoc.addPage();
        }
      }
    }

    // Conclusiones
    if (report.conclusions) {
      page.drawText('Conclusiones:', { x: 50, y, size: 14, font });
      y -= 18;
      page.drawText(report.conclusions, { x: 60, y, size: 12, font });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte.pdf"');
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
} 