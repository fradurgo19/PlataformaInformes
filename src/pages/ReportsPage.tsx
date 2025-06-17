import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports, useDeleteReport } from '../hooks/useReports';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { StatusBadge } from '../components/molecules/StatusBadge';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ReportFilters, MachineType, ReportStatus } from '../types';
import { generateReportPDF } from '../utils/pdf';

export const ReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { data: reportsData, isLoading, error } = useReports(filters);
  const deleteReportMutation = useDeleteReport();

  const machineTypeOptions = [
    { value: '', label: 'All Machine Types' },
    { value: 'EXCAVATOR', label: 'Excavator' },
    { value: 'BULLDOZER', label: 'Bulldozer' },
    { value: 'LOADER', label: 'Loader' },
    { value: 'CRANE', label: 'Crane' },
    { value: 'COMPACTOR', label: 'Compactor' },
    { value: 'GRADER', label: 'Grader' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'REVIEWED', label: 'Reviewed' },
  ];

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReportMutation.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleDownloadPDF = async (report: any) => {
    try {
      await generateReportPDF(report);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Reports</h3>
            <p className="text-slate-600">Please try refreshing the page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const reports = reportsData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 mt-1">Manage all technical inspection reports</p>
          </div>
          <Link to="/reports/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search client name..."
              value={filters.clientName || ''}
              onChange={(e) => handleFilterChange('clientName', e.target.value)}
            />
            <Select
              options={machineTypeOptions}
              value={filters.machineType || ''}
              onChange={(e) => handleFilterChange('machineType', e.target.value as MachineType)}
              placeholder="Select machine type"
            />
            <Select
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as ReportStatus)}
              placeholder="Select status"
            />
            <Button variant="outline" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-slate-50 rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{report.clientName}</h3>
                    <p className="text-sm text-slate-600">{report.machineType} - {report.model}</p>
                    <p className="text-sm text-slate-500">S/N: {report.serialNumber}</p>
                  </div>
                  <StatusBadge status={report.status} size="sm" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{format(report.date, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2 truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">Components:</span>
                    <span className="ml-2">{report.components.length}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link to={`/reports/${report.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/reports/${report.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadPDF(report)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No reports found</h3>
              <p className="text-slate-600 mb-4">
                {Object.keys(filters).length > 0
                  ? 'Try adjusting your filters or create a new report.'
                  : 'Get started by creating your first report.'
                }
              </p>
              <Link to="/reports/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-slate-900">Delete Report</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  isLoading={deleteReportMutation.isPending}
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};