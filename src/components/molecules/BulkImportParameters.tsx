import React, { useState, useRef } from 'react';
import { Button } from '../atoms/Button';
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface ImportResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

interface BulkImportParametersProps {
  onImportSuccess?: () => void;
}

export const BulkImportParameters: React.FC<BulkImportParametersProps> = ({ onImportSuccess }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const csvData = await file.text();
      
      const response = await apiService.bulkImportParameters({ csvData });
      
      if (response.success && response.data) {
        setImportResult(response.data);
        // Call callback to refresh parameters list
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setError(response.error || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `parameter,parameter_type,model,min_range,max_range,resource_url,observation
Oil Pressure,Sensor,CATERPILLAR 320D,10,100,https://example.com/oil-pressure,Monitor oil pressure regularly
Engine Temperature,Sensor,CATERPILLAR 320D,50,120,https://example.com/engine-temp,Check for overheating conditions
Hydraulic Pressure,Sensor,CATERPILLAR 320D,0,300,https://example.com/hydraulic-pressure,Verify hydraulic system performance`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parameters_template.csv';
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Bulk Import Parameters</h3>
        <Button
          onClick={downloadTemplate}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-2">
            Upload a CSV file with parameters
          </p>
          <p className="text-xs text-slate-500 mb-4">
            File must include: parameter, parameter_type, model, min_range, max_range, resource_url, observation
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isImporting}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Select CSV File'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Import Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={clearResults}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-700 font-medium">Import Completed</p>
                <div className="text-green-600 text-sm space-y-1 mt-1">
                  <p>Total processed: {importResult.totalProcessed}</p>
                  <p>Successfully imported: {importResult.successCount}</p>
                  {importResult.errorCount > 0 && (
                    <p>Errors: {importResult.errorCount}</p>
                  )}
                </div>
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-green-700 font-medium text-sm">Errors:</p>
                    <div className="bg-white rounded border border-green-200 p-2 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <p key={index} className="text-red-600 text-xs">{error}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={clearResults}
                className="text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 