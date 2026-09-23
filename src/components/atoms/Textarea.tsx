import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helpText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={textareaId} className="form-label">
            {label}
            {props.required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-colors resize-y',
            'focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="form-error">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-slate-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';