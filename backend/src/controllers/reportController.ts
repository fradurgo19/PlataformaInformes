import { Request, Response } from 'express';
import pool from '../config/database';
import { Report, CreateReportRequest, ApiResponse } from '../types';
import { PDFService } from '../services/pdfService';
import { EmailService } from '../services/emailService';

export const createReport = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = (req as any).user.id;
    const reportData: CreateReportRequest = JSON.parse(req.body.reportData);
    const files = req.files as Express.Multer.File[];
    
    // Create report
    const reportResult = await client.query(
      `INSERT INTO reports (
        user_id, client_name, machine_type, model, serial_number, 
        hourmeter, report_date, ott, conclusions, overall_suggestions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        userId,
        reportData.client_name,
        reportData.machine_type,
        reportData.model,
        reportData.serial_number,
        reportData.hourmeter,
        reportData.report_date,
        reportData.ott,
        reportData.conclusions || null,
        reportData.overall_suggestions || null
      ]
    );
    
    const report = reportResult.rows[0];
    
    // Create components
    if (reportData.components && reportData.components.length > 0) {
      for (const [index, component] of reportData.components.entries()) {
        const componentResult = await client.query(
          `INSERT INTO components (
            report_id, type, findings, parameters, status, suggestions, priority
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`,
          [
            report.id,
            component.type,
            component.findings,
            component.parameters || null,
            component.status,
            component.suggestions || null,
            component.priority
          ]
        );
        
        const componentId = componentResult.rows[0].id;
        
        // Handle photos if any
        const componentPhotos = files.filter(
          (file) => file.fieldname === `photos_${index}`
        );

        if (componentPhotos.length > 0) {
          for (const photo of componentPhotos) {
            await client.query(
              `INSERT INTO photos (
                component_id, filename, original_name, file_path, file_size, mime_type
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                componentId,
                photo.filename,
                photo.originalname,
                photo.path,
                photo.size,
                photo.mimetype,
              ]
            );
          }
        }
      }
    }
    
    // Create suggested parts
    if (reportData.suggested_parts && reportData.suggested_parts.length > 0) {
      for (const part of reportData.suggested_parts) {
        await client.query(
          `INSERT INTO suggested_parts (
            report_id, part_number, description, quantity
          ) VALUES ($1, $2, $3, $4)`,
          [report.id, part.part_number, part.description, part.quantity]
        );
      }
    }
    
    await client.query('COMMIT');
    
    const response: ApiResponse<Report> = {
      success: true,
      data: report,
      message: 'Report created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const reportsResult = await pool.query(
      `SELECT * FROM reports WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reports WHERE user_id = $1',
      [userId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    const response: ApiResponse<{
      reports: Report[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        reports: reportsResult.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reportId = req.params.id;
    
    // Get report with components, photos, and suggested parts
    const reportResult = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found'
      });
      return;
    }
    
    const report = reportResult.rows[0];
    
    // Get components
    const componentsResult = await pool.query(
      'SELECT * FROM components WHERE report_id = $1',
      [reportId]
    );
    
    // Get photos for each component
    const components = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const photosResult = await pool.query(
          'SELECT * FROM photos WHERE component_id = $1',
          [component.id]
        );
        return {
          ...component,
          photos: photosResult.rows
        };
      })
    );
    
    // Get suggested parts
    const partsResult = await pool.query(
      'SELECT * FROM suggested_parts WHERE report_id = $1',
      [reportId]
    );
    
    const fullReport = {
      ...report,
      components,
      suggested_parts: partsResult.rows
    };
    
    const response: ApiResponse<Report> = {
      success: true,
      data: fullReport
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateReport = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = (req as any).user.id;
    const reportId = req.params.id;
    const updateData = req.body;
    
    // Check if report exists and belongs to user
    const existingReport = await client.query(
      'SELECT id FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    if (existingReport.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found'
      });
      return;
    }
    
    // Update report
    const reportResult = await client.query(
      `UPDATE reports SET 
        client_name = $1, machine_type = $2, model = $3, serial_number = $4,
        hourmeter = $5, report_date = $6, ott = $7, conclusions = $8, 
        overall_suggestions = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12 
       RETURNING *`,
      [
        updateData.client_name,
        updateData.machine_type,
        updateData.model,
        updateData.serial_number,
        updateData.hourmeter,
        updateData.report_date,
        updateData.ott,
        updateData.conclusions || null,
        updateData.overall_suggestions || null,
        updateData.status || 'draft',
        reportId,
        userId
      ]
    );
    
    await client.query('COMMIT');
    
    const response: ApiResponse<Report> = {
      success: true,
      data: reportResult.rows[0],
      message: 'Report updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = (req as any).user.id;
    const reportId = req.params.id;
    
    // Check if report exists and belongs to user
    const existingReport = await client.query(
      'SELECT id FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    if (existingReport.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found'
      });
      return;
    }
    
    // Delete report (cascade will handle related records)
    await client.query(
      'DELETE FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    await client.query('COMMIT');
    
    const response: ApiResponse = {
      success: true,
      message: 'Report deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

export const downloadPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reportId = req.params.id;
    
    // Get report with all related data
    const reportResult = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found'
      });
      return;
    }
    
    const report = reportResult.rows[0];
    
    // Get components
    const componentsResult = await pool.query(
      'SELECT * FROM components WHERE report_id = $1',
      [reportId]
    );
    
    // Get photos for each component
    const components = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const photosResult = await pool.query(
          'SELECT * FROM photos WHERE component_id = $1',
          [component.id]
        );
        return {
          ...component,
          photos: photosResult.rows
        };
      })
    );
    
    // Get suggested parts
    const suggestedPartsResult = await pool.query(
      'SELECT * FROM suggested_parts WHERE report_id = $1',
      [reportId]
    );
    
    // Flatten photos array
    const allPhotos = components.flatMap(component => component.photos);
    
    // Generate PDF
    const pdfBuffer = await PDFService.generatePDF(
      report,
      components,
      allPhotos,
      suggestedPartsResult.rows
    );
    
    // Set response headers
    const filename = `Reporte_${report.client_name}_${report.machine_type}_${new Date(report.report_date).toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
};

export const sendReportEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reportId = req.params.id;
    const { emails, subject, message } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Email addresses are required'
      });
      return;
    }
    
    // Get report with all related data
    const reportResult = await pool.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found'
      });
      return;
    }
    
    const report = reportResult.rows[0];
    
    // Get components
    const componentsResult = await pool.query(
      'SELECT * FROM components WHERE report_id = $1',
      [reportId]
    );
    
    // Get photos for each component
    const components = await Promise.all(
      componentsResult.rows.map(async (component) => {
        const photosResult = await pool.query(
          'SELECT * FROM photos WHERE component_id = $1',
          [component.id]
        );
        return {
          ...component,
          photos: photosResult.rows
        };
      })
    );
    
    // Get suggested parts
    const suggestedPartsResult = await pool.query(
      'SELECT * FROM suggested_parts WHERE report_id = $1',
      [reportId]
    );
    
    // Flatten photos array
    const allPhotos = components.flatMap(component => component.photos);
    
    // Generate PDF
    const pdfBuffer = await PDFService.generatePDF(
      report,
      components,
      allPhotos,
      suggestedPartsResult.rows
    );
    
    // Send emails
    const emailResults = await EmailService.sendMultipleEmails(
      emails,
      report,
      pdfBuffer,
      subject,
      message
    );
    
    const response: ApiResponse<{
      success: string[];
      failed: string[];
      totalSent: number;
      totalFailed: number;
    }> = {
      success: true,
      data: {
        success: emailResults.success,
        failed: emailResults.failed,
        totalSent: emailResults.success.length,
        totalFailed: emailResults.failed.length
      },
      message: `Email sent to ${emailResults.success.length} recipients${emailResults.failed.length > 0 ? `, ${emailResults.failed.length} failed` : ''}`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
};

export const testEmailService = async (req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = await EmailService.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Email service is working correctly'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email service connection failed'
      });
    }
  } catch (error) {
    console.error('Test email service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test email service'
    });
  }
}; 