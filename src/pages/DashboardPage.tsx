import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { DashboardLayout } from '../components/templates/DashboardLayout';

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
  Clock,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ReportFilters, MachineType, ReportStatus, Report } from '../types';
import { apiService } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [pendingClientName, setPendingClientName] = useState('');
  const [serialNumberInput, setSerialNumberInput] = useState('');
  const { data: reportsData, isLoading, error } = useReports(filters);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    apiService.getAllUsers().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    });
  }, []);

  const machineTypeOptions = [
    { value: '', label: 'All Machine Types' },
    { value: 'EXCAVATOR', label: 'Excavator' },
    { value: 'BULLDOZER', label: 'Bulldozer' },
    { value: 'LOADER', label: 'Loader' },
    { value: 'CRANE', label: 'Crane' },
    { value: 'COMPACTOR', label: 'Compactor' },
    { value: 'GRADER', label: 'Grader' },
  ];



  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      clientName: pendingClientName || undefined,
      serialNumber: serialNumberInput || undefined,
    }));
    setClientNameInput(pendingClientName);
  };

  const handleUserFilterChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setFilters(prev => ({ ...prev, userFullName: user ? user.full_name : undefined }));
  };

  const clearFilters = () => {
    setFilters({});
    setClientNameInput('');
    setPendingClientName('');
    setSerialNumberInput('');
    setSelectedUserId('');
  };



  const getPriorityCount = (reports: Report[]) => {
    const stats = { total: 0, high: 0, medium: 0 };
    
    reports.forEach(report => {
      stats.total++;
      if (report.components?.some(comp => comp.priority === 'HIGH')) {
        stats.high++;
      }
      if (report.components?.some(comp => comp.priority === 'MEDIUM')) {
        stats.medium++;
      }
    });
    
    return stats;
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
                  {reports.filter(r => new Date(r.report_date).getMonth() === new Date().getMonth()).length}
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <Input
                placeholder="Search client name..."
                value={pendingClientName}
                onChange={(e) => setPendingClientName(e.target.value)}
              />
              <Input
                placeholder="Buscar por serie..."
                value={serialNumberInput}
                onChange={e => setSerialNumberInput(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={handleSearch} className="ml-2">Buscar</Button>
              <Select
                options={machineTypeOptions}
                value={filters.machineType || ''}
                onChange={(e) => handleFilterChange('machineType', e.target.value)}
                placeholder="Select machine type"
              />

              <Select
                options={[{ value: '', label: 'Todos los usuarios' }, ...users.map(u => ({ value: u.id, label: u.full_name }))]}
                value={selectedUserId}
                onChange={e => handleUserFilterChange(e.target.value)}
                placeholder="Filtrar por usuario"
              />
              <div className="md:col-span-5 flex justify-end">
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
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Serie</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  return (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{report.client_name || 'No Client'}</p>
                          <p className="text-sm text-slate-600">{report.serial_number || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{report.machine_type || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{report.model || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{report.serial_number || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <p className="text-slate-900">{report.report_date ? format(new Date(report.report_date), 'MMM dd, yyyy') : 'No Date'}</p>
                      </td>
                      <td className="py-4 px-4">{report.user_full_name || 'N/A'}</td>
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