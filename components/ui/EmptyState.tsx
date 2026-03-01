"use client";

import React from 'react';

interface EmptyStateProps {
  icon?: React.FC<any>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  [key: string]: any;
}

export default function EmptyState({ icon: Icon, title, description, action, ...rest }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center" {...rest}>
      {Icon && (
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-5">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn btn-primary text-sm py-2.5 px-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
