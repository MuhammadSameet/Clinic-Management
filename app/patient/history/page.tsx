"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, FileText, Stethoscope } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

interface TimelineItem {
  id: string;
  type: 'appointment' | 'prescription' | 'diagnosis';
  date: string;
  data: any;
}

export default function PatientHistoryPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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
        
        // Fetch appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientId),
          orderBy('date', 'desc'),
          orderBy('time', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointments = appointmentsSnapshot.docs.map(d => ({
          id: d.id,
          type: 'appointment' as const,
          date: d.data().date,
          data: d.data()
        }));

        // Fetch prescriptions
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        const prescriptions = prescriptionsSnapshot.docs.map(d => ({
          id: d.id,
          type: 'prescription' as const,
          date: d.data().createdAt?.split('T')[0] || '',
          data: d.data()
        }));

        // Merge and sort by date
        const merged = [...appointments, ...prescriptions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setTimeline(merged);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
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
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Medical History</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your complete medical timeline</p>
      </div>

      {timeline.length > 0 ? (
        <div className="relative">
          <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="relative pl-14 sm:pl-16">
                <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.type === 'appointment' ? 'bg-primary' : 'bg-green-500'}`} />
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">{item.date}</span>
                    {item.type === 'appointment' && (
                      <StatusBadge status={item.data.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'} />
                    )}
                  </div>

                  {item.type === 'appointment' && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">Appointment with Dr. {item.data.doctorName}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">{item.data.reason}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                          <Clock className="w-3 h-3" /> {item.data.time}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'prescription' && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm">Prescription from Dr. {item.data.doctorName}</h3>
                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg">
                          <p className="text-xs font-medium text-slate-700">Diagnosis: {item.data.diagnosis}</p>
                          {item.data.riskLevel && (
                            <StatusBadge status={item.data.riskLevel === 'high' ? 'high' : item.data.riskLevel === 'medium' ? 'medium' : 'low'} className="mt-1.5" />
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-slate-700 mb-1">Medicines</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(item.data.medicines || []).map((med: any, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-primary-50 text-primary-dark rounded-full text-xs">{med.name} – {med.dosage}</span>
                            ))}
                          </div>
                        </div>
                        {item.data.instructions && (
                          <div className="mt-2 p-2.5 bg-amber-50 rounded-lg">
                            <p className="text-xs font-medium text-slate-700">Instructions</p>
                            <p className="text-xs text-slate-600 mt-0.5">{item.data.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No medical history"
          description="Your medical history will appear here after your first visit"
        />
      )}
    </div>
  );
}
