"use client";

import React from 'react';
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

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left - Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        {/* Search (hidden on mobile) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentUser?.role || 'Guest'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
