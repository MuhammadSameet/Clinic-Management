"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, Heart, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function ReceptionistPatientsPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    address: '',
    bloodGroup: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPatients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        contact: formData.contact,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        createdBy: currentUser?.id || currentUser?.uid,
        createdAt: new Date().toISOString()
      };
      
      if (editingPatient) {
        await updateDoc(doc(db, 'patients', editingPatient.id), patientData);
        toast.success('Patient updated successfully');
      } else {
        await addDoc(collection(db, 'patients'), patientData);
        toast.success('Patient added successfully');
      }
      
      setIsModalOpen(false);
      setEditingPatient(null);
      setFormData({ name: '', age: '', gender: 'male', contact: '', address: '', bloodGroup: '' });
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save patient');
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'patients', patientId));
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      toast.error('Failed to delete patient');
    }
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      contact: patient.contact,
      address: patient.address,
      bloodGroup: patient.bloodGroup
    });
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact?.includes(searchTerm)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
          <p className="text-gray-500">Manage patient records</p>
        </div>
        <button
          onClick={() => {
            setEditingPatient(null);
            setFormData({ name: '', age: '', gender: 'male', contact: '', address: '', bloodGroup: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      {filteredPatients.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Age</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Gender</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Blood Group</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{patient.age} years</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${patient.gender === 'male' ? 'bg-blue-100 text-blue-800' : ''}
                      ${patient.gender === 'female' ? 'bg-pink-100 text-pink-800' : ''}
                    `}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{patient.contact}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {patient.bloodGroup || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
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
          icon={Heart}
          title="No patients found"
          description="Add your first patient to get started"
          action={{
            label: 'Add Patient',
            onClick: () => setIsModalOpen(true)
          }}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Patient name"
                required
              />
            </div>
            <div>
              <label className="input-label">Age *</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input"
                placeholder="Age"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Contact *</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="input"
                placeholder="11-digit contact"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="input"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows={2}
              placeholder="Address"
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
              {editingPatient ? 'Update' : 'Add'} Patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
