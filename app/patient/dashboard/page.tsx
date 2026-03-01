"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Calendar, FileText, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function PatientDashboard() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Find patient by email
      const patientsQuery = query(
        collection(db, 'patients'),
        where('email', '==', currentUser?.email)
      );
      const patientsSnapshot = await getDocs(patientsQuery);

      if (!patientsSnapshot.empty) {
        const patientData: any = patientsSnapshot.docs[0].data();
        const patientId = patientsSnapshot.docs[0].id;

        // Fetch appointments for this patient
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientId)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        // Fetch prescriptions for this patient
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', patientId)
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);

        // Count upcoming appointments
        const today = new Date().toISOString().split('T')[0];
        const upcomingCount = appointmentsSnapshot.docs.filter((d: any) => {
          const apt = d.data();
          return apt.date >= today && apt.status !== 'cancelled';
        }).length;

        setStats({
          appointments: appointmentsSnapshot.size,
          prescriptions: prescriptionsSnapshot.size,
          upcoming: upcomingCount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0077B6] to-[#023E8A] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name || 'Patient'}! 👋</h1>
        <p className="text-white/80">Manage your health records and appointments.</p>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#0077B6]/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-[#0077B6]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h2>
            <p className="text-gray-500">{currentUser?.email}</p>
            <p className="text-sm text-gray-400 mt-1">Patient Account</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcoming}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Appointments"
          value={stats.appointments}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Prescriptions"
          value={stats.prescriptions}
          icon={FileText}
          color="green"
        />
      </div>
    </div>
  );
}
