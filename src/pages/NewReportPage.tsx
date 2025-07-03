import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateReport, useReport, useUpdateReport } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { useTypes } from '../context/TypesContext';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Textarea } from '../components/atoms/Textarea';
import { PhotoUpload } from '../components/molecules/PhotoUpload';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';

export const NewReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state: authState } = useAuth();
  const { machineTypes, componentTypes } = useTypes();
  const createReportMutation = useCreateReport();
  const updateReportMutation = useUpdateReport();

  const isEditMode = Boolean(id);
  const { data: reportResponse, isLoading: isLoadingReport } = useReport(id || '');

  const [initialized, setInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [reportData, setReportData] = useState({
    clientName: '',
    clientContact: '',
    machineType: '',
    model: '',
    serialNumber: '',
    hourmeter: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    ott: '',
    conclusions: '',
    overallSuggestions: '',
  });

  const [components, setComponents] = useState<Array<{
    id?: string;
    type: string;
    findings: string;
    parameters?: { name: string; minValue: number; maxValue: number; measuredValue: number; corrected: boolean; observation: string }[];
    status: 'CORRECTED' | 'PENDING';
    suggestions?: string;
    photos: (File | string)[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }>>([]);

  const [suggestedParts, setSuggestedParts] = useState<Array<{
    partNumber: string;
    description: string;
    quantity: number;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert machine types to options
  const machineTypeOptions = machineTypes.map(mt => ({
    value: mt.name,
    label: mt.name
  }));

  // Convert component types to options
  const componentTypeOptions = componentTypes.map(ct => ({
    value: ct.name,
    label: ct.name
  }));

  const modelOptions = [
    { value: 'ZX225US-3', label: 'ZX225US-3' },
    { value: 'ZX200LC-5G', label: 'ZX200LC-5G' },
    { value: '210X3E', label: '210X3E' },
    { value: '130X3E', label: '130X3E' },
    { value: '360X3E', label: '360X3E' },
    { value: '300X3E', label: '300X3E' },
    { value: '250X3EX', label: '250X3EX' },
    { value: '933E', label: '933E' },
    { value: '835H', label: '835H' },
    { value: '920E', label: '920E' },
    { value: '913E', label: '913E' },
    { value: '856H', label: '856H' },
    { value: 'ZX210LC-5B', label: 'ZX210LC-5B' },
    { value: 'ZX130-5G', label: 'ZX130-5G' },
    { value: 'ZX200-3', label: 'ZX200-3' },
    { value: 'ZX135US-3', label: 'ZX135US-3' },
    { value: 'ZX120-3', label: 'ZX120-3' },
    { value: 'ZX75US-3', label: 'ZX75US-3' },
    { value: 'SR220B', label: 'SR220B' },
    { value: 'SR175B', label: 'SR175B' },
    { value: 'SR200B', label: 'SR200B' },
    { value: 'SR250B', label: 'SR250B' },
    { value: 'SR175', label: 'SR175' },
    { value: 'SR250', label: 'SR250' },
    { value: 'SR200', label: 'SR200' },
    { value: 'SR220', label: 'SR220' },
    { value: '845B', label: '845B' },
    { value: '580N', label: '580N' },
    { value: '821G', label: '821G' },
    { value: '580SN', label: '580SN' },
    { value: 'CX220C', label: 'CX220C' },
    { value: 'CX300C', label: 'CX300C' },
    { value: '590SN', label: '590SN' },
    { value: '933EHD', label: '933EHD' },
    { value: '4165D', label: '4165D' },
    { value: 'VIO50', label: 'VIO50' },
    { value: 'VIO17', label: 'VIO17' },
    { value: '575SV', label: '575SV' },
    { value: '210X3', label: '210X3' },
    { value: '360X3', label: '360X3' },
    { value: 'ZX140H', label: 'ZX140H' },
    { value: 'ZX200-5G', label: 'ZX200-5G' },
    { value: 'ZX40U-5A', label: 'ZX40U-5A' },
    { value: 'ZX120-5B', label: 'ZX120-5B' },
    { value: '135US-3', label: '135US-3' },
    { value: 'VIO70-3', label: 'VIO70-3' },
    { value: '820C', label: '820C' },
    { value: '145X4EX', label: '145X4EX' },
    { value: 'SH200-5', label: 'SH200-5' },
    { value: 'SV575', label: 'SV575' },
    { value: '621F T2', label: '621F T2' },
    { value: '870H', label: '870H' },
    { value: 'ZX225USR-3', label: 'ZX225USR-3' },
    { value: 'VIO35', label: 'VIO35' },
    { value: '1150L', label: '1150L' },
    { value: 'SR200B-575SV', label: 'SR200B-575SV' },
    { value: 'ZX120', label: 'ZX120' },
    { value: 'SB175B', label: 'SB175B' },
    { value: 'ZX210LCH-5G', label: 'ZX210LCH-5G' },
    { value: '908E', label: '908E' },
    { value: '855H', label: '855H' },
    { value: 'ARX 26-2', label: 'ARX 26-2' },
    { value: '766A', label: '766A' },
    { value: 'ZX135US-5B', label: 'ZX135US-5B' },
    { value: 'ZX70-3', label: 'ZX70-3' },
    { value: 'CX350C-8', label: 'CX350C-8' },
    { value: 'ZX85USB-3', label: 'ZX85USB-3' },
  ];

  const statusOptions = [
    { value: 'CORRECTED', label: 'Corrected' },
    { value: 'PENDING', label: 'Pending' },
  ];

  useEffect(() => {
    if (isEditMode && reportResponse?.data && !initialized) {
      const r = reportResponse.data;
      setReportData({
        clientName: r.client_name || '',
        clientContact: '',
        machineType: r.machine_type || '',
        model: r.model || '',
        serialNumber: r.serial_number || '',
        hourmeter: r.hourmeter?.toString() || '',
        date: r.report_date ? new Date(r.report_date).toISOString().split('T')[0] : '',
        location: '',
        ott: r.ott || '',
        conclusions: r.conclusions || '',
        overallSuggestions: r.overall_suggestions || '',
      });
      
      const loadedComponents = (r.components || []).map((comp: any) => {
        let params: any[] = [];
        if (Array.isArray(comp.parameters)) {
          params = comp.parameters;
        } else if (typeof comp.parameters === 'string') {
          try {
            params = JSON.parse(comp.parameters);
            if (!Array.isArray(params)) params = [];
          } catch {
            params = [];
          }
        }
        
        let photos: string[] = [];
        if (Array.isArray(comp.photos)) {
          photos = comp.photos.map((p: any) => {
            if (typeof p === 'string') return p;
            if (p.file_path) {
              if (p.file_path.startsWith('http')) return p.file_path;
              return `http://localhost:3001${p.file_path.startsWith('/') ? '' : '/'}${p.file_path}`;
            }
            if (p.filename) {
              return `http://localhost:3001/uploads/${p.filename}`;
            }
            return '';
          });
        }
        
        return {
          ...comp,
          parameters: params,
          photos,
        };
      });
      
      setComponents(loadedComponents);
      setSuggestedParts(
        Array.isArray(r.suggested_parts)
          ? r.suggested_parts.map((p: any) => ({
              partNumber: p.part_number,
              description: p.description,
              quantity: p.quantity,
            }))
          : []
      );
      setInitialized(true);
    }
  }, [isEditMode, reportResponse, initialized]);

  const validateAllSteps = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1 validation
    if (!reportData.clientName) newErrors.clientName = 'Client name is required';
    if (!reportData.machineType) newErrors.machineType = 'Machine type is required';
    if (!reportData.model) newErrors.model = 'Model is required';
    if (!reportData.serialNumber) newErrors.serialNumber = 'Serial number is required';
    if (!reportData.hourmeter) {
      newErrors.hourmeter = 'Hourmeter reading is required';
    } else if (isNaN(Number(reportData.hourmeter))) {
      newErrors.hourmeter = 'Hourmeter must be a valid number';
    }
    if (!reportData.ott) newErrors.ott = 'OTT is required';

    // Step 2 validation
    if (components.length === 0) {
      newErrors.components = 'At least one component assessment is required';
    } else {
      components.forEach((comp, index) => {
        if (!comp.findings) {
          newErrors[`component_${index}_findings`] = `Findings are required for component ${index + 1}`;
        }
      });
    }

    // Step 3 validation
    if (!reportData.conclusions) newErrors.conclusions = 'Conclusions are required';
    
    // Step 4 (suggested parts) validation
    suggestedParts.forEach((part, index) => {
      if (!part.partNumber) {
        newErrors[`part_${index}_partNumber`] = `Part number is required for part ${index + 1}`;
      }
      if (!part.description) {
        newErrors[`part_${index}_description`] = `Description is required for part ${index + 1}`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!reportData.clientName) newErrors.clientName = 'Client name is required';
      if (!reportData.machineType) newErrors.machineType = 'Machine type is required';
      if (!reportData.model) newErrors.model = 'Model is required';
      if (!reportData.serialNumber) newErrors.serialNumber = 'Serial number is required';
      if (!reportData.hourmeter) {
        newErrors.hourmeter = 'Hourmeter reading is required';
      } else if (isNaN(Number(reportData.hourmeter))) {
        newErrors.hourmeter = 'Hourmeter must be a valid number';
      }
      if (!reportData.ott) newErrors.ott = 'OTT is required';
    } else if (step === 2) {
      if (components.length === 0) {
        newErrors.components = 'At least one component assessment is required';
      }
    } else if (step === 3) {
      if (!reportData.conclusions) newErrors.conclusions = 'Conclusions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const addComponent = () => {
    const defaultType = componentTypes.length > 0 ? componentTypes[0].name : '';
    setComponents(prev => [...prev, {
      type: defaultType,
      findings: '',
      parameters: [],
      status: 'PENDING',
      suggestions: '',
      photos: [],
      priority: 'MEDIUM',
    }]);
  };

  const updateComponent = (index: number, field: string, value: any) => {
    setComponents(prev => prev.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    ));
  };

  const removeComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  const addPart = () => {
    setSuggestedParts(prev => [...prev, {
      partNumber: '',
      description: '',
      quantity: 1,
    }]);
  };

  const updatePart = (index: number, field: keyof typeof suggestedParts[0], value: any) => {
    setSuggestedParts(prev => prev.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    ));
  };

  const removePart = (index: number) => {
    setSuggestedParts(prev => prev.filter((_, i) => i !== index));
  };

  const addParameter = (componentIdx: number) => {
    setComponents(prev => prev.map((comp, i) =>
      i === componentIdx
        ? { ...comp, parameters: [...(comp.parameters || []), { name: '', minValue: 0, maxValue: 0, measuredValue: 0, corrected: false, observation: '' }] }
        : comp
    ));
  };

  const updateParameter = (componentIdx: number, paramIdx: number, field: string, value: any) => {
    setComponents(prev => prev.map((comp, i) => {
      if (i !== componentIdx) return comp;
      const newParams = (comp.parameters || []).map((param, j) =>
        j === paramIdx ? { ...param, [field]: value } : param
      );
      return { ...comp, parameters: newParams };
    }));
  };

  const removeParameter = (componentIdx: number, paramIdx: number) => {
    setComponents(prev => prev.map((comp, i) => {
      if (i !== componentIdx) return comp;
      const newParams = (comp.parameters || []).filter((_, j) => j !== paramIdx);
      return { ...comp, parameters: newParams };
    }));
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      // Find the first step with an error and go to it
      if (errors.clientName || errors.machineType || errors.model || errors.serialNumber || errors.hourmeter || errors.ott) {
        setCurrentStep(1);
      } else if (errors.components || Object.keys(errors).some(k => k.startsWith('component_'))) {
        setCurrentStep(2);
      } else if (errors.conclusions || Object.keys(errors).some(k => k.startsWith('part_'))) {
        setCurrentStep(3);
      }
      return;
    }

    if (!authState.user) {
      setErrors({ submit: 'User not authenticated' });
      return;
    }

    try {
      const reportJson = {
        client_name: reportData.clientName,
        machine_type: reportData.machineType,
        model: reportData.model,
        serial_number: reportData.serialNumber,
        hourmeter: Number(reportData.hourmeter),
        report_date: reportData.date,
        ott: reportData.ott,
        conclusions: reportData.conclusions,
        overall_suggestions: reportData.overallSuggestions,
        status: isEditMode ? (reportResponse?.data?.status || 'draft') : 'draft',
        components: components.map(c => ({
          id: c.id,
          type: c.type,
          findings: c.findings,
          parameters: c.parameters,
          status: c.status,
          suggestions: c.suggestions,
          priority: c.priority,
          photos: c.photos.filter(p => typeof p === 'string'),
        })),
        suggested_parts: suggestedParts.map(p => ({
          part_number: p.partNumber,
          description: p.description,
          quantity: Number(p.quantity) || 1
        })),
      };

      if (!reportJson || typeof reportJson !== 'object') {
        setErrors({ submit: 'Invalid report data. Please refresh and try again.' });
        return;
      }

      const formData = new FormData();
      formData.append('reportData', JSON.stringify(reportJson));

      // Add photos to form data
      components.forEach((component, componentIndex) => {
        component.photos.forEach((photo) => {
          if (photo instanceof File) {
            formData.append(`photos_${componentIndex}`, photo);
          }
        });
      });

      if (isEditMode && id) {
        await updateReportMutation.mutateAsync({ id, updates: formData });
      } else {
        await createReportMutation.mutateAsync(formData);
      }

      navigate('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
      setErrors({ submit: 'Error saving report' });
    }
  };

  if (isLoadingReport) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-8 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Header Section</h2>
        <p className="text-slate-600 mt-1">Fill in the basic information about the machinery inspection</p>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Client Name"
              value={reportData.clientName}
              onChange={(e) => setReportData(prev => ({ ...prev, clientName: e.target.value }))}
              error={errors.clientName}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Select
              label="Machine Type"
              options={machineTypeOptions}
              value={reportData.machineType}
              onChange={(e) => setReportData(prev => ({ ...prev, machineType: e.target.value }))}
              error={errors.machineType}
              placeholder="Select machine type"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Select
              label="Model"
              options={modelOptions}
              value={reportData.model}
              onChange={(e) => setReportData(prev => ({ ...prev, model: e.target.value }))}
              error={errors.model}
              placeholder="Select model"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Serial Number"
              value={reportData.serialNumber}
              onChange={(e) => setReportData(prev => ({ ...prev, serialNumber: e.target.value }))}
              error={errors.serialNumber}
              placeholder="Enter serial number"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Hourmeter"
              type="number"
              value={reportData.hourmeter}
              onChange={(e) => setReportData(prev => ({ ...prev, hourmeter: e.target.value }))}
              error={errors.hourmeter}
              placeholder="Enter hourmeter reading"
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="Report Date"
              type="date"
              value={reportData.date}
              onChange={(e) => setReportData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2 min-h-[80px] border border-gray-200 p-2 rounded">
            <Input
              label="OTT"
              value={reportData.ott}
              onChange={(e) => setReportData(prev => ({ ...prev, ott: e.target.value }))}
              error={errors.ott}
              placeholder="Enter OTT"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Component Assessment</h2>
        <p className="text-slate-600 mt-1">Assess the condition of each component</p>
      </div>

      {errors.components && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{errors.components}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {components.map((component, index) => (
          <div key={index} className="bg-slate-50 rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Component {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeComponent(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                label="Component Selection"
                options={componentTypeOptions}
                value={component.type}
                onChange={(e) => updateComponent(index, 'type', e.target.value)}
                required
              />
              <Select
                label="Status"
                options={statusOptions}
                value={component.status}
                onChange={(e) => updateComponent(index, 'status', e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Textarea
                label="Findings"
                value={component.findings}
                onChange={(e) => updateComponent(index, 'findings', e.target.value)}
                error={errors[`component_${index}_findings`]}
                placeholder="Describe the findings for this component"
                required
              />

              {/* Parameters Table */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold text-slate-800">Parameters</h4>
                  <Button type="button" size="sm" variant="outline" onClick={() => addParameter(index)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Parameter
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Min Value</th>
                        <th className="border px-2 py-1">Max Value</th>
                        <th className="border px-2 py-1">Measured Value</th>
                        <th className="border px-2 py-1">Corrected</th>
                        <th className="border px-2 py-1">Observation</th>
                        <th className="border px-2 py-1">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(component.parameters || []).map((param, paramIdx) => (
                        <tr key={paramIdx}>
                          <td className="border px-2 py-1">
                            <Input
                              value={param.name}
                              onChange={e => updateParameter(index, paramIdx, 'name', e.target.value)}
                              placeholder="Parameter name"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.minValue}
                              onChange={e => updateParameter(index, paramIdx, 'minValue', Number(e.target.value))}
                              placeholder="Min"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.maxValue}
                              onChange={e => updateParameter(index, paramIdx, 'maxValue', Number(e.target.value))}
                              placeholder="Max"
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              type="number"
                              value={param.measuredValue}
                              onChange={e => updateParameter(index, paramIdx, 'measuredValue', Number(e.target.value))}
                              placeholder="Measured"
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="checkbox"
                              checked={param.corrected}
                              onChange={e => updateParameter(index, paramIdx, 'corrected', e.target.checked)}
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <Input
                              value={param.observation}
                              onChange={e => updateParameter(index, paramIdx, 'observation', e.target.value)}
                              placeholder="Observation"
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeParameter(index, paramIdx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(component.parameters || []).length === 0 && (
                    <div className="text-slate-400 text-xs py-2 text-center">No parameters added</div>
                  )}
                </div>
              </div>

              <Textarea
                label="Suggestions"
                value={component.suggestions || ''}
                onChange={(e) => updateComponent(index, 'suggestions', e.target.value)}
                placeholder="Provide suggestions for this component"
              />

              <PhotoUpload
                label="Photos"
                photos={component.photos}
                onPhotosChange={(photos) => updateComponent(index, 'photos', photos)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={addComponent} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Component
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Conclusions & Parts</h2>
        <p className="text-slate-600 mt-1">Provide conclusions and suggested parts</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="space-y-6">
          <Textarea
            label="Conclusions"
            value={reportData.conclusions}
            onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
            error={errors.conclusions}
            placeholder="Provide overall conclusions about the machinery inspection"
            required
          />

          <Textarea
            label="Overall Suggestions"
            value={reportData.overallSuggestions}
            onChange={(e) => setReportData(prev => ({ ...prev, overallSuggestions: e.target.value }))}
            placeholder="Provide overall suggestions for the machinery"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Suggested Parts</h3>
          <Button onClick={addPart} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>

        <div className="space-y-4">
          {suggestedParts.map((part, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Part Number"
                  value={part.partNumber}
                  onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                  error={errors[`part_${index}_partNumber`]}
                />
                <Input
                  placeholder="Description"
                  value={part.description}
                  onChange={(e) => updatePart(index, 'description', e.target.value)}
                  error={errors[`part_${index}_description`]}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={part.quantity.toString()}
                  onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePart(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {isEditMode ? 'Edit Report' : 'New Report'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEditMode ? 'Update the technical inspection report' : 'Create a new technical inspection report'}
          </p>
        </div>

        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>Header</span>
            <span>Components</span>
            <span>Conclusions</span>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createReportMutation.isPending || updateReportMutation.isPending}
              >
                {createReportMutation.isPending || updateReportMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditMode ? 'Update Report' : 'Save Report'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};