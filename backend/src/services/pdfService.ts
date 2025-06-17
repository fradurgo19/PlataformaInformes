import puppeteer from 'puppeteer';
import { Report, Component, Photo, SuggestedPart } from '../types';

export class PDFService {
  private static async generateHTML(report: Report, components: Component[], photos: Photo[], suggestedParts: SuggestedPart[]): Promise<string> {
    const componentsHTML = components.map(component => {
      const componentPhotos = photos.filter(photo => photo.component_id === component.id);
      const photosHTML = componentPhotos.map(photo => 
        `<img src="data:image/jpeg;base64,${photo.file_path}" alt="Foto del componente" style="max-width: 200px; margin: 5px; border: 1px solid #ddd;">`
      ).join('');

      return `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">${component.type}</h3>
          <p><strong>Hallazgos:</strong> ${component.findings}</p>
          ${component.parameters ? `<p><strong>Parámetros:</strong> ${component.parameters}</p>` : ''}
          <p><strong>Estado:</strong> <span style="color: ${component.status === 'CORRECTED' ? 'green' : 'orange'}; font-weight: bold;">${component.status}</span></p>
          <p><strong>Prioridad:</strong> <span style="color: ${component.priority === 'HIGH' ? 'red' : component.priority === 'MEDIUM' ? 'orange' : 'green'}; font-weight: bold;">${component.priority}</span></p>
          ${component.suggestions ? `<p><strong>Sugerencias:</strong> ${component.suggestions}</p>` : ''}
          ${photosHTML ? `<div style="margin-top: 10px;"><strong>Fotos:</strong><br>${photosHTML}</div>` : ''}
        </div>
      `;
    }).join('');

    const suggestedPartsHTML = suggestedParts.map(part => `
      <div style="margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
        <p><strong>Parte:</strong> ${part.part_number}</p>
        <p><strong>Descripción:</strong> ${part.description}</p>
        <p><strong>Cantidad:</strong> ${part.quantity}</p>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Maquinaria - ${report.client_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .section { margin: 20px 0; }
          .section h2 { color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
          .info-item { padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
          .info-item strong { color: #2563eb; }
          .status-badge { padding: 5px 10px; border-radius: 15px; font-weight: bold; }
          .status-draft { background-color: #fef3c7; color: #92400e; }
          .status-completed { background-color: #d1fae5; color: #065f46; }
          .status-archived { background-color: #e5e7eb; color: #374151; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏗️ Reporte de Inspección de Maquinaria</h1>
          <p><strong>Cliente:</strong> ${report.client_name}</p>
          <p><strong>Fecha del Reporte:</strong> ${new Date(report.report_date).toLocaleDateString('es-ES')}</p>
        </div>

        <div class="section">
          <h2>📋 Información General</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Tipo de Máquina:</strong><br>${report.machine_type}
            </div>
            <div class="info-item">
              <strong>Modelo:</strong><br>${report.model}
            </div>
            <div class="info-item">
              <strong>Número de Serie:</strong><br>${report.serial_number}
            </div>
            <div class="info-item">
              <strong>Horómetro:</strong><br>${report.hourmeter} horas
            </div>
            <div class="info-item">
              <strong>OTT:</strong><br>${report.ott || 'No especificado'}
            </div>
            <div class="info-item">
              <strong>Estado:</strong><br>
              <span class="status-badge status-${report.status}">${report.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🔧 Evaluación de Componentes</h2>
          ${componentsHTML}
        </div>

        ${suggestedParts.length > 0 ? `
        <div class="section">
          <h2>🛠️ Partes Sugeridas</h2>
          ${suggestedPartsHTML}
        </div>
        ` : ''}

        ${report.conclusions ? `
        <div class="section">
          <h2>📝 Conclusiones</h2>
          <p>${report.conclusions}</p>
        </div>
        ` : ''}

        ${report.overall_suggestions ? `
        <div class="section">
          <h2>💡 Sugerencias Generales</h2>
          <p>${report.overall_suggestions}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Reporte generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
          <p>Plataforma de Informes de Maquinaria - Sistema de Gestión Técnica</p>
        </div>
      </body>
      </html>
    `;
  }

  static async generatePDF(report: Report, components: Component[], photos: Photo[], suggestedParts: SuggestedPart[]): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      const html = await this.generateHTML(report, components, photos, suggestedParts);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: false
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
} 