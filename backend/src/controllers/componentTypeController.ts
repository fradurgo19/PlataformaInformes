import { Request, Response } from 'express';
import {
  getAllComponentTypes,
  getComponentTypeById,
  createComponentType,
  updateComponentType,
  deleteComponentType
} from '../models/componentTypeModel';

export const listComponentTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await getAllComponentTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error fetching component types' });
  }
};

export const getComponentType = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = await getComponentTypeById(req.params.id);
    if (!type) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true, data: type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error fetching component type' });
  }
};

export const createComponentTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    const type = await createComponentType(name, description);
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error creating component type' });
  }
};

export const updateComponentTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    const type = await updateComponentType(id, name, description);
    if (!type) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true, data: type });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error updating component type' });
  }
};

export const deleteComponentTypeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteComponentType(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error deleting component type' });
  }
}; 