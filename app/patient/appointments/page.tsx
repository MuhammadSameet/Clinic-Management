"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, User } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500">View your appointment history</p>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#0077B6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-[#0077B6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Dr. {apt.doctorName}</h3>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium self-start
                  ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                  ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {apt.status}
                </span>
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
