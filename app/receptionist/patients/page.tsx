"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

interface RootState {
  authStates: { currentUser: any };
}

export default function ReceptionistPatientsPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'male', contact: '', address: '', bloodGroup: ''
  });

  useEffect(() => { fetchPatients(); }, []);

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
        name: formData.name, age: parseInt(formData.age), gender: formData.gender,
        contact: formData.contact, address: formData.address, bloodGroup: formData.bloodGroup,
        createdBy: currentUser?.id || currentUser?.uid, createdAt: new Date().toISOString()
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
      name: patient.name, age: patient.age?.toString() ?? '', gender: patient.gender,
      contact: patient.contact ?? patient.phone ?? '', address: patient.address ?? '', bloodGroup: patient.bloodGroup ?? ''
    });
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contact || p.phone || '')?.toString().includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Patients Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage patient records</p>
        </div>
        <button onClick={() => { setEditingPatient(null); setFormData({ name: '', age: '', gender: 'male', contact: '', address: '', bloodGroup: '' }); setIsModalOpen(true); }} className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by name or contact..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-base pl-9 py-2.5 text-sm" />
      </div>

      {filteredPatients.length > 0 ? (
        <div className="table-wrap bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Age</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden sm:table-cell">Gender</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden md:table-cell">Contact</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden lg:table-cell">Blood</th>
                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600">{patient.age} yrs</td>
                  <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
                    <StatusBadge status={patient.gender === 'female' ? 'female' : patient.gender === 'male' ? 'male' : 'other'} />
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden md:table-cell">{patient.contact || patient.phone}</td>
                  <td className="py-3 px-3 sm:px-4 hidden lg:table-cell">
                    <span className="px-2 py-0.5 bg-red-50 text-red-800 rounded-full text-xs font-medium">{patient.bloodGroup || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEditModal(patient)} className="p-2 hover:bg-primary-50 rounded-lg text-primary" aria-label="Edit"><Edit className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleDelete(patient.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Heart} title="No patients found" description="Add your first patient to get started" action={{ label: 'Add Patient', onClick: () => setIsModalOpen(true) }} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPatient(null); }} title={editingPatient ? 'Edit Patient' : 'Add New Patient'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Name" required />
            </div>
            <div>
              <label className="input-label">Age *</label>
              <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="input" placeholder="Age" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Gender *</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Contact *</label>
              <input type="tel" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="input" placeholder="11-digit" required />
            </div>
          </div>
          <div>
            <label className="input-label">Blood Group</label>
            <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="input">
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
          <div>
            <label className="input-label">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" rows={2} placeholder="Address" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" className="btn btn-primary text-sm py-2 px-4">{editingPatient ? 'Update' : 'Add'} Patient</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
