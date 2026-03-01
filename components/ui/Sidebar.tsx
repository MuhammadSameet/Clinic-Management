"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Clock,
  Heart,
  Menu,
  X,
  LogOut,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { useDispatch } from 'react-redux';

interface LinkConfig {
  href: string;
  label: string;
  icon: React.FC<any>;
}

interface RoleConfig {
  title: string;
  links: LinkConfig[];
}

const roleConfig: Record<string, RoleConfig> = {
  admin: {
    title: 'Admin',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/doctors', label: 'Doctors', icon: Users },
      { href: '/admin/receptionists', label: 'Receptionists', icon: Users },
      { href: '/admin/patients', label: 'Patients', icon: Heart },
      { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    ]
  },
  doctor: {
    title: 'Doctor',
    links: [
      { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/doctor/schedule', label: 'Schedule', icon: Calendar },
      { href: '/doctor/patients', label: 'Patients', icon: Users },
      { href: '/doctor/prescription', label: 'Prescriptions', icon: FileText },
    ]
  },
  receptionist: {
    title: 'Receptionist',
    links: [
      { href: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/receptionist/patients', label: 'Patients', icon: Users },
      { href: '/receptionist/appointments', label: 'Appointments', icon: Calendar },
    ]
  },
  patient: {
    title: 'Patient',
    links: [
      { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
      { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
      { href: '/patient/history', label: 'Medical History', icon: Clock },
    ]
  }
};

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const config = roleConfig[role] || roleConfig.patient;

  const handleLogout = () => {
    dispatch({ type: 'AUTH_LOGOUT' });
    dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: null, isAuthenticated: false } });
    localStorage.removeItem('auth');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all border border-slate-100"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-screen bg-white flex flex-col
          border-r border-slate-200 shadow-lg
          fixed lg:relative left-0 top-0 z-50 lg:z-auto
          transition-all duration-300 ease-in-out
          lg:translate-x-0
          overflow-y-auto
          ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-4 border-b border-slate-200 shrink-0">
          <Link href="/" className="flex items-center gap-3 w-full group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-base truncate">MediCare</h1>
                <p className="text-xs text-slate-500 font-medium truncate">{config.title}</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {config.links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }
                  ${!isOpen && 'lg:justify-center lg:px-3'}
                `}
                title={!isOpen ? link.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                {isOpen && (
                  <>
                    <span className="font-semibold text-sm truncate">{link.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200
              transition-all duration-200 font-medium text-sm
              ${!isOpen && 'lg:justify-center lg:px-3'}
            `}
            title={!isOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Collapse/Expand Button (Desktop Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex fixed bottom-6 left-6 z-40 p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all"
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
