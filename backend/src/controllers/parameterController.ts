import { Request, Response } from 'express';
import { getAllParameters, createParameter, deleteParameter } from '../models/parameterModel';
import { AuthRequest } from '../middleware/auth';
import csv from 'csv-parser';
import { Readable } from 'stream';

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
  const { parameter, parameter_type, model, min_range, max_range, resource_url, observation } = req.body;
  if (!parameter || !parameter_type || !model || min_range === undefined || max_range === undefined || !resource_url) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const param = await createParameter({ parameter, parameter_type, model, min_range, max_range, resource_url, observation });
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

export const bulkImportParameters = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Only admin can import parameters' });
  }

  try {
    const { csvData, legacyFormat = false } = req.body;
    
    if (!csvData) {
      return res.status(400).json({ success: false, error: 'CSV data is required' });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Parse CSV data
    const stream = Readable.from(csvData);
    
    return new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row: any) => {
          results.push(row);
        })
        .on('end', async () => {
          try {
            // Process each row
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              const rowNumber = i + 2; // +2 because CSV starts at row 2 (header is row 1)
              
              try {
                // Debug: Log the first row to see what columns are available
                if (i === 0) {
                  console.log('First row columns:', Object.keys(row));
                  console.log('First row data:', row);
                }
                
                // Validate required fields (observation is optional)
                const missingFields = [];
                if (!row.parameter) missingFields.push('parameter');
                if (!row.parameter_type) missingFields.push('parameter_type');
                if (!row.model) missingFields.push('model');
                if (row.min_range === undefined) missingFields.push('min_range');
                if (row.max_range === undefined) missingFields.push('max_range');
                if (!row.resource_url) missingFields.push('resource_url');
                
                if (missingFields.length > 0) {
                  errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
                  errorCount++;
                  continue;
                }

                // Validate numeric fields
                const minRange = parseFloat(row.min_range);
                const maxRange = parseFloat(row.max_range);
                
                if (isNaN(minRange) || isNaN(maxRange)) {
                  errors.push(`Row ${rowNumber}: Invalid numeric values for ranges`);
                  errorCount++;
                  continue;
                }

                if (minRange >= maxRange) {
                  errors.push(`Row ${rowNumber}: Minimum range must be less than maximum range`);
                  errorCount++;
                  continue;
                }

                // Create parameter
                await createParameter({
                  parameter: row.parameter.trim(),
                  parameter_type: row.parameter_type.trim(),
                  model: row.model.trim(),
                  min_range: minRange,
                  max_range: maxRange,
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
            res.json({
              success: true,
              data: {
                totalProcessed: results.length,
                successCount,
                errorCount,
                errors: errors.length > 0 ? errors : undefined
              }
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: any) => {
          res.status(400).json({ 
            success: false, 
            error: `CSV parsing error: ${error.message}` 
          });
          reject(error);
        });
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
}; 