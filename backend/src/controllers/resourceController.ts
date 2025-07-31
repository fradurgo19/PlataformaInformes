import { Request, Response } from 'express';
import { getAllResources, createResource, deleteResource } from '../models/resourceModel';
import { AuthRequest } from '../middleware/auth';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

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
  const { model, resource_name, resource_url, observation } = req.body;
  if (!model || !resource_name || !resource_url) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const resource = await createResource({ model, resource_name, resource_url, observation });
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

export const bulkImportResources = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can import resources' });
  }

  try {
    const { csvData, excelData, fileType = 'csv', legacyFormat = false } = req.body;
    
    if (!csvData && !excelData) {
      return res.status(400).json({ success: false, error: 'File data is required' });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let errorCount = 0;
    const processedKeys = new Set<string>(); // Track processed combinations to avoid duplicates

    // Parse file data based on type
    if (fileType === 'excel' && excelData) {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(excelData, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and convert to objects
        const headers = jsonData[0] as string[];
        console.log('Excel headers:', headers);
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const rowObj: any = {};
          headers.forEach((header, index) => {
            // Clean header name and handle special characters
            const cleanHeader = header ? header.toString().trim() : '';
            rowObj[cleanHeader] = row[index];
          });
          results.push(rowObj);
        }
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          error: `Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    } else if (csvData) {
      // Parse CSV data
      try {
        const stream = Readable.from(csvData);
        
        await new Promise<void>((resolve, reject) => {
          stream
            .pipe(csv())
            .on('data', (row: any) => {
              results.push(row);
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (error: any) => {
              reject(error);
            });
        });
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          error: `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    // Process rows for both CSV and Excel
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 2; // +2 because file starts at row 2 (header is row 1)
      
      try {
        // Debug: Log the first row to see what columns are available
        if (i === 0) {
          console.log('=== DEBUG INFO ===');
          console.log('File type:', fileType);
          console.log('First row columns:', Object.keys(row));
          console.log('First row data:', row);
          console.log('Row keys:', Object.keys(row));
          console.log('Row values:', Object.values(row));
          console.log('Has model:', !!row.model);
          console.log('Has resource_name:', !!row.resource_name);
          console.log('Has resource_url:', !!row.resource_url);
          console.log('Has observation:', !!row.observation);
          console.log('==================');
        }

        // Check for duplicates
        const resourceKey = `${row.model?.trim()}-${row.resource_name?.trim()}`.toLowerCase();
        if (processedKeys.has(resourceKey)) {
          errors.push(`Row ${rowNumber}: Duplicate resource combination (${row.model} - ${row.resource_name})`);
          errorCount++;
          continue;
        }
        processedKeys.add(resourceKey);
        
        // Validate required fields (observation is optional)
        const missingFields = [];
        if (!row.model) missingFields.push('model');
        if (!row.resource_name) missingFields.push('resource_name');
        if (!row.resource_url) missingFields.push('resource_url');
        
        if (missingFields.length > 0) {
          errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
          errorCount++;
          continue;
        }

        // Create resource
        await createResource({
          model: row.model.trim(),
          resource_name: row.resource_name.trim(),
          resource_url: row.resource_url.trim(),
          observation: legacyFormat ? '' : (row.observation ? row.observation.trim() : '')
        });
        
        successCount++;
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    // Send response
    return res.json({
      success: true,
      data: {
        totalProcessed: results.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
}; 