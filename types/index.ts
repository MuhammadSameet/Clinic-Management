export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  specialty?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  address: string;
  bloodGroup: string;
  createdBy: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookedBy: string;
  createdAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  diagnosis: string;
  symptoms: string;
  medicines: Medicine[];
  instructions: string;
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface DiagnosisLog {
  id: string;
  patientId: string;
  appointmentId: string;
  diagnosis: string;
  symptoms: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  usersList: User[];
}

export interface PatientsState {
  list: Patient[];
  loading: boolean;
  error: string | null;
}

export interface AppointmentsState {
  list: Appointment[];
  loading: boolean;
  error: string | null;
}

export interface PrescriptionsState {
  list: Prescription[];
  loading: boolean;
  error: string | null;
}
