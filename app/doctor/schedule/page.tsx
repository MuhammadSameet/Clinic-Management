"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

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
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">My Schedule</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage your appointments</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('today')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'today' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'week' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          All
        </button>
      </div>

      {appointments.length > 0 ? (
        <div className="grid gap-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{apt.patientName}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{apt.reason}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{apt.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'} />
                  {(apt.status === 'confirmed' || apt.status === 'completed') && (
                    <button onClick={() => handleWritePrescription(apt)} className="btn btn-primary text-sm py-2 px-3 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Write Prescription
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
