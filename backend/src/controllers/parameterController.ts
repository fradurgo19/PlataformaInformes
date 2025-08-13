import { Request, Response } from 'express';
import { getAllParameters, createParameter, deleteParameter } from '../models/parameterModel';
import { AuthRequest } from '../middleware/auth';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

// Helper to normalize object keys: lowercased and spaces/dashes to underscores
const normalizeKeys = (obj: any): any => {
	const out: any = {};
	Object.keys(obj || {}).forEach((key) => {
		const norm = String(key)
			.toLowerCase()
			.replace(/\s+/g, '_')
			.replace(/[-]+/g, '_')
			.replace(/__+/g, '_')
			.trim();
		out[norm] = obj[key];
	});
	return out;
};

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
	const { parameter, parameter_type, model, min_range, max_range, limit_range, resource_url, observation } = req.body;
	if (!parameter || !parameter_type || !model || min_range === undefined || max_range === undefined || !resource_url) {
		return res.status(400).json({ success: false, error: 'Missing required fields' });
	}
	try {
		const param = await createParameter({ parameter, parameter_type, model, min_range, max_range, resource_url, observation, limit_range });
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
		const processedKeys = new Set<string>();

		// Parse file data based on type
		if (fileType === 'excel' && excelData) {
			try {
				const buffer = Buffer.from(excelData, 'base64');
				const workbook = XLSX.read(buffer, { type: 'buffer' });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
				const headers = jsonData[0] as string[];
				for (let i = 1; i < jsonData.length; i++) {
					const row = jsonData[i] as any[];
					const rowObj: any = {};
					headers.forEach((header, index) => {
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
			try {
				const stream = Readable.from(csvData);
				await new Promise<void>((resolve, reject) => {
					stream
						.pipe(csv())
						.on('data', (row: any) => { results.push(row); })
						.on('end', () => resolve())
						.on('error', (error: any) => reject(error));
				});
			} catch (error) {
				return res.status(400).json({ 
					success: false, 
					error: `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
				});
			}
		}

		for (let i = 0; i < results.length; i++) {
			const rawRow = results[i];
			const row = normalizeKeys(rawRow);
			const rowNumber = i + 2;

			try {
				if (i === 0) {
					console.log('=== DEBUG INFO ===');
					console.log('File type:', fileType);
					console.log('First row columns (raw):', Object.keys(rawRow));
					console.log('First row columns (normalized):', Object.keys(row));
					console.log('First row data (normalized):', row);
					console.log('Has parameter:', !!row.parameter);
					console.log('Has parameter_type:', !!row.parameter_type);
					console.log('Has model:', !!row.model);
					console.log('Has min_range:', !!row.min_range);
					console.log('Has max_range:', !!row.max_range);
					console.log('Has limit_range:', !!row.limit_range);
					console.log('Has resource_url:', !!row.resource_url);
					console.log('Has observation:', !!row.observation);
					console.log('==================');
				}

				// Handle combined parameter_t model column
				let parameterType = row.parameter_type;
				let model = row.model;
				if (row['parameter_t_model']) {
					const combinedValue = row['parameter_t_model'];
					const parts = String(combinedValue).split(/[\s-]+/);
					if (parts.length >= 2) {
						parameterType = parts.slice(0, -1).join(' ');
						model = parts[parts.length - 1];
					} else {
						parameterType = 'Unknown';
						model = String(combinedValue);
					}
				}

				// Check for duplicates
				const parameterKey = `${String(row.parameter || '').trim()}-${String(parameterType || '').trim()}-${String(model || '').trim()}`.toLowerCase();
				if (processedKeys.has(parameterKey)) {
					errors.push(`Row ${rowNumber}: Duplicate parameter combination (${row.parameter} - ${parameterType} - ${model})`);
					errorCount++;
					continue;
				}
				processedKeys.add(parameterKey);

				// Validate required fields
				const missingFields = [] as string[];
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
				let minRange = parseFloat(String(row.min_range));
				let maxRange = parseFloat(String(row.max_range));
				if (isNaN(minRange) || isNaN(maxRange)) {
					errors.push(`Row ${rowNumber}: Invalid numeric values for ranges`);
					errorCount++;
					continue;
				}
				if (minRange > maxRange) {
					const temp = minRange; minRange = maxRange; maxRange = temp;
				}

				await createParameter({
					parameter: String(row.parameter).trim(),
					parameter_type: String(parameterType).trim(),
					model: String(model).trim(),
					min_range: minRange,
					max_range: maxRange,
					limit_range: row.limit_range ? String(row.limit_range).trim() : undefined,
					resource_url: String(row.resource_url).trim(),
					observation: legacyFormat ? '' : (row.observation ? String(row.observation).trim() : '')
				});
				successCount++;
			} catch (error) {
				errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
				errorCount++;
			}
		}

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