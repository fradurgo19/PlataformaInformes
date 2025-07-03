import { Router } from 'express';
import {
  listComponentTypes,
  getComponentType,
  createComponentTypeHandler,
  updateComponentTypeHandler,
  deleteComponentTypeHandler
} from '../controllers/componentTypeController';

const router = Router();

router.get('/', listComponentTypes);
router.get('/:id', getComponentType);
router.post('/', createComponentTypeHandler);
router.put('/:id', updateComponentTypeHandler);
router.delete('/:id', deleteComponentTypeHandler);

export default router; 