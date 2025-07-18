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

const router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Report routes
router.post('/', upload.any(), handleUploadError, validateFileUpload, createReport as any);
router.get('/', getReports as any);
router.get('/:id', getReportById as any);
router.put('/:id', upload.any(), handleUploadError, validateFileUpload, updateReport as any);
router.delete('/:id', deleteReport as any);

// PDF and Email routes
// router.get('/:id/pdf', requireRole(['admin', 'user']), downloadPDF as any);
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

export default router; 