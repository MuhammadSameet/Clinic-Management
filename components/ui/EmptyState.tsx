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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
