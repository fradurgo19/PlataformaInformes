import { Router } from 'express';
import { 
  createReport, 
  getReports, 
  getReportById, 
  updateReport, 
  deleteReport,
  downloadPDF,
  sendReportEmail,
  testEmailService,
  closeReport
} from '../controllers/reportController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';
import { validateFileUpload } from '../middleware/fileValidation';
import pool from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Report routes
router.post('/', upload.any(), handleUploadError, validateFileUpload, createReport as any);
router.get('/', getReports as any);
router.get('/:id', getReportById as any);
router.put('/:id', upload.any(), handleUploadError, validateFileUpload, updateReport as any);
router.delete('/:id', requireRole(['admin']), deleteReport as any);

// PDF and Email routes
router.get('/:id/pdf', requireRole(['admin', 'user', 'viewer']), downloadPDF as any);
router.post('/:id/email', sendReportEmail as any);
router.get('/test/email', testEmailService as any);

// Endpoint para cerrar el reporte
router.patch('/:id/close', requireRole(['admin', 'user']), closeReport as any);

// File upload route
router.post('/upload', upload.array('photos', 10), handleUploadError, validateFileUpload, (req: any, res: any) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype
    }));
    
    res.json({
      success: true,
      data: uploadedFiles,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route to delete a specific photo
router.delete('/photos/:photoId', authenticateToken as any, async (req, res) => {
  try {
    const photoId = req.params.photoId;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Get photo info to check permissions
    const photoResult = await pool.query(
      `SELECT p.*, c.report_id, r.user_id 
       FROM photos p 
       JOIN components c ON p.component_id = c.id 
       JOIN reports r ON c.report_id = r.id 
       WHERE p.id = $1`,
      [photoId]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }

    const photo = photoResult.rows[0];
    const reportOwnerId = photo.user_id;
    const isOwner = userId === reportOwnerId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this photo' });
    }

    // Check if report is closed
    const reportResult = await pool.query(
      'SELECT general_status FROM reports WHERE id = $1',
      [photo.report_id]
    );

    if (reportResult.rows[0]?.general_status === 'CLOSED') {
      return res.status(403).json({ success: false, error: 'Report is CLOSED and cannot be edited' });
    }

    // Delete the photo from Supabase Storage first
    if (photo.file_path && photo.file_path.startsWith('http')) {
      try {
        const { deleteFilesFromSupabase } = await import('../utils/supabaseStorage');
        await deleteFilesFromSupabase(photo.file_path);
      } catch (error) {
        console.error('Error deleting photo from Supabase:', error);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the photo from database
    await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);

    return res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router; 