import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
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
  Calendar, 
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ReportFilters, MachineType, ReportStatus, Report } from '../types';

export const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: reportsData, isLoading, error } = useReports(filters);

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

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REVIEWED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityCount = (reports: Report[]) => {
    if (!reports) return { high: 0, medium: 0, total: 0 };
    
    const highPriority = reports.filter(report => 
      report.components.some(comp => comp.priority === 'HIGH' || comp.priority === 'CRITICAL')
    ).length;
    
    const mediumPriority = reports.filter(report => 
      report.components.some(comp => comp.priority === 'MEDIUM')
    ).length;
    
    return { high: highPriority, medium: mediumPriority, total: reports.length };
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
  const priorityStats = getPriorityCount(reports);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your technical reports and inspections</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/reports/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-3xl font-bold text-slate-900">{priorityStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">{priorityStats.high}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Medium Priority</p>
                <p className="text-3xl font-bold text-yellow-600">{priorityStats.medium}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Month</p>
                <p className="text-3xl font-bold text-green-600">
                  {reports.filter(r => r.date.getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
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
              <div className="md:col-span-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const highestPriority = report.components.reduce((highest, comp) => {
                    const priorities = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
                    return priorities[comp.priority] > priorities[highest] ? comp.priority : highest;
                  }, 'LOW' as any);

                  return (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{report.clientName}</p>
                          <p className="text-sm text-slate-600">{report.serialNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{report.machineType}</p>
                          <p className="text-sm text-slate-600">{report.model}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-900">{format(report.date, 'MMM dd, yyyy')}</p>
                        <p className="text-sm text-slate-600">{report.location}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          highestPriority === 'CRITICAL' 
                            ? 'bg-red-100 text-red-800'
                            : highestPriority === 'HIGH'
                            ? 'bg-orange-100 text-orange-800'
                            : highestPriority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {highestPriority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Link to={`/reports/${report.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link to={`/reports/${report.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Wrench className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {reports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No reports found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first report.</p>
                <Link to="/reports/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};