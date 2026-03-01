"use client";

import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Heart, Eye } from 'lucide-react';
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
          <p className="text-gray-500">View and manage all registered patients</p>
        </div>
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
                      ${patient.gender === 'other' ? 'bg-gray-100 text-gray-800' : ''}
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
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
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
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-500">Patient ID: {selectedPatient.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{selectedPatient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{selectedPatient.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{selectedPatient.bloodGroup || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedPatient.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
