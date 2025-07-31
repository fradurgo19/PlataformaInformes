import React, { useState, useRef } from 'react';
import { Button } from '../atoms/Button';
import { apiService } from '../../services/api';
import { Upload, Download, X } from 'lucide-react';

interface BulkImportResourcesProps {
  onImportSuccess?: () => void;
}

export const BulkImportResources: React.FC<BulkImportResourcesProps> = ({
  onImportSuccess,
}) => {
  const [importResult, setImportResult] = useState<{
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImporting = loading;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    setLoading(true);
    setError(null);

    // Validate file type
    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    try {
      if (isCSV) {
        // Handle CSV files
        const csvData = await file.text();
        
        // Check if CSV has the new format (with observation column)
        const firstLine = csvData.split('\n')[0];
        const hasObservationColumn = firstLine.includes('observation');
        
        const response = await apiService.bulkImportResources({ 
          csvData,
          fileType: 'csv',
          legacyFormat: !hasObservationColumn 
        });
        
        if (response.success && response.data) {
          setImportResult(response.data);
          // Call callback to refresh resources list
          if (onImportSuccess) {
            onImportSuccess();
          }
        } else {
          setError(response.error || 'Import failed');
        }
      } else {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const response = await apiService.bulkImportResources({ 
          excelData: base64,
          fileType: 'excel'
        });
        
        if (response.success && response.data) {
          setImportResult(response.data);
          // Call callback to refresh resources list
          if (onImportSuccess) {
            onImportSuccess();
          }
        } else {
          setError(response.error || 'Import failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `model,resource_name,resource_url,observation
CATERPILLAR 320D,Manual de Operación,https://example.com/manual.pdf,Manual oficial del fabricante
CATERPILLAR 320D,Esquemas Eléctricos,https://example.com/schematics.pdf,Diagramas de cableado
KOMATSU PC200,Manual de Mantenimiento,https://example.com/maintenance.pdf,Guía de mantenimiento preventivo`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
      <h2 className="text-xl font-semibold mb-4">Bulk Import Resources</h2>
      <p className="text-xs text-slate-500 mb-4">
        File must include: model, resource_name, resource_url, observation
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isImporting}
      />
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isImporting ? 'Importing...' : 'Select File (CSV/Excel)'}
        </Button>
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {importResult && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-900">Import Completed</h3>
            <Button
              onClick={clearResults}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p><strong>Total processed:</strong> {importResult.totalProcessed}</p>
            <p><strong>Successfully imported:</strong> {importResult.successCount}</p>
            <p><strong>Errors:</strong> {importResult.errorCount}</p>
          </div>
          
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-3">
              <p className="font-semibold text-red-700 mb-2">Errors:</p>
              <div className="max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <p key={index} className="text-red-600 text-xs mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 