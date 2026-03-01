"use client";

import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'low' | 'medium' | 'high' | 'male' | 'female' | 'other';
  className?: string;
}

const statusConfig = {
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-800', label: 'Pending' },
  confirmed: { bg: 'bg-primary-50', text: 'text-primary-dark', label: 'Confirmed' },
  completed: { bg: 'bg-green-50',   text: 'text-green-800', label: 'Completed' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-800', label: 'Cancelled' },
  low:       { bg: 'bg-green-50',   text: 'text-green-800', label: 'Low Risk' },
  medium:    { bg: 'bg-amber-50',   text: 'text-amber-800', label: 'Medium Risk' },
  high:      { bg: 'bg-red-50',     text: 'text-red-800', label: 'High Risk' },
  male:      { bg: 'bg-primary-50', text: 'text-primary-dark', label: 'Male' },
  female:    { bg: 'bg-pink-50',    text: 'text-pink-800', label: 'Female' },
  other:     { bg: 'bg-slate-100',  text: 'text-slate-700', label: 'Other' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}
