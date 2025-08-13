import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { Report, Component, Photo, SuggestedPart } from '../types';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export class PDFService {
  // Función helper para procesar texto y preservar saltos de línea
  private static processTextWithLineBreaks(text: string): string {
    if (!text) return '';
    // Convertir saltos de línea en elementos <br> y preservar espacios múltiples
    return text
      .replace(/\n/g, '<br>')
      .replace(/\s{2,}/g, (match) => '&nbsp;'.repeat(match.length));
  }

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
        let imageBase64 = '';
        let mimeType = photo.mime_type || 'image/jpeg';

        try {
          if (photo.file_path.startsWith('http')) {
            // Descargar la imagen desde Supabase Storage
            const response = await axios.get(photo.file_path, { responseType: 'arraybuffer' });
            imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
          } else {
            // Leer desde disco (compatibilidad)
            const imagePath = path.join(__dirname, '..', '..', photo.file_path);
            const imageBuffer = await fs.promises.readFile(imagePath);
            imageBase64 = imageBuffer.toString('base64');
          }
          return `<img src="data:${mimeType};base64,${imageBase64}" alt="Foto del componente" class="photo-item" style="object-fit: cover;">`;
        } catch (error) {
          console.error(`Error reading image file for PDF: ${photo.file_path}`, error);
          return `<div class="photo-item" style="border: 1px dashed #ccc; text-align: center; padding: 10px; display: flex; align-items: center; justify-content: center;">Image not found</div>`;
        }
      });

      const photosHTMLArray = await Promise.all(photosHTMLPromises);
      const photosHTML = photosHTMLArray.join('');

      return `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; page-break-inside: avoid;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">${component.type}</h3>
          <p><strong>Hallazgos / Findings:</strong> ${this.processTextWithLineBreaks(component.findings)}</p>
          ${component.parameters && Array.isArray(component.parameters) && component.parameters.length > 0 ? `
  <div style="margin: 10px 0;">
    <strong>Parámetros / Parameters:</strong>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 13px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="border: 1px solid #ccc; padding: 4px;">Nombre / Name</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Mín / Min Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Máx / Max Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Medido / Measured Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Corregido / Corrected</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Observación / Observation</th>
        </tr>
      </thead>
      <tbody>
        ${component.parameters.map((param: any) => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 4px;">${param.name ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.minValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.maxValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.measuredValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${param.corrected ? 'Sí / Yes' : 'No'}</td>
            <td style="border: 1px solid #ccc; padding: 4px;">${param.observation ?? ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
` : ''}
          <p><strong>Estado / Status:</strong> <span style="color: ${component.status === 'CORRECTED' ? 'green' : 'orange'}; font-weight: bold;">${component.status}</span></p>
          <p><strong>Prioridad / Priority:</strong> <span style="color: ${component.priority === 'HIGH' ? 'red' : component.priority === 'MEDIUM' ? 'orange' : 'green'}; font-weight: bold;">${component.priority}</span></p>
          ${component.suggestions ? `<p><strong>Sugerencias / Suggestions:</strong> ${this.processTextWithLineBreaks(component.suggestions)}</p>` : ''}
          ${photosHTML ? `<div style="margin-top: 10px;"><strong>Fotos / Photos:</strong><div class="photos-container">${photosHTML}</div></div>` : ''}
        </div>
      `;
    });

    const componentsHTMLArray = await Promise.all(componentsHTMLPromises);
    const componentsHTML = componentsHTMLArray.join('');

    const suggestedPartsHTML = suggestedParts.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #ccc; padding: 6px;">Parte / Part</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Descripción / Description</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Cantidad / Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${suggestedParts.map(part => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${part.part_number}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${part.description}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${part.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

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
          .photos-container { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; }
          .photo-item { width: 200px; height: 150px; margin: 0; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <img class="logo-img" src="${logoBase64}" alt="Company Logo" />
        </div>
        <div class="header">
          <h1>Reporte de Inspección de Maquinaria / Machinery Inspection Report</h1>
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
            ${report.reason_of_service ? `
            <div class="info-item">
              <strong>Razón del Servicio / Reason of Service:</strong><br>${this.processTextWithLineBreaks(report.reason_of_service)}
            </div>
            ` : ''}
            <div class="info-item">
              <strong>Estado / Status:</strong><br>
              <span class="status-badge" style="background-color: ${report.general_status === 'CLOSED' ? '#fee2e2' : '#fef9c3'}; color: ${report.general_status === 'CLOSED' ? '#b91c1c' : '#92400e'};">${report.general_status ? report.general_status.toUpperCase() : 'N/A'}</span>
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
          <h2>📝 Conclusiones / Conclusions</h2>
          <p>${this.processTextWithLineBreaks(report.conclusions)}</p>
        </div>
        ` : ''}

        ${report.overall_suggestions ? `
        <div class="section">
          <h2>💡 Sugerencias Generales / Overall Suggestions</h2>
          <p>${this.processTextWithLineBreaks(report.overall_suggestions)}</p>
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

  private static async generateHTMLWithoutLogo(report: Report, components: Component[], photos: Photo[], suggestedParts: SuggestedPart[]): Promise<string> {
    const componentsHTMLPromises = components.map(async (component) => {
      const componentPhotos = photos.filter(photo => photo.component_id === component.id);
      
      const photosHTMLPromises = componentPhotos.map(async (photo) => {
        let imageBase64 = '';
        let mimeType = photo.mime_type || 'image/jpeg';

        try {
          if (photo.file_path.startsWith('http')) {
            // Descargar la imagen desde Supabase Storage
            const response = await axios.get(photo.file_path, { responseType: 'arraybuffer' });
            imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
          } else {
            // Leer desde disco (compatibilidad)
            const imagePath = path.join(__dirname, '..', '..', photo.file_path);
            const imageBuffer = await fs.promises.readFile(imagePath);
            imageBase64 = imageBuffer.toString('base64');
          }
          return `<img src="data:${mimeType};base64,${imageBase64}" alt="Foto del componente" class="photo-item" style="object-fit: cover;">`;
        } catch (error) {
          console.error(`Error reading image file for PDF: ${photo.file_path}`, error);
          return `<div class="photo-item" style="border: 1px dashed #ccc; text-align: center; padding: 10px; display: flex; align-items: center; justify-content: center;">Image not found</div>`;
        }
      });

      const photosHTMLArray = await Promise.all(photosHTMLPromises);
      const photosHTML = photosHTMLArray.join('');

      return `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; page-break-inside: avoid;">
          <h3 style="color: #2563eb; margin-bottom: 10px;">${component.type}</h3>
          <p><strong>Hallazgos / Findings:</strong> ${this.processTextWithLineBreaks(component.findings)}</p>
          ${component.parameters && Array.isArray(component.parameters) && component.parameters.length > 0 ? `
  <div style="margin: 10px 0;">
    <strong>Parámetros / Parameters:</strong>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 13px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="border: 1px solid #ccc; padding: 4px;">Nombre / Name</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Mín / Min Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Máx / Max Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Valor Medido / Measured Value</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Corregido / Corrected</th>
          <th style="border: 1px solid #ccc; padding: 4px;">Observación / Observation</th>
        </tr>
      </thead>
      <tbody>
        ${component.parameters.map((param: any) => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 4px;">${param.name ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.minValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.maxValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">${param.measuredValue ?? ''}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${param.corrected ? 'Sí / Yes' : 'No'}</td>
            <td style="border: 1px solid #ccc; padding: 4px;">${param.observation ?? ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
` : ''}
          <p><strong>Estado / Status:</strong> <span style="color: ${component.status === 'CORRECTED' ? 'green' : 'orange'}; font-weight: bold;">${component.status}</span></p>
          <p><strong>Prioridad / Priority:</strong> <span style="color: ${component.priority === 'HIGH' ? 'red' : component.priority === 'MEDIUM' ? 'orange' : 'green'}; font-weight: bold;">${component.priority}</span></p>
          ${component.suggestions ? `<p><strong>Sugerencias / Suggestions:</strong> ${this.processTextWithLineBreaks(component.suggestions)}</p>` : ''}
          ${photosHTML ? `<div style="margin-top: 10px;"><strong>Fotos / Photos:</strong><div class="photos-container">${photosHTML}</div></div>` : ''}
        </div>
      `;
    });

    const componentsHTMLArray = await Promise.all(componentsHTMLPromises);
    const componentsHTML = componentsHTMLArray.join('');

    const suggestedPartsHTML = suggestedParts.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #ccc; padding: 6px;">Parte / Part</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Descripción / Description</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Cantidad / Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${suggestedParts.map(part => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${part.part_number}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${part.description}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align: right;">${part.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

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
          .photos-container { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; }
          .photo-item { width: 200px; height: 150px; margin: 0; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Inspección de Maquinaria / Machinery Inspection Report</h1>
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
            ${report.reason_of_service ? `
            <div class="info-item">
              <strong>Razón del Servicio / Reason of Service:</strong><br>${this.processTextWithLineBreaks(report.reason_of_service)}
            </div>
            ` : ''}
            <div class="info-item">
              <strong>Estado / Status:</strong><br>
              <span class="status-badge" style="background-color: ${report.general_status === 'CLOSED' ? '#fee2e2' : '#fef9c3'}; color: ${report.general_status === 'CLOSED' ? '#b91c1c' : '#92400e'};">${report.general_status ? report.general_status.toUpperCase() : 'N/A'}</span>
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
          <h2>📝 Conclusiones / Conclusions</h2>
          <p>${this.processTextWithLineBreaks(report.conclusions)}</p>
        </div>
        ` : ''}

        ${report.overall_suggestions ? `
        <div class="section">
          <h2>💡 Sugerencias Generales / Overall Suggestions</h2>
          <p>${this.processTextWithLineBreaks(report.overall_suggestions)}</p>
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
      const executablePath = await chromium.executablePath();
      if (!executablePath) {
        throw new Error('Chromium executablePath not found. PDF generation is not supported in this environment.');
      }
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
        ignoreDefaultArgs: ['--disable-extensions'],
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

  static async generatePDFWithoutLogo(report: Report, components: Component[], photos: Photo[], suggestedParts: SuggestedPart[]): Promise<Buffer> {
    try {
      const executablePath = await chromium.executablePath();
      if (!executablePath) {
        throw new Error('Chromium executablePath not found. PDF generation is not supported in this environment.');
      }
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
        ignoreDefaultArgs: ['--disable-extensions'],
      });

      const page = await browser.newPage();
      const html = await this.generateHTMLWithoutLogo(report, components, photos, suggestedParts);
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
      console.error('Error generating PDF without logo:', error);
      throw new Error('Failed to generate PDF without logo');
    }
  }
} 