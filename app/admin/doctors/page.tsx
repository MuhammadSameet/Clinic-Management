"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function DoctorsPage() {
  const dispatch = useDispatch();
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
        // Update doctor
        await updateDoc(doc(db, 'users', editingDoctor.id), {
          name: formData.name,
          specialty: formData.specialty
        });
        toast.success('Doctor updated successfully');
      } else {
        // Create new doctor
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          role: 'doctor',
          createdAt: new Date().toISOString()
        });
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
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { deleteUser } = await import('firebase/auth');
      const { db, auth } = await import('@/lib/firebase');
      
      await deleteDoc(doc(db, 'users', doctorId));
      try {
        await deleteUser(auth.currentUser!);
      } catch (e) {
        // User might already be deleted from auth
      }
      
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-500">Manage doctor accounts and specialties</p>
        </div>
        <button
          onClick={() => {
            setEditingDoctor(null);
            setFormData({ name: '', email: '', password: '', specialty: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      {filteredDoctors.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Specialty</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0077B6]/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-[#0077B6]" />
                      </div>
                      <span className="font-medium text-gray-900">Dr. {doctor.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{doctor.email}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {doctor.specialty || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(doctor)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
          action={{
            label: 'Add Doctor',
            onClick: () => setIsModalOpen(true)
          }}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDoctor(null);
        }}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Enter doctor's name"
              required
            />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="Enter doctor's email"
              required
              disabled={!!editingDoctor}
            />
          </div>
          {!editingDoctor && (
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Enter password"
                required={!editingDoctor}
              />
            </div>
          )}
          <div>
            <label className="input-label">Specialty</label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="input"
            >
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
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDoctor ? 'Update' : 'Add'} Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
