"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      let q;
      const doctorId = currentUser?.id || currentUser?.uid;
      
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
          where('date', '==', today),
          orderBy('time', 'asc')
        );
      } else if (filter === 'week') {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
          where('date', '>=', today.toISOString().split('T')[0]),
          where('date', '<=', nextWeek.toISOString().split('T')[0]),
          orderBy('date', 'asc'),
          orderBy('time', 'asc')
        );
      } else {
        q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
          orderBy('date', 'desc'),
          orderBy('time', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWritePrescription = (appointment: any) => {
    router.push(`/doctor/prescription?appointmentId=${appointment.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500">View and manage your appointments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'today' 
              ? 'bg-[#0077B6] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'week' 
              ? 'bg-[#0077B6] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-[#0077B6] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#0077B6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-[#0077B6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{apt.patientName}</h3>
                    <p className="text-gray-500 text-sm mt-1">{apt.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                    ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {apt.status}
                  </span>
                  {(apt.status === 'confirmed' || apt.status === 'completed') && (
                    <button
                      onClick={() => handleWritePrescription(apt)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Write Prescription
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={`No appointments scheduled for ${filter === 'today' ? 'today' : filter === 'week' ? 'this week' : 'any date'}`}
        />
      )}
    </div>
  );
}
