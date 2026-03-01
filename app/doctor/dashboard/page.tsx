"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Users, FileText, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function DoctorDashboard() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Fetch appointments for this doctor
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', currentUser?.id || currentUser?.uid)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      setAppointments(appointmentsSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })));

      // Fetch patients
      const patientsQuery = query(collection(db, 'patients'));
      const patientsSnapshot = await getDocs(patientsQuery);
      setPatients(patientsSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })));

      // Fetch prescriptions
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('doctorId', '==', currentUser?.id || currentUser?.uid)
      );
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      setPrescriptions(prescriptionsSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a: any) => a.date === today);
  const pendingAppointments = appointments.filter((a: any) => a.status === 'pending');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, Dr. {currentUser?.name || 'Doctor'}! 👋</h1>
        <p className="text-white/90 text-sm sm:text-base">Here&apos;s your schedule and patient overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Today&apos;s Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          color="violet"
        />
        <StatCard
          title="Pending Appointments"
          value={pendingAppointments.length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Prescriptions Written"
          value={prescriptions.length}
          icon={FileText}
          color="indigo"
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Today&apos;s Schedule</h2>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{apt.patientName}</p>
                    <p className="text-sm text-slate-500">{apt.time} - {apt.reason}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                  ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            No appointments scheduled for today
          </div>
        )}
      </div>
    </div>
  );
}
