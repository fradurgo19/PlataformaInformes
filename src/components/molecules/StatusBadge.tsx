import React from 'react';
import { cn } from '../../utils/cn';
import { ReportStatus, ComponentStatus } from '../../types';

interface StatusBadgeProps {
  status: ReportStatus | ComponentStatus | null | undefined;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: ReportStatus | ComponentStatus | null | undefined) => {
    if (!status) {
      return { label: 'Unknown', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }

    const configs: Record<string, { label: string; className: string }> = {
      // Report Statuses
      draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
      archived: { label: 'Archived', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      
      // Component Statuses
      CORRECTED: { label: 'Corrected', className: 'bg-green-100 text-green-700 border-green-200' },
      PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      
      // Legacy or other statuses for safety
      IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      REVIEWED: { label: 'Reviewed', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    };
    
    return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizeClasses
      )}
    >
      {config.label}
    </span>
  );
};