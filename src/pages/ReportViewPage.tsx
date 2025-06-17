import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReport, useDeleteReport } from '../hooks/useReports';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { StatusBadge } from '../components/molecules/StatusBadge';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { ReportActions } from '../components/molecules/ReportActions';
import { Button } from '../components/atoms/Button';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Wrench,
  AlertCircle,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { generateReportPDF } from '../utils/pdf';

export const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reportResponse, isLoading, error } = useReport(id!);
  const deleteReportMutation = useDeleteReport();
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleDownloadPDF = async () => {
    if (reportResponse?.data) {
      try {
        await generateReportPDF(reportResponse.data);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  const handleDeleteReport = async () => {
    if (id && window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReportMutation.mutateAsync(id);
        navigate('/reports');
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleSuccess = (message: string) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (error: string) => {
    setNotification({ type: 'error', message: error });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reportResponse?.data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Not Found</h3>
            <p className="text-slate-600 mb-4">The requested report could not be found.</p>
            <Link to="/reports">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const report = reportResponse.data;
  const totalPartsCost = report.suggested_parts?.reduce((sum: number, part: any) => sum + (part.quantity * (part.unit_price || 0)), 0) || 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{report.client_name}</h1>
              <p className="text-slate-600">{report.machine_type} - {report.model}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <StatusBadge status={report.status} />
            <Link to={`/reports/${report.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDeleteReport}
              isLoading={deleteReportMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Report Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Acciones del Reporte</h2>
          <ReportActions
            reportId={report.id}
            reportName={`${report.client_name}_${report.machine_type}`}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {/* Report Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Report Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Client Information</h3>
                  <p className="text-slate-900 font-medium">{report.client_name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Machine Details</h3>
                  <p className="text-slate-900 font-medium">{report.machine_type} - {report.model}</p>
                  <p className="text-slate-600 text-sm">S/N: {report.serial_number}</p>
                  <p className="text-slate-600 text-sm">Hours: {report.hourmeter.toLocaleString()}</p>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <div>
                    <p className="text-sm text-slate-600">Inspection Date</p>
                    <p className="font-medium text-slate-900">{format(new Date(report.report_date), 'PPP')}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Wrench className="w-4 h-4 text-slate-400 mr-2" />
                  <div>
                    <p className="text-sm text-slate-600">OTT</p>
                    <p className="font-medium text-slate-900">{report.ott || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Components */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Component Assessment</h2>
              
              <div className="space-y-6">
                {report.components.map((component, index) => (
                  <div key={component.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{component.type}</h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <StatusBadge status={component.status} size="sm" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            component.priority === 'CRITICAL' 
                              ? 'bg-red-100 text-red-800'
                              : component.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : component.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {component.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Findings</h4>
                        <p className="text-slate-700">{component.findings}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Parameters</h4>
                        <p className="text-slate-700">{component.parameters}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Suggestions</h4>
                        <p className="text-slate-700">{component.suggestions}</p>
                      </div>

                      {component.photos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 mb-3">Photos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {component.photos.map((photo, photoIndex) => (
                              <div key={photoIndex} className="relative">
                                <img
                                  src={photo}
                                  alt={`${component.type} photo ${photoIndex + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                                  <Camera className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Conclusions</h2>
              <p className="text-slate-700 leading-relaxed">{report.conclusions}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Components</span>
                  <span className="font-medium text-slate-900">{report.components.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">High Priority</span>
                  <span className="font-medium text-red-600">
                    {report.components.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Suggested Parts</span>
                  <span className="font-medium text-slate-900">{report.suggested_parts.length}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="text-slate-600">Parts Cost</span>
                  <span className="font-medium text-slate-900">${totalPartsCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Suggested Parts */}
            {report.suggested_parts.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Suggested Parts</h3>
                
                <div className="space-y-4">
                  {report.suggested_parts.map((part, index) => (
                    <div key={part.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-900 text-sm">{part.description}</h4>
                        <span className="text-sm font-medium text-slate-900">
                          ${(part.quantity * part.unit_price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{part.part_number}</p>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Qty: {part.quantity}</span>
                        <span>Unit: ${part.unit_price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};