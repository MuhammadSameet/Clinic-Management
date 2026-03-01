"use client";

import React, { useEffect, useState } from 'react';
import { Search, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      toast.success('Appointment status updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;
    return matchesStatus && matchesDate;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-500">View and manage all appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input md:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input md:w-48"
        />
      </div>

      {/* Table */}
      {filteredAppointments.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Patient</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Doctor</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Reason</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{apt.patientName}</td>
                  <td className="py-4 px-6 text-gray-600">Dr. {apt.doctorName}</td>
                  <td className="py-4 px-6 text-gray-600">{apt.date}</td>
                  <td className="py-4 px-6 text-gray-600">{apt.time}</td>
                  <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{apt.reason}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark Completed"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="No appointments match the selected filters"
        />
      )}
    </div>
  );
}
