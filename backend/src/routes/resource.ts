import { Router } from 'express';
import { listResources, addResource, removeResource, bulkImportResources } from '../controllers/resourceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todos los usuarios autenticados pueden ver recursos
router.get('/', authenticateToken, listResources);

// Solo admin puede agregar, eliminar o importar recursos
router.post('/', authenticateToken, addResource);
router.post('/bulk-import', authenticateToken, bulkImportResources);
router.delete('/:id', authenticateToken, removeResource);

export default router; 