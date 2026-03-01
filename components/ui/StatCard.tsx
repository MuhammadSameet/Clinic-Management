"use client";

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.FC<any>;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: string;
  trendUp?: boolean;
}

const colorClasses: Record<string, {
  bg: string;
  icon: string;
  text: string;
  border: string;
  gradient: string;
}> = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    border: 'border-l-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-gradient-to-br from-green-500 to-green-600',
    text: 'text-green-600',
    border: 'border-l-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-gradient-to-br from-orange-500 to-orange-600',
    text: 'text-orange-600',
    border: 'border-l-orange-500',
    gradient: 'from-orange-500 to-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-gradient-to-br from-red-500 to-red-600',
    text: 'text-red-600',
    border: 'border-l-red-500',
    gradient: 'from-red-500 to-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
    text: 'text-purple-600',
    border: 'border-l-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  }
};

export default function StatCard({ title, value, icon: Icon, color, trend, trendUp }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`
      bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300
      border-l-4 ${colors.border}
      animate-fadeIn group
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text} mt-2`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-3 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`${colors.icon} rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
