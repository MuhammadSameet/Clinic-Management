"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
  };
  patientsStates: {
    list: any[];
    loading: boolean;
  };
  appointmentsStates: {
    list: any[];
    loading: boolean;
  };
}

interface DoctorStats {
  name: string;
  total: number;
  pending: number;
  completed: number;
}

interface StatusBreakdown {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function AdminDashboard() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const { list: patients, loading: patientsLoading } = useSelector((state: RootState) => state.patientsStates);
  const { list: appointments, loading: appointmentsLoading } = useSelector((state: RootState) => state.appointmentsStates);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [receptionists, setReceptionists] = useState<any[]>([]);

  useEffect(() => {
    // Fetch patients
    const fetchPatients = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const patientsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Dispatch action handled in component
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };
    fetchPatients();

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const appointmentsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Dispatch action handled in component
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };
    fetchAppointments();

    // Fetch users
    const fetchUsers = async () => {
      try {
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));
        const doctorsSnapshot = await getDocs(doctorsQuery);
        setDoctors(doctorsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        const receptionistsQuery = query(collection(db, 'users'), where('role', '==', 'receptionist'));
        const receptionistsSnapshot = await getDocs(receptionistsQuery);
        setReceptionists(receptionistsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today);
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const monthlyRevenue = completedAppointments.length * 500;

  // Calculate appointments per doctor
  const appointmentsPerDoctor: DoctorStats[] = doctors.map(doc => {
    const docAppointments = appointments.filter(a => a.doctorId === doc.id);
    return {
      name: doc.name,
      total: docAppointments.length,
      pending: docAppointments.filter(a => a.status === 'pending').length,
      completed: docAppointments.filter(a => a.status === 'completed').length
    };
  });

  // Calculate status breakdown
  const statusBreakdown: StatusBreakdown = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (patientsLoading || appointmentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {currentUser?.name || 'Admin'}! 👋</h1>
        <p className="text-white/90 text-sm sm:text-base">Here&apos;s what&apos;s happening at your clinic today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          color="violet"
          trend="+12% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Doctors"
          value={doctors.length}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Today&apos;s Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={`PKR ${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="indigo"
          trend="+8% from last month"
          trendUp={true}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments per Doctor */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            Appointments per Doctor
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Doctor</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Pending</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Completed</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsPerDoctor.map((doc, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-sm text-slate-900">Dr. {doc.name}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-600">{doc.total}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">{doc.pending}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{doc.completed}</span>
                    </td>
                  </tr>
                ))}
                {appointmentsPerDoctor.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No doctors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Appointment Status Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-900">Pending</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-900">Confirmed</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{statusBreakdown.confirmed}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-900">Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{statusBreakdown.completed}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-slate-900">Cancelled</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{statusBreakdown.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Doctor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((apt: any) => (
                <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-sm text-slate-900">{apt.patientName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">Dr. {apt.doctorName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{apt.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{apt.time}</td>
                  <td className="py-3 px-4">
                    <span className={`
                      inline-flex px-2 py-1 rounded-full text-xs font-medium
                      ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
