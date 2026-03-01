"use client";

import React from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.FC<any>;
  color?: 'violet' | 'indigo' | 'teal' | 'emerald' | 'orange' | 'rose';
  trend?: string;
  trendUp?: boolean;
  description?: string;
}

const colorClasses: Record<string, {
  bg: string;
  bgLight: string;
  icon: string;
  text: string;
  textMuted: string;
}> = {
  violet: {
    bg: 'bg-violet-50',
    bgLight: 'bg-violet-100/50',
    icon: 'bg-gradient-to-br from-violet-600 to-violet-700',
    text: 'text-violet-700',
    textMuted: 'text-violet-600/70',
  },
  indigo: {
    bg: 'bg-indigo-50',
    bgLight: 'bg-indigo-100/50',
    icon: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
    text: 'text-indigo-700',
    textMuted: 'text-indigo-600/70',
  },
  teal: {
    bg: 'bg-teal-50',
    bgLight: 'bg-teal-100/50',
    icon: 'bg-gradient-to-br from-teal-600 to-teal-700',
    text: 'text-teal-700',
    textMuted: 'text-teal-600/70',
  },
  emerald: {
    bg: 'bg-emerald-50',
    bgLight: 'bg-emerald-100/50',
    icon: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
    text: 'text-emerald-700',
    textMuted: 'text-emerald-600/70',
  },
  orange: {
    bg: 'bg-orange-50',
    bgLight: 'bg-orange-100/50',
    icon: 'bg-gradient-to-br from-orange-600 to-orange-700',
    text: 'text-orange-700',
    textMuted: 'text-orange-600/70',
  },
  rose: {
    bg: 'bg-rose-50',
    bgLight: 'bg-rose-100/50',
    icon: 'bg-gradient-to-br from-rose-600 to-rose-700',
    text: 'text-rose-700',
    textMuted: 'text-rose-600/70',
  },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'violet', 
  trend, 
  trendUp,
  description 
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-md 
      transition-all duration-300 border border-slate-100
      bg-white group cursor-default
    `}>
      {/* Background gradient accent */}
      <div className={`absolute -top-16 -right-16 w-32 h-32 ${colors.bgLight} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity`} />
      <div className={`absolute -bottom-16 -left-16 w-32 h-32 ${colors.bgLight} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Icon */}
          <div className={`${colors.icon} rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          
          {/* Trend badge */}
          {trend && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              trendUp 
                ? 'bg-emerald-100/80 text-emerald-700' 
                : 'bg-rose-100/80 text-rose-700'
            }`}>
              {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>

        {/* Value */}
        <p className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>
          {value}
        </p>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-500 mt-3">{description}</p>
        )}
      </div>
    </div>
  );
}
