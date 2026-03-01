"use client";

import React, { useEffect, useState } from 'react';
import { Search, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

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
      toast.success('Status updated');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Appointments Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage all appointments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10 hover:border-slate-300 transition-all"
        >
          <option value="all">All Status</option>
          <option value="pending">🔄 Pending</option>
          <option value="confirmed">✓ Confirmed</option>
          <option value="completed">✓ Completed</option>
          <option value="cancelled">✗ Cancelled</option>
        </select>
        <input 
          type="date" 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)} 
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10 hover:border-slate-300 transition-all" 
        />
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="table-wrap bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Patient</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden md:table-cell">Doctor</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Time</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden lg:table-cell">Reason</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Status</th>
                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="py-3 px-3 sm:px-4 font-medium text-slate-900">{apt.patientName}</td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden md:table-cell">Dr. {apt.doctorName}</td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600">{apt.date}</td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600">{apt.time}</td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 max-w-[140px] truncate hidden lg:table-cell">{apt.reason}</td>
                  <td className="py-3 px-3 sm:px-4">
                    <StatusBadge status={apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'} />
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === 'pending' && (
                        <>
                          <button type="button" onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Confirm"><Check className="w-4 h-4" /></button>
                          <button type="button" onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Cancel"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button type="button" onClick={() => handleUpdateStatus(apt.id, 'completed')} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Mark Completed"><Check className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Calendar} title="No appointments found" description="No appointments match the selected filters" />
      )}
    </div>
  );
}
