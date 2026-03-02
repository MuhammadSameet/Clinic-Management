"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snapshot = await getDocs(q);
      setDoctors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('@/lib/firebase');
      const { collection, addDoc, doc, updateDoc, deleteDoc } = await import('firebase/firestore');
      if (editingDoctor) {
        await updateDoc(doc(db, 'users', editingDoctor.id), {
          name: formData.name,
          specialty: formData.specialty
        });
        toast.success('Doctor updated successfully');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const uid = userCredential.user.uid;
        const createdBy = auth.currentUser?.uid || uid;
        const userDoc = {
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          role: 'doctor',
          createdAt: new Date().toISOString(),
          createdBy,
        };
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', uid), userDoc);
        await setDoc(doc(db, 'doctors', uid), { ...userDoc, createdBy });
        toast.success('Doctor added successfully');
      }
      setIsModalOpen(false);
      setEditingDoctor(null);
      setFormData({ name: '', email: '', password: '', specialty: '' });
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save doctor');
    }
  };

  const handleDelete = async (doctorId: string) => {
    const result = await Swal.fire({
      title: 'Delete doctor? ',
      text: 'Are you sure you want to delete this doctor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'users', doctorId));
      // Also remove role-specific doc if exists
      try { const { deleteDoc, doc: d } = await import('firebase/firestore'); await deleteDoc(d(db, 'doctors', doctorId)); } catch (e) {}
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error: any) {
      toast.error('Failed to delete doctor');
    }
  };

  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: '',
      specialty: doctor.specialty || ''
    });
    setIsModalOpen(true);
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Doctors Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage doctor accounts and specialties</p>
        </div>
        <button
          onClick={() => {
            setEditingDoctor(null);
            setFormData({ name: '', email: '', password: '', specialty: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search doctors by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all"
        />
      </div>

      {filteredDoctors.length > 0 ? (
        <div className="table-wrap bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Specialty</th>
                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900">Dr. {doctor.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden md:table-cell">{doctor.email}</td>
                  <td className="py-3 px-3 sm:px-4">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-dark rounded-full text-xs font-medium">
                      {doctor.specialty || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEditModal(doctor)} className="p-2 hover:bg-primary-50 rounded-lg text-primary" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(doctor.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No doctors found"
          description="Add your first doctor to get started"
          action={{ label: 'Add Doctor', onClick: () => setIsModalOpen(true) }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDoctor(null); }}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Doctor name" required />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="doctor@example.com" required disabled={!!editingDoctor} />
          </div>
          {!editingDoctor && (
            <div>
              <label className="input-label">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="••••••••" required />
            </div>
          )}
          <div>
            <label className="input-label">Specialty</label>
            <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="input">
              <option value="">Select specialty</option>
              <option value="General">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Gynecology">Gynecology</option>
              <option value="ENT">ENT</option>
              <option value="Eye">Eye Specialist</option>
              <option value="Dental">Dental</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" className="btn btn-primary text-sm py-2 px-4">{editingDoctor ? 'Update' : 'Add'} Doctor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
