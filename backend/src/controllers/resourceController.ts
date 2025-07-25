import { Request, Response } from 'express';
import { getAllResources, createResource, deleteResource } from '../models/resourceModel';
import { AuthRequest } from '../middleware/auth';

export const listResources = async (req: Request, res: Response) => {
  try {
    const resources = await getAllResources();
    return res.json({ success: true, data: resources });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error fetching resources' });
  }
};

export const addResource = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can add resources' });
  }
  const { model, resource_name, resource_url } = req.body;
  if (!model || !resource_name || !resource_url) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const resource = await createResource({ model, resource_name, resource_url });
    return res.json({ success: true, data: resource });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error creating resource' });
  }
};

export const removeResource = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can delete resources' });
  }
  const { id } = req.params;
  try {
    await deleteResource(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error deleting resource' });
  }
}; 