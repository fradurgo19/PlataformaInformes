import React from 'react';
import { cn } from '../../utils/cn';
import { ReportStatus, ComponentStatus } from '../../types';

interface StatusBadgeProps {
  status: ReportStatus | ComponentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: ReportStatus | ComponentStatus) => {
    const configs = {
      DRAFT: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
      IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
      REVIEWED: { label: 'Reviewed', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      CORRECTED: { label: 'Corrected', className: 'bg-green-100 text-green-700 border-green-200' },
      PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    };
    return configs[status] || configs.DRAFT;
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