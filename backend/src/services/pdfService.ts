import puppeteer from 'puppeteer';
import { Report, Component, Photo, SuggestedPart } from '../types';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export class PDFService {
  private static async getLogoBase64(): Promise<string> {
    const logoUrl = 'https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png';
    try {
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Error downloading logo for PDF:', error);
      return '';
    }
  }

  private static async generateHTML(report: Report, components: Component[], photos: Photo[], suggestedParts: SuggestedPart[]): Promise<string> {
    const logoBase64 = await this.getLogoBase64();
    const componentsHTMLPromises = components.map(async (component) => {
      const componentPhotos = photos.filter(photo => photo.component_id === component.id);
      
      const photosHTMLPromises = componentPhotos.map(async (photo) => {
        // Construct the absolute path to the image file
        const imagePath = path.join(__dirname, '..', '..', photo.file_path);
        
        try {
          // Read the image file and convert it to base64
          const imageBuffer = await fs.promises.readFile(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          const mimeType = photo.mime_type || 'image/jpeg'; // Fallback MIME type
          
          return `<img src="data:${mimeType};base64,${imageBase64}" alt="Foto del componente" style="max-width: 200px; margin: 5px; border: 1px solid #ddd; display: inline-block; vertical-align: top;">`;
        } catch (error) {
          console.error(`Error reading image file for PDF: ${imagePath}`, error);
          // Return a placeholder or empty string if image is not found
          return `<div style="width: 200px; height: 150px; border: 1px dashed #ccc; text-align: center; padding: 10px; display: inline-block;">Image not found</div>`;
        }
      });

      const photosHTMLArray = await Promise.all(photosHTMLPromises);
      const photosHTML = photosHTMLArray.join('');

      return `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; page-break-inside: avoid;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">${component.type}</h3>
          <p><strong>Hallazgos:</strong> ${component.findings}</p>
          ${component.parameters ? `<p><strong>Parámetros:</strong> ${component.parameters}</p>` : ''}
          <p><strong>Estado:</strong> <span style="color: ${component.status === 'CORRECTED' ? 'green' : 'orange'}; font-weight: bold;">${component.status}</span></p>
          <p><strong>Prioridad:</strong> <span style="color: ${component.priority === 'HIGH' ? 'red' : component.priority === 'MEDIUM' ? 'orange' : 'green'}; font-weight: bold;">${component.priority}</span></p>
          ${component.suggestions ? `<p><strong>Sugerencias:</strong> ${component.suggestions}</p>` : ''}
          ${photosHTML ? `<div style="margin-top: 10px;"><strong>Fotos:</strong><br>${photosHTML}</div>` : ''}
        </div>
      `;
    });

    const componentsHTMLArray = await Promise.all(componentsHTMLPromises);
    const componentsHTML = componentsHTMLArray.join('');

    const suggestedPartsHTML = suggestedParts.map(part => `
      <div style="margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px; page-break-inside: avoid;">
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
          .logo-container { width: 100%; display: flex; justify-content: center; align-items: center; margin-bottom: 10px; }
          .logo-img { width: 100%; max-width: 600px; height: auto; object-fit: contain; display: block; margin: 0 auto; }
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
        <div class="logo-container">
          <img class="logo-img" src="${logoBase64}" alt="Company Logo" />
        </div>
        <div class="header">
          <h1>🏗️ Reporte de Inspección de Maquinaria / Machinery Inspection Report</h1>
          <p><strong>Cliente / Client:</strong> ${report.client_name}</p>
          <p><strong>Fecha del Reporte / Report Date:</strong> ${new Date(report.report_date).toLocaleDateString('es-ES')}</p>
        </div>

        <div class="section">
          <h2>📋 Información General / General Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Tipo de Máquina / Machine Type:</strong><br>${report.machine_type}
            </div>
            <div class="info-item">
              <strong>Modelo / Model:</strong><br>${report.model}
            </div>
            <div class="info-item">
              <strong>Número de Serie / Serial Number:</strong><br>${report.serial_number}
            </div>
            <div class="info-item">
              <strong>Horómetro / Hourmeter:</strong><br>${report.hourmeter} horas
            </div>
            <div class="info-item">
              <strong>OTT:</strong><br>${report.ott || 'No especificado'}
            </div>
            <div class="info-item">
              <strong>Estado / Status:</strong><br>
              <span class="status-badge status-${report.status}">${report.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🔧 Evaluación de Componentes / Component Assessment</h2>
          ${componentsHTML}
        </div>

        ${suggestedParts.length > 0 ? `
        <div class="section">
          <h2>🛠️ Partes Sugeridas / Suggested Parts</h2>
          ${suggestedPartsHTML}
        </div>
        ` : ''}

        ${report.conclusions ? `
        <div class="section">
          <h2>�� Conclusiones / Conclusions</h2>
          <p>${report.conclusions}</p>
        </div>
        ` : ''}

        ${report.overall_suggestions ? `
        <div class="section">
          <h2>💡 Sugerencias Generales / Overall Suggestions</h2>
          <p>${report.overall_suggestions}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Reporte generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')} / Report generated on ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}</p>
          <p>Generado por / Generated by: ${report.user_full_name || report.user_id || 'Usuario no especificado / Unspecified user'}</p>
          <p>Plataforma de Informes de Maquinaria - Sistema de Gestión Técnica / Machinery Reports Platform - Technical Management System</p>
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