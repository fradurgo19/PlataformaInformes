import { Request, Response } from 'express';
import {
  getAllMachineTypes,
  getMachineTypeById,
  createMachineType,
  updateMachineType,
  deleteMachineType
} from '../models/machineTypeModel';

export const listMachineTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await getAllMachineTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching machine types' });
  }
};

export const getMachineType = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = await getMachineTypeById(req.params.id);
    if (!type) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching machine type' });
  }
};

export const createMachineTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    const type = await createMachineType(name, description);
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating machine type' });
  }
};

export const updateMachineTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    const type = await updateMachineType(id, name, description);
    if (!type) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error updating machine type' });
  }
};

export const deleteMachineTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteMachineType(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error deleting machine type' });
  }
}; 