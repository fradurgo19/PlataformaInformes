import { Request, Response } from 'express';
import { getAllParameters, createParameter, deleteParameter } from '../models/parameterModel';
import { AuthRequest } from '../middleware/auth';

export const listParameters = async (req: Request, res: Response) => {
  try {
    const parameters = await getAllParameters();
    return res.json({ success: true, data: parameters });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error fetching parameters' });
  }
};

export const addParameter = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can add parameters' });
  }
  const { parameter, parameter_type, model, min_range, max_range, resource_url } = req.body;
  if (!parameter || !parameter_type || !model || min_range === undefined || max_range === undefined || !resource_url) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const param = await createParameter({ parameter, parameter_type, model, min_range, max_range, resource_url });
    return res.json({ success: true, data: param });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error creating parameter' });
  }
};

export const removeParameter = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can delete parameters' });
  }
  const { id } = req.params;
  try {
    await deleteParameter(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error deleting parameter' });
  }
}; 