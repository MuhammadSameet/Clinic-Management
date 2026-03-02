"use client";

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/SidebarContext';
import Topbar from '@/components/ui/Topbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
    authChecked: boolean;
  };
}

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthenticated, authChecked } = useSelector((state: RootState) => state.authStates);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== 'receptionist') {
      const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      router.replace(redirectMap[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!authChecked || !isAuthenticated || !currentUser || currentUser.role !== 'receptionist') {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      <InnerReceptionistLayout>{children}</InnerReceptionistLayout>
    </SidebarProvider>
  );
}

function InnerReceptionistLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <div className="min-h-screen bg-slate-50/80">
      <Sidebar role="receptionist" />
      <div className={`flex-1 flex flex-col min-w-0 ${isOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Topbar title="Receptionist Dashboard" />
        <main className="flex-1 overflow-auto main-content section-gap">
          {children}
        </main>
      </div>
    </div>
  );
}
