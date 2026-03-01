"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface RootState {
  authStates: {
    currentUser: any;
  };
}

export default function PatientPrescriptionsPage() {
  const { currentUser } = useSelector((state: RootState) => state.authStates);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Find patient by email
      const patientsQuery = query(
        collection(db, 'patients'),
        where('email', '==', currentUser?.email)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      
      if (!patientsSnapshot.empty) {
        const patientId = patientsSnapshot.docs[0].id;
        
        // Fetch prescriptions for this patient
        const q = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setPrescriptions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (prescription: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 119, 182);
    doc.text('MEDICARE CLINIC', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Prescription Slip', 105, 28, { align: 'center' });
    
    // Divider
    doc.line(20, 32, 190, 32);
    
    // Patient Info
    doc.setFontSize(10);
    doc.text(`Patient: ${prescription.patientName}`, 20, 42);
    doc.text(`Date: ${prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}`, 140, 42);
    doc.text(`Doctor: Dr. ${prescription.doctorName}`, 20, 50);
    if (prescription.patientAge) {
      doc.text(`Age: ${prescription.patientAge} years`, 140, 50);
    }
    
    // Divider
    doc.line(20, 55, 190, 55);
    
    // Diagnosis
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSIS:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(prescription.diagnosis || 'N/A', 60, 65);
    
    if (prescription.symptoms) {
      doc.setFont('helvetica', 'bold');
      doc.text('SYMPTOMS:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.symptoms, 60, 75);
    }
    
    // Risk Level
    if (prescription.riskLevel) {
      const riskColors: Record<string, number[]> = {
        low: [34, 197, 94],
        medium: [245, 158, 11],
        high: [239, 68, 68]
      };
      const color = riskColors[prescription.riskLevel] || [0, 0, 0];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Risk Level: ${prescription.riskLevel.toUpperCase()}`, 20, 85);
      doc.setTextColor(0, 0, 0);
    }
    
    // Medicines
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICINES:', 20, 100);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 110;
    (prescription.medicines || []).forEach((med: any, index: number) => {
      doc.text(
        `${index + 1}. ${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}`,
        25, yPos
      );
      yPos += 8;
    });
    
    // Instructions
    if (prescription.instructions) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUCTIONS:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.instructions, 20, yPos + 8, { maxWidth: 170 });
    }
    
    // Notes
    if (prescription.notes) {
      yPos += 25;
      doc.setFont('helvetica', 'bold');
      doc.text('NOTES:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(prescription.notes, 20, yPos + 8, { maxWidth: 170 });
    }
    
    // Footer
    doc.line(20, 270, 190, 270);
    doc.text('Authorized Signature: _______________________', 20, 278);
    
    // Save
    doc.save(`prescription_${prescription.patientName}_${prescription.createdAt ? new Date(prescription.createdAt).toISOString().split('T')[0] : 'date'}.pdf`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500">View and download your prescriptions</p>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length > 0 ? (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Dr. {prescription.doctorName}</h3>
                    <p className="text-gray-500 text-sm mt-1">{prescription.diagnosis}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadPDF(prescription)}
                  className="btn btn-primary flex items-center gap-2 self-start"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
              
              {/* Medicines Preview */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Medicines:</h4>
                <div className="flex flex-wrap gap-2">
                  {(prescription.medicines || []).map((med: any, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      {med.name} - {med.dosage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No prescriptions found"
          description="You don't have any prescriptions yet"
        />
      )}
    </div>
  );
}
