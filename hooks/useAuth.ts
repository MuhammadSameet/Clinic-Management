"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
  };
}

export const useAuth = (requiredRole: string) => {
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.authStates);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role !== requiredRole) {
      const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      router.push(redirectMap[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, requiredRole, router]);

  return { currentUser, isAuthenticated };
};

export default useAuth;
