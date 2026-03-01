"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function DoctorPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    riskLevel: 'low',
    instructions: '',
    notes: ''
  });
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '' }
  ]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    } else {
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointmentData = async () => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const aptDoc = await getDoc(doc(db, 'appointments', appointmentId!));
      if (aptDoc.exists()) {
        const aptData: any = { id: aptDoc.id, ...aptDoc.data() };
        setAppointment(aptData);

        // Fetch patient data
        if (aptData.patientId) {
          const patientDoc = await getDoc(doc(db, 'patients', aptData.patientId));
          if (patientDoc.exists()) {
            setPatient({ id: patientDoc.id, ...patientDoc.data() });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const handleMedicineChange = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.diagnosis) {
      toast.error('Please enter a diagnosis');
      return;
    }

    const validMedicines = medicines.filter(m => m.name && m.dosage);
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    try {
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      // Save prescription
      await addDoc(collection(db, 'prescriptions'), {
        patientId: appointment?.patientId || patient?.id,
        patientName: appointment?.patientName || patient?.name,
        patientAge: patient?.age,
        doctorId: currentUser?.id || currentUser?.uid,
        doctorName: currentUser?.name,
        appointmentId: appointmentId,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        riskLevel: formData.riskLevel,
        medicines: validMedicines,
        instructions: formData.instructions,
        notes: formData.notes,
        createdAt: new Date().toISOString()
      });

      // Update appointment status
      if (appointmentId) {
        await updateDoc(doc(db, 'appointments', appointmentId), {
          status: 'completed'
        });
      }

      toast.success('Prescription saved successfully');
      router.push('/doctor/schedule');
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Write Prescription</h1>
        <p className="text-slate-500 text-sm mt-0.5">Create a new prescription for your patient</p>
      </div>

      {(appointment || patient) && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Patient Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Patient Name</p>
              <p className="font-medium text-slate-900">{appointment?.patientName || patient?.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Age</p>
              <p className="font-medium text-slate-900">{patient?.age ?? 'N/A'} years</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Appointment Date</p>
              <p className="font-medium text-slate-900">{appointment?.date ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Diagnosis</h2>
          
          <div>
            <label className="input-label">Diagnosis *</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="input"
              rows={3}
              placeholder="Enter diagnosis..."
              required
            />
          </div>

          <div>
            <label className="input-label">Symptoms</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="input"
              rows={2}
              placeholder="Enter symptoms..."
            />
          </div>

          <div>
            <label className="input-label">Risk Level</label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
              className="input"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold text-slate-900">Medicines</h2>
            <button type="button" onClick={handleAddMedicine} className="btn btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          {medicines.map((medicine, index) => (
            <div key={medicine.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <label className="input-label text-xs">Medicine Name</label>
                <input
                  type="text"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(medicine.id, 'name', e.target.value)}
                  className="input"
                  placeholder="Medicine name"
                />
              </div>
              <div>
                <label className="input-label text-xs">Dosage</label>
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                  className="input"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="input-label text-xs">Frequency</label>
                <input
                  type="text"
                  value={medicine.frequency}
                  onChange={(e) => handleMedicineChange(medicine.id, 'frequency', e.target.value)}
                  className="input"
                  placeholder="e.g., 3x daily"
                />
              </div>
              <div>
                <label className="input-label text-xs">Duration</label>
                <input
                  type="text"
                  value={medicine.duration}
                  onChange={(e) => handleMedicineChange(medicine.id, 'duration', e.target.value)}
                  className="input"
                  placeholder="e.g., 5 days"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(medicine.id)}
                  className="btn btn-secondary text-sm py-2 w-full flex items-center justify-center gap-1.5 text-red-600 hover:bg-red-50"
                  disabled={medicines.length === 1}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Additional Information</h2>
          
          <div>
            <label className="input-label">Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input"
              rows={3}
              placeholder="Enter instructions for the patient..."
            />
          </div>

          <div>
            <label className="input-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 flex-wrap">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary text-sm py-2 px-4">Cancel</button>
          <button type="submit" className="btn btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Prescription
          </button>
        </div>
      </form>
    </div>
  );
}
