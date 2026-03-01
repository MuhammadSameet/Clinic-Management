"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, FileText, Stethoscope } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        <p className="text-gray-500">Your complete medical timeline</p>
      </div>

      {/* Timeline */}
      {timeline.length > 0 ? (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {timeline.map((item) => (
              <div key={item.id} className="relative pl-20">
                {/* Timeline Dot */}
                <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${
                  item.type === 'appointment' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  {/* Date Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{item.date}</span>
                    {item.type === 'appointment' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${item.data.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${item.data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${item.data.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.data.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {item.data.status}
                      </span>
                    )}
                  </div>

                  {item.type === 'appointment' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Appointment with Dr. {item.data.doctorName}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.data.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.data.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'prescription' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Prescription from Dr. {item.data.doctorName}</h3>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-700">Diagnosis: {item.data.diagnosis}</p>
                            {item.data.riskLevel && (
                              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.data.riskLevel)}`}>
                                Risk Level: {item.data.riskLevel}
                              </span>
                            )}
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Medicines:</p>
                            <div className="flex flex-wrap gap-2">
                              {(item.data.medicines || []).map((med: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm">
                                  {med.name} - {med.dosage}
                                </span>
                              ))}
                            </div>
                          </div>

                          {item.data.instructions && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                              <p className="text-sm font-medium text-gray-700">Instructions:</p>
                              <p className="text-sm text-gray-600">{item.data.instructions}</p>
                            </div>
                          )}
                        </div>
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
