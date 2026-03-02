# 🏥 MediCare - Medical Clinic Management System

**Deploy link :** https://clinic-management-mocha.vercel.app/

A comprehensive Medical Clinic Management System built with Next.js 16, TypeScript, Redux Toolkit, Tailwind CSS v4, and Firebase.

## ✨ Features

### 👨‍💼 Admin Dashboard
- View clinic statistics (patients, doctors, appointments, revenue)
- Analytics tables (appointments per doctor, status breakdown)
- Manage doctors and receptionists (add/delete)
- View all patients and appointments
- Update appointment status

### 👩‍⚕️ Doctor Dashboard
- View today's schedule
- Filter appointments (Today/This Week/All)
- Write prescriptions with dynamic medicine fields
- Save diagnosis, symptoms, and risk levels

### 🧑‍💻 Receptionist Dashboard
- Add/Edit/Delete patients
- Search patients
- Book appointments
- Update appointment status (confirm/complete/cancel)

### 🏥 Patient Dashboard
- View profile and appointment history
- View prescriptions
- **Download prescriptions as PDF**
- View complete medical timeline/history

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

```
bash
# Install dependencies
npm install

# Install additional packages
npm install firebase jspdf @types/jspdf react-hot-toast date-fns lucide-react
```

## 🔥 Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Create `.env.local` file:

```
env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📁 Firestore Collections

Create these collections in Firestore:

### users
```
json
{
  "name": "Doctor Name",
  "email": "doctor@example.com",
  "role": "doctor",
  "specialty": "Cardiology",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### patients
```
json
{
  "name": "Patient Name",
  "age": 30,
  "gender": "male",
  "contact": "03001234567",
  "address": "123 Main St",
  "bloodGroup": "A+",
  "createdBy": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### appointments
```
json
{
  "patientId": "patient_id",
  "patientName": "Patient Name",
  "doctorId": "doctor_id",
  "doctorName": "Dr. Doctor Name",
  "date": "2024-01-15",
  "time": "10:00",
  "reason": "Checkup",
  "status": "pending",
  "bookedBy": "receptionist_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### prescriptions
```
json
{
  "patientId": "patient_id",
  "patientName": "Patient Name",
  "patientAge": 30,
  "doctorId": "doctor_id",
  "doctorName": "Dr. Doctor Name",
  "appointmentId": "appointment_id",
  "diagnosis": "Common Cold",
  "symptoms": "Cough, Fever",
  "riskLevel": "low",
  "medicines": [
    { "name": "Panadol", "dosage": "500mg", "frequency": "3x daily", "duration": "5 days" }
  ],
  "instructions": "Rest and drink fluids",
  "notes": "",
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

## 🚀 Running the Application

```
bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔐 User Roles

- **admin**: Full access to all features
- **doctor**: Can view schedule and write prescriptions
- **receptionist**: Can manage patients and appointments
- **patient**: Can view own records and prescriptions

## 📱 Pages Structure

```
app/
├── page.tsx                    # Login Page
├── admin/
│   ├── layout.tsx              # Admin layout with sidebar
│   ├── dashboard/             # Stats & analytics
│   ├── doctors/               # Manage doctors
│   ├── receptionists/         # Manage receptionists
│   ├── patients/              # View all patients
│   └── appointments/          # Manage appointments
├── doctor/
│   ├── layout.tsx             # Doctor layout with sidebar
│   ├── dashboard/             # Doctor stats
│   ├── schedule/              # View appointments
│   └── prescription/          # Write prescriptions
├── receptionist/
│   ├── layout.tsx             # Receptionist layout
│   ├── dashboard/             # Receptionist stats
│   ├── patients/              # Manage patients
│   └── appointments/          # Book appointments
└── patient/
    ├── layout.tsx             # Patient layout
    ├── dashboard/             # Patient profile
    ├── appointments/          # View appointments
    ├── prescriptions/         # View & download PDF
    └── history/               # Medical timeline
```

## 🎨 UI Components

- **Sidebar**: Role-based navigation
- **Topbar**: User info and logout
- **StatCard**: Statistics display
- **Modal**: Forms and dialogs
- **LoadingSpinner**: Loading states
- **EmptyState**: No data states
- **StatusBadge**: Status indicators

## 📄 License

MIT License
