"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function PatientAppointmentsPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Find patient by email
      const patientsQuery = query(
        collection(db, 'patients'),
        where('email', '==', currentUser?.email)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      
      if (!patientsSnapshot.empty) {
        const patientId = patientsSnapshot.docs[0].id;
        
        // Fetch appointments for this patient
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientId),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">My Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">View your appointment history</p>
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
                    <h3 className="font-semibold text-slate-900">Dr. {apt.doctorName}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{apt.reason}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{apt.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.time}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="You don't have any appointments yet"
        />
      )}
    </div>
  );
}
