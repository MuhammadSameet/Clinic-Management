"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Clock,
  Heart,
  Menu,
  X,
  LogOut,
  Stethoscope,
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
    title: 'Admin Panel',
    links: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/doctors', label: 'Doctors', icon: UserCheck },
      { href: '/admin/receptionists', label: 'Receptionists', icon: Users },
      { href: '/admin/patients', label: 'Patients', icon: Heart },
      { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    ]
  },
  doctor: {
    title: 'Doctor Panel',
    links: [
      { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/doctor/schedule', label: 'My Schedule', icon: Calendar },
      { href: '/doctor/patients', label: 'My Patients', icon: Users },
      { href: '/doctor/prescription', label: 'Prescriptions', icon: FileText },
    ]
  },
  receptionist: {
    title: 'Receptionist Panel',
    links: [
      { href: '/receptionist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/receptionist/patients', label: 'Patients', icon: Users },
      { href: '/receptionist/appointments', label: 'Appointments', icon: Calendar },
    ]
  },
  patient: {
    title: 'Patient Portal',
    links: [
      { href: '/patient/dashboard', label: 'My Profile', icon: LayoutDashboard },
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
  const [isOpen, setIsOpen] = useState(false);
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-2xl
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">MediCare</h1>
              <p className="text-slate-400 text-xs">{config.title}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {config.links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
