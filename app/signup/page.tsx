"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Stethoscope, User, Phone, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
  };
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.authStates);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'doctor' | 'patient' | 'receptionist'>('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'male',
    specialty: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const redirectPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      const path = redirectPaths[currentUser.role] || '/';
      router.replace(path);
    }
  }, [isAuthenticated, currentUser, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{11}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Enter 11-digit phone (e.g., 03001234567)';
    }
    if (selectedRole === 'patient') {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 150) newErrors.age = 'Valid age required';
    }
    if (selectedRole === 'doctor' && !formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('@/lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      const toastId = toast.loading('Creating account...');
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: selectedRole,
        createdAt: new Date().toISOString(),
      };
      if (selectedRole === 'patient') {
        userData.age = parseInt(formData.age);
        userData.gender = formData.gender;
      } else if (selectedRole === 'doctor') {
        userData.specialty = formData.specialty;
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      if (selectedRole === 'patient') {
        await setDoc(doc(db, 'patients', userCredential.user.uid), {
          ...userData,
          createdBy: userCredential.user.uid,
        });
      } else if (selectedRole === 'doctor') {
        await setDoc(doc(db, 'doctors', userCredential.user.uid), {
          ...userData,
          createdBy: userCredential.user.uid,
        });
      } else if (selectedRole === 'receptionist') {
        await setDoc(doc(db, 'receptionists', userCredential.user.uid), {
          ...userData,
          createdBy: userCredential.user.uid,
        });
      }
      const fullUserData = { id: userCredential.user.uid, ...userData };
      dispatch({ type: 'AUTH_SUCCESS', payload: fullUserData });
      dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: fullUserData, isAuthenticated: true, authChecked: true } });
      toast.success('Account created!', { id: toastId });
      const redirectPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      setTimeout(() => router.replace(redirectPaths[selectedRole]), 100);
    } catch (err: any) {
      let errorMessage = 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already registered';
      else if (err.code === 'auth/weak-password') errorMessage = 'Password too weak';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email';
      else if (err.message) errorMessage = err.message;
      toast.error(errorMessage);
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-3 sm:p-6">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        duration: 4000,
        style: { borderRadius: '10px', fontSize: '14px' },
        success: { style: { background: '#10b981' } },
        error: { style: { background: '#ef4444' } },
        loading: { style: { background: '#7c3aed' } },
      }} />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MediCare</h1>
            <p className="text-slate-500 text-xs">Join our healthcare platform</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 text-xs mt-1">We'll protect your health data</p>
          </div>

          {/* Role Selection - Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Select Role</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'doctor' | 'patient' | 'receptionist')}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs transition-all focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10 appearance-none cursor-pointer"
              >               
                <option value="patient">Patient</option>
                
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className={`w-full pl-11 pr-4 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                    errors.name ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                    errors.email ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03001234567"
                  className={`w-full pl-11 pr-4 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                    errors.phone ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            {selectedRole === 'patient' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    className={`w-full px-3 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                      errors.age ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                  />
                  {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs transition-all focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/10"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {selectedRole === 'doctor' && (
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Specialty</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  placeholder="Cardiology, Pediatrics, etc"
                  className={`w-full px-4 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                    errors.specialty ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                />
                {errors.specialty && <p className="text-xs text-rose-600 mt-1">{errors.specialty}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-10 py-2 rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-xs transition-all ${
                    errors.password ? 'border-rose-500 focus:bg-rose-50' : 'border-slate-200 focus:bg-white focus:border-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500/10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-xs"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">© 2024 MediCare. All rights reserved.</p>
      </div>
    </div>
  );
}
