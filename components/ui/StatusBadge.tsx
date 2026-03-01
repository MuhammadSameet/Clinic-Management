"use client";

import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'low' | 'medium' | 'high' | 'male' | 'female' | 'other';
}

const statusConfig = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Pending'
  },
  confirmed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Confirmed'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Completed'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Cancelled'
  },
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Low Risk'
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Medium Risk'
  },
  high: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'High Risk'
  },
  male: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Male'
  },
  female: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    label: 'Female'
  },
  other: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'Other'
  }
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
