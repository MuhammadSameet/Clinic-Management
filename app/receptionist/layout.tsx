"use client";

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Topbar from '@/components/ui/Topbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
  };
}

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.authStates);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/');
      return;
    }
    
    if (currentUser.role !== 'receptionist') {
      const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      router.push(redirectMap[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser || currentUser.role !== 'receptionist') {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="receptionist" />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Topbar title="Receptionist Dashboard" />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
