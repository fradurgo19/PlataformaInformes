import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateReport } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
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
import { MachineType, ComponentType, Component, Report } from '../types';

export const NewReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const createReportMutation = useCreateReport();

  const [currentStep, setCurrentStep] = useState(1);
  const [reportData, setReportData] = useState({
    clientName: '',
    clientContact: '',
    machineType: '' as MachineType,
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
    type: ComponentType;
    findings: string;
    parameters?: string;
    status: 'CORRECTED' | 'PENDING';
    suggestions?: string;
    photos: File[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }>>([]);
  const [suggestedParts, setSuggestedParts] = useState<Array<{
    partNumber: string;
    description: string;
    quantity: number;
  }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const machineTypeOptions = [
    { value: 'OTHER', label: 'Other' },
    { value: 'EXCAVATOR', label: 'Excavator' },
    { value: 'SKID_STEER', label: 'Skid Steer' },
    { value: 'BACKHOE_LOADER', label: 'Backhoe Loader' },
    { value: 'MOTOR_GRADER', label: 'Motor Grader' },
    { value: 'MINI_EXCAVATOR', label: 'Mini Excavator' },
    { value: 'WHEEL_LOADER', label: 'Wheel Loader' },
  ];

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
    { value: 'ZX200LC-5G', label: 'ZX200LC-5G' },
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

  const componentTypeOptions = [
    { value: 'CUTTING_TOOL', label: 'Cutting Tool' },
    { value: 'UNDERCARRIAGE', label: 'Undercarriage' },
    { value: 'CYLINDER_SEALS', label: 'Cylinder Seals' },
    { value: 'ENGINE', label: 'Engine' },
    { value: 'RADIATOR', label: 'Radiator' },
    { value: 'ENGINE_PERIPHERALS', label: 'Engine Peripherals' },
    { value: 'BUCKET_FRONT_EQUIPMENT_FITTINGS', label: 'Bucket Front Equipment Fittings' },
    { value: 'ARM_BOOM_FRONT_EQUIPMENT_FITTINGS', label: 'Arm-Boom Front Equipment Fittings' },
    { value: 'BOOM_CHASSIS_FRONT_EQUIPMENT_FITTINGS', label: 'Boom-Chassis Front Equipment Fittings' },
    { value: 'SLEW_RING_PINION', label: 'Slew Ring + Pinion' },
    { value: 'COUPLING', label: 'Coupling' },
    { value: 'HYDRAULIC_PUMP', label: 'Hydraulic Pump' },
    { value: 'SWING_MOTOR', label: 'Swing Motor' },
    { value: 'TRAVEL_MOTOR', label: 'Travel Motor' },
    { value: 'SEALS', label: 'Seals' },
    { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
  ];

  const statusOptions = [
    { value: 'CORRECTED', label: 'Corrected' },
    { value: 'PENDING', label: 'Pending' },
  ];

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
    setComponents(prev => [...prev, {
      type: 'CUTTING_TOOL' as ComponentType,
      findings: '',
      parameters: '',
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
      console.log('🚀 Starting report creation...');
      
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
        components: components.map(c => ({
          type: c.type,
          findings: c.findings,
          parameters: c.parameters,
          status: c.status,
          suggestions: c.suggestions,
          priority: c.priority,
        })),
        suggested_parts: suggestedParts.map(p => ({
          part_number: p.partNumber,
          description: p.description,
          quantity: Number(p.quantity) || 1
        })),
      };

      const formData = new FormData();
      formData.append('reportData', JSON.stringify(reportJson));

      components.forEach((component, componentIndex) => {
        component.photos.forEach(photoFile => {
          formData.append(`photos_${componentIndex}`, photoFile);
        });
      });

      console.log('📦 Report data to be sent:', formData);

      await createReportMutation.mutateAsync(formData as any);

      console.log('✅ Report created successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('❌ Failed to create report:', error);
      setErrors({ submit: 'Failed to create report: Internal server error' });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 min-h-[400px]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Header Section</h2>
        <p className="text-slate-600 mt-1">Fill in the basic information about the machinery inspection</p>
      </div>
      
      {/* Debug info */}
      <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
        <p className="text-yellow-800 text-sm">Debug: Form is rendering. Current step: {currentStep}</p>
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
              onChange={(e) => setReportData(prev => ({ ...prev, machineType: e.target.value as MachineType }))}
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
          
          <div className="space-y-2 min-h-[80px] md:col-span-2 border border-gray-200 p-2 rounded">
            <Input
              label="OTT"
              value={reportData.ott}
              onChange={(e) => setReportData(prev => ({ ...prev, ott: e.target.value }))}
              error={errors.ott}
              placeholder="Enter OTT information"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Component Assessment</h2>
        <Button onClick={addComponent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      {errors.components && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errors.components}</p>
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
                rows={3}
                placeholder="Describe observations on the selected component..."
                required
              />
              <Textarea
                label="Parameters"
                value={component.parameters}
                onChange={(e) => updateComponent(index, 'parameters', e.target.value)}
                rows={2}
                placeholder="Technical parameters of the component..."
                required
              />
              <Textarea
                label="Suggestions"
                value={component.suggestions}
                onChange={(e) => updateComponent(index, 'suggestions', e.target.value)}
                rows={2}
                placeholder="Solution proposal based on findings..."
                required
              />
              <PhotoUpload
                photos={component.photos}
                onPhotosChange={(photos) => updateComponent(index, 'photos', photos)}
                label="Component Photos"
                maxPhotos={10}
              />
            </div>
          </div>
        ))}

        {components.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No components added</h3>
            <p className="text-slate-600 mb-4">Add at least one component to continue.</p>
            <Button onClick={addComponent}>
              <Plus className="w-4 h-4 mr-2" />
              Add Component
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Final Section</h2>

      <Textarea
        label="General Conclusions"
        value={reportData.conclusions}
        onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
        error={errors.conclusions}
        rows={4}
        placeholder="Provide general conclusions about the machinery inspection..."
        required
      />

      <Textarea
        label="Overall Suggestions"
        value={reportData.overallSuggestions}
        onChange={(e) => setReportData(prev => ({ ...prev, overallSuggestions: e.target.value }))}
        rows={4}
        placeholder="Provide overall suggestions and recommendations..."
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Suggested Parts</h3>
          <Button onClick={addPart} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>

        {suggestedParts.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Part Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {suggestedParts.map((part, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <Input
                          value={part.partNumber}
                          onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                          placeholder="Enter part number"
                          className="min-w-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={part.description}
                          onChange={(e) => updatePart(index, 'description', e.target.value)}
                          placeholder="Enter description"
                          className="min-w-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePart(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {suggestedParts.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 mb-4">No parts added yet.</p>
            <Button onClick={addPart} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Part
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Header Section', component: renderStep1 },
    { number: 2, title: 'Components', component: renderStep2 },
    { number: 3, title: 'Final Section', component: renderStep3 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Report</h1>
          <p className="text-slate-600 mt-1">Create a new technical inspection report</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-shrink-0">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
                }
              `}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-slate-600'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-slate-200 ml-4" />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          {(() => {
            const currentStepComponent = steps.find(step => step.number === currentStep)?.component;
            return currentStepComponent ? currentStepComponent() : null;
          })()}

          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={createReportMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};