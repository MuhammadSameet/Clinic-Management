"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const q = query(collection(db, 'users'), where('role', '==', 'receptionist'));
      const snapshot = await getDocs(q);
      setReceptionists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error('Failed to fetch receptionists');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('@/lib/firebase');
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      
      if (editingReceptionist) {
        await updateDoc(doc(db, 'users', editingReceptionist.id), {
          name: formData.name
        });
        toast.success('Receptionist updated successfully');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          role: 'receptionist',
          createdAt: new Date().toISOString()
        });
        toast.success('Receptionist added successfully');
      }
      
      setIsModalOpen(false);
      setEditingReceptionist(null);
      setFormData({ name: '', email: '', password: '' });
      fetchReceptionists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save receptionist');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receptionist?')) return;
    
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'users', id));
      toast.success('Receptionist deleted successfully');
      fetchReceptionists();
    } catch (error) {
      toast.error('Failed to delete receptionist');
    }
  };

  const filteredReceptionists = receptionists.filter(r =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionists Management</h1>
          <p className="text-gray-500">Manage receptionist accounts</p>
        </div>
        <button
          onClick={() => {
            setEditingReceptionist(null);
            setFormData({ name: '', email: '', password: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Receptionist
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search receptionists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Table */}
      {filteredReceptionists.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceptionists.map((receptionist) => (
                <tr key={receptionist.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{receptionist.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{receptionist.email}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {receptionist.createdAt ? new Date(receptionist.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingReceptionist(receptionist);
                          setFormData({ name: receptionist.name, email: receptionist.email, password: '' });
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(receptionist.id)}
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
          icon={Users}
          title="No receptionists found"
          description="Add your first receptionist to get started"
          action={{
            label: 'Add Receptionist',
            onClick: () => setIsModalOpen(true)
          }}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReceptionist(null);
        }}
        title={editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
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
              placeholder="Enter receptionist's name"
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
              placeholder="Enter receptionist's email"
              required
              disabled={!!editingReceptionist}
            />
          </div>
          {!editingReceptionist && (
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Enter password"
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingReceptionist ? 'Update' : 'Add'} Receptionist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
