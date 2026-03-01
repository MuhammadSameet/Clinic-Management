"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Users, Clock, UserPlus } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function ReceptionistDashboard() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Fetch patients count
      const patientsQuery = query(collection(db, 'patients'));
      const patientsSnapshot = await getDocs(patientsQuery);

      // Fetch appointments count
      const appointmentsQuery = query(collection(db, 'appointments'));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      // Today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayQuery = query(
        collection(db, 'appointments'),
        where('date', '==', today)
      );
      const todaySnapshot = await getDocs(todayQuery);

      // Pending appointments
      const pendingQuery = query(
        collection(db, 'appointments'),
        where('status', '==', 'pending')
      );
      const pendingSnapshot = await getDocs(pendingQuery);

      setStats({
        patients: patientsSnapshot.size,
        appointments: appointmentsSnapshot.size,
        todayAppointments: todaySnapshot.size,
        pendingAppointments: pendingSnapshot.size
      });
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
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name || 'Receptionist'}! 👋</h1>
        <p className="text-white/80">Here&apos;s your clinic overview for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/receptionist/patients">
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon={Users}
            color="blue"
          />
        </Link>
        <Link href="/receptionist/appointments">
          <StatCard
            title="Total Appointments"
            value={stats.appointments}
            icon={Calendar}
            color="green"
          />
        </Link>
        <Link href="/receptionist/appointments">
          <StatCard
            title="Today&apos;s Appointments"
            value={stats.todayAppointments}
            icon={Clock}
            color="orange"
          />
        </Link>
        <Link href="/receptionist/appointments">
          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            icon={UserPlus}
            color="purple"
          />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/receptionist/patients" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add New Patient</h3>
                <p className="text-sm text-gray-500">Register a new patient</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/receptionist/appointments" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-500">Schedule a new appointment</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
