import nodemailer from 'nodemailer';
import { Report } from '../types';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });

  // Función para sanitizar nombres de archivo (remover caracteres especiales)
  private static sanitizeFilename(filename: string): string {
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
  }

  static async sendReportEmail(
    toEmail: string,
    report: Report,
    pdfBuffer: Buffer,
    subject?: string,
    message?: string
  ): Promise<boolean> {
    try {
      const defaultSubject = `Reporte de Inspección - ${report.client_name} - ${report.machine_type}`;
      const defaultMessage = `
        Estimado cliente,

        Adjunto encontrará el reporte de inspección técnica de la maquinaria ${report.machine_type} modelo ${report.model}.

        Detalles del reporte:
        - Cliente: ${report.client_name}
        - Máquina: ${report.machine_type} ${report.model}
        - Número de Serie: ${report.serial_number}
        - Horómetro: ${report.hourmeter} horas
        - Fecha de Inspección: ${new Date(report.report_date).toLocaleDateString('es-ES')}

        Si tiene alguna pregunta o necesita aclaraciones sobre el reporte, no dude en contactarnos.

        Saludos cordiales,
        Equipo de Inspección Técnica
        Plataforma de Informes de Maquinaria
      `;

      const mailOptions = {
        from: process.env.SMTP_USER || 'your-email@gmail.com',
        to: toEmail,
        subject: subject || defaultSubject,
        text: message || defaultMessage,
        attachments: [
          {
            filename: this.sanitizeFilename(`Reporte_${report.client_name}_${report.machine_type}_${new Date(report.report_date).toISOString().split('T')[0]}.pdf`),
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendMultipleEmails(
    emails: string[],
    report: Report,
    pdfBuffer: Buffer,
    subject?: string,
    message?: string
  ): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const email of emails) {
      try {
        const sent = await this.sendReportEmail(email, report, pdfBuffer, subject, message);
        if (sent) {
          results.success.push(email);
        } else {
          results.failed.push(email);
        }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.failed.push(email);
      }
    }

    return results;
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
} 