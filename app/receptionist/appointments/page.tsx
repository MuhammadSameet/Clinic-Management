"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, User, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

interface RootState {
  authStates: { currentUser: any };
}

export default function ReceptionistAppointmentsPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: '', time: '', reason: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const [aptsSnap, patientsSnap, doctorsSnap] = await Promise.all([
        getDocs(query(collection(db, 'appointments'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'patients')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')))
      ]);
      setAppointments(aptsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPatients(patientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDoctors(doctorsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const patient = patients.find(p => p.id === formData.patientId);
      const doctor = doctors.find(d => d.id === formData.doctorId);
      await addDoc(collection(db, 'appointments'), {
        patientId: formData.patientId, patientName: patient?.name,
        doctorId: formData.doctorId, doctorName: doctor?.name,
        date: formData.date, time: formData.time, reason: formData.reason,
        status: 'pending', bookedBy: currentUser?.id || currentUser?.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Appointment booked successfully');
      setIsModalOpen(false);
      setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to book');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredAppointments = appointments.filter(apt => statusFilter === 'all' || apt.status === statusFilter);
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Book and manage appointments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Calendar className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base py-2.5 text-sm w-full sm:w-44">
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

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
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900">{apt.patientName}</span>
                    </div>
                  </td>
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
                        <button type="button" onClick={() => handleUpdateStatus(apt.id, 'completed')} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Complete"><Check className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Calendar} title="No appointments" description="No appointments match the filter" action={{ label: 'Book Appointment', onClick: () => setIsModalOpen(true) }} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book New Appointment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Patient *</label>
            <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="input" required>
              <option value="">Select patient</option>
              {patients.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          <div>
            <label className="input-label">Doctor *</label>
            <select value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })} className="input" required>
              <option value="">Select doctor</option>
              {doctors.map(d => (<option key={d.id} value={d.id}>Dr. {d.name} – {d.specialty}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Date *</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={today} className="input" required />
            </div>
            <div>
              <label className="input-label">Time *</label>
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="input" required />
            </div>
          </div>
          <div>
            <label className="input-label">Reason *</label>
            <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input" rows={2} placeholder="Reason" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" className="btn btn-primary text-sm py-2 px-4">Book</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
