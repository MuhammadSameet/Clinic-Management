"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface RootState {
  authStates: {
    currentUser: any;
  };
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
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Fetch appointments
      const aptsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const aptsSnapshot = await getDocs(aptsQuery);
      setAppointments(aptsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch patients
      const patientsQuery = query(collection(db, 'patients'));
      const patientsSnapshot = await getDocs(patientsQuery);
      setPatients(patientsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch doctors
      const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const doctorsSnapshot = await getDocs(doctorsQuery);
      setDoctors(doctorsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
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
        patientId: formData.patientId,
        patientName: patient?.name,
        doctorId: formData.doctorId,
        doctorName: doctor?.name,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: 'pending',
        bookedBy: currentUser?.id || currentUser?.uid,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Appointment booked successfully');
      setIsModalOpen(false);
      setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    statusFilter === 'all' || apt.status === statusFilter
  );

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-500">Book and manage appointments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
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
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{apt.patientName}</span>
                    </div>
                  </td>
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
          description="No appointments match the selected filter"
          action={{
            label: 'Book Appointment',
            onClick: () => setIsModalOpen(true)
          }}
        />
      )}

      {/* Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book New Appointment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Doctor *</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>Dr. {doctor.name} - {doctor.specialty}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={today}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input"
              rows={3}
              placeholder="Reason for appointment"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Book Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
