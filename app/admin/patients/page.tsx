"use client";

import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Heart, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const handleDelete = async (patientId: string) => {
    const result = await Swal.fire({
      title: 'Delete patient? ',
      text: 'Are you sure you want to delete this patient?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
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

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || p.contact || '')?.toString().includes(searchTerm)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Patients Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage all registered patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search patients by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all"
        />
      </div>

      {/* Table */}
      {filteredPatients.length > 0 ? (
        <div className="table-wrap bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Age</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden sm:table-cell">Gender</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden md:table-cell">Contact</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden lg:table-cell">Blood Group</th>
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${patient.gender === 'male' ? 'bg-primary-50 text-primary-dark' : ''}
                      ${patient.gender === 'female' ? 'bg-pink-50 text-pink-800' : ''}
                      ${patient.gender === 'other' ? 'bg-slate-100 text-slate-700' : ''}
                    `}>
                      {patient.gender}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden md:table-cell">{patient.contact}</td>
                  <td className="py-3 px-3 sm:px-4 hidden lg:table-cell">
                    <span className="px-2 py-0.5 bg-red-50 text-red-800 rounded-full text-xs font-medium">
                      {patient.bloodGroup || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setSelectedPatient(patient); setIsViewModalOpen(true); }}
                        className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-primary"
                        aria-label="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        aria-label="Delete"
                      >
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
          icon={Heart}
          title="No patients found"
          description="No patients have been registered yet"
        />
      )}

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        size="md"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">{selectedPatient.name}</h3>
                <p className="text-slate-500 text-xs">ID: {selectedPatient.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Age</p>
                <p className="font-medium text-slate-900">{selectedPatient.age} years</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Gender</p>
                <p className="font-medium text-slate-900 capitalize">{selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Contact</p>
                <p className="font-medium text-slate-900">{selectedPatient.contact}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Blood Group</p>
                <p className="font-medium text-slate-900">{selectedPatient.bloodGroup || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-xs">Address</p>
                <p className="font-medium text-slate-900">{selectedPatient.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
