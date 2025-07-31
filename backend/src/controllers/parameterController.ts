import { Request, Response } from 'express';
import { getAllParameters, createParameter, deleteParameter } from '../models/parameterModel';
import { AuthRequest } from '../middleware/auth';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

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
    const { csvData, excelData, fileType = 'csv', legacyFormat = false } = req.body;
    
    if (!csvData && !excelData) {
      return res.status(400).json({ success: false, error: 'File data is required' });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let errorCount = 0;

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
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
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
      const stream = Readable.from(csvData);
      
      return new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row: any) => {
            results.push(row);
          })
          .on('end', async () => {
            resolve();
          })
          .on('error', (error: any) => {
            res.status(400).json({ 
              success: false, 
              error: `CSV parsing error: ${error.message}` 
            });
            reject(error);
          });
        });
      });
    }

    // Process rows for both CSV and Excel
    try {
      // Process each row
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        const rowNumber = i + 2; // +2 because file starts at row 2 (header is row 1)
        
        try {
          // Debug: Log the first row to see what columns are available
          if (i === 0) {
            console.log('First row columns:', Object.keys(row));
            console.log('First row data:', row);
          }
          
          // Handle combined parameter_t model column
          let parameterType = row.parameter_type;
          let model = row.model;
          
          if (row['parameter_t model']) {
            // Try to extract parameter_type and model from combined column
            const combinedValue = row['parameter_t model'];
            // For now, assume the model is the part after the last space or dash
            const parts = combinedValue.split(/[\s-]+/);
            if (parts.length >= 2) {
              parameterType = parts.slice(0, -1).join(' '); // Everything except last part
              model = parts[parts.length - 1]; // Last part as model
            } else {
              parameterType = 'Unknown';
              model = combinedValue;
            }
          }
          
          // Validate required fields (observation is optional)
          const missingFields = [];
          if (!row.parameter) missingFields.push('parameter');
          if (!parameterType) missingFields.push('parameter_type');
          if (!model) missingFields.push('model');
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
            parameter_type: parameterType.trim(),
            model: model.trim(),
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
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
}; 