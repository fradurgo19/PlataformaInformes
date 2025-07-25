import { Router } from 'express';
import { listResources, addResource, removeResource } from '../controllers/resourceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todos los usuarios autenticados pueden ver recursos
router.get('/', authenticateToken, listResources);

// Solo admin puede agregar o eliminar recursos
router.post('/', authenticateToken, addResource);
router.delete('/:id', authenticateToken, removeResource);

export default router; 