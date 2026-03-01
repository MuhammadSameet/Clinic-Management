"use client";

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, User } from 'lucide-react';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-soft shrink-0">
      {/* Left - Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{title}</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 shrink-0">
        {/* Search Bar (hidden on mobile) */}
        <div className="hidden md:flex items-center">
          <div className="relative w-64 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Notifications */}
        <button 
          className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 group" 
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-sm" />
          )}
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser?.role || 'Guest'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
