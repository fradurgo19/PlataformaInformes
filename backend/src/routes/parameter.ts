import { Router } from 'express';
import { listParameters, addParameter, removeParameter, bulkImportParameters } from '../controllers/parameterController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todos los usuarios autenticados pueden ver parámetros
router.get('/', authenticateToken, listParameters);

// Solo admin puede agregar o eliminar parámetros
router.post('/', authenticateToken, addParameter);
router.post('/bulk-import', authenticateToken, bulkImportParameters);
router.delete('/:id', authenticateToken, removeParameter);

export default router; 