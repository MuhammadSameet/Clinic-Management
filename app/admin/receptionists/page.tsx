"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import Swal from 'sweetalert2';
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
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => { fetchReceptionists(); }, []);

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
        await updateDoc(doc(db, 'users', editingReceptionist.id), { name: formData.name });
        toast.success('Receptionist updated successfully');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const uid = userCredential.user.uid;
        const createdBy = auth.currentUser?.uid || uid;
        const userDoc = {
          name: formData.name,
          email: formData.email,
          role: 'receptionist',
          createdAt: new Date().toISOString(),
          createdBy,
        };
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', uid), userDoc);
        await setDoc(doc(db, 'receptionists', uid), { ...userDoc, createdBy });
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
    const result = await Swal.fire({
      title: 'Delete receptionist? ',
      text: 'Are you sure you want to delete this receptionist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Receptionists Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage receptionist accounts</p>
        </div>
        <button
          onClick={() => { setEditingReceptionist(null); setFormData({ name: '', email: '', password: '' }); setIsModalOpen(true); }}
          className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Add Receptionist
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Search receptionists by name or email..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all" 
        />
      </div>

      {filteredReceptionists.length > 0 ? (
        <div className="table-wrap bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-slate-600 hidden sm:table-cell">Joined</th>
                <th className="text-right py-3 px-3 sm:px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceptionists.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden md:table-cell">{r.email}</td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 hidden sm:table-cell">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => { setEditingReceptionist(r); setFormData({ name: r.name, email: r.email, password: '' }); setIsModalOpen(true); }} className="p-2 hover:bg-primary-50 rounded-lg text-primary" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" aria-label="Delete">
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
        <EmptyState icon={Users} title="No receptionists found" description="Add your first receptionist to get started" action={{ label: 'Add Receptionist', onClick: () => setIsModalOpen(true) }} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingReceptionist(null); }} title={editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Name" required />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="email@example.com" required disabled={!!editingReceptionist} />
          </div>
          {!editingReceptionist && (
            <div>
              <label className="input-label">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="••••••••" required />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
            <button type="submit" className="btn btn-primary text-sm py-2 px-4">{editingReceptionist ? 'Update' : 'Add'} Receptionist</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
