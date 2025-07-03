import { Router } from 'express';
import {
  listMachineTypes,
  getMachineType,
  createMachineTypeHandler,
  updateMachineTypeHandler,
  deleteMachineTypeHandler
} from '../controllers/machineTypeController';

const router = Router();

router.get('/', listMachineTypes);
router.get('/:id', getMachineType);
router.post('/', createMachineTypeHandler);
router.put('/:id', updateMachineTypeHandler);
router.delete('/:id', deleteMachineTypeHandler);

export default router; 