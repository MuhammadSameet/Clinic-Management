"use client";

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Stethoscope, User, Phone, Calendar, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'doctor' | 'receptionist' | 'patient'>('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'male',
    specialty: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 150) newErrors.age = 'Please enter a valid age';
    }
    if (selectedRole === 'doctor' && !formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: fullUserData, isAuthenticated: true } });
      toast.success('Account created successfully!', { id: toastId });
      const redirectPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      setTimeout(() => {
        router.push(redirectPaths[selectedRole]);
      }, 500);
    } catch (err: any) {
      let errorMessage = 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already registered. Please login instead.';
      else if (err.code === 'auth/weak-password') errorMessage = 'Password must be at least 6 characters';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
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
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        duration: 4000,
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '14px', padding: '16px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
        success: { style: { background: '#16a34a' }, iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: { style: { background: '#dc2626' }, iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        loading: { style: { background: '#059669' } },
      }} />
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
              <Stethoscope className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">MediCare</h1>
              <p className="text-lg text-emerald-100">Your Health, Our Priority</p>
            </div>
          </div>
          <div className="space-y-5 max-w-md w-full mt-12">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <span className="text-4xl">🏥</span>
              <div>
                <h3 className="font-semibold mb-1">Complete Medical Records</h3>
                <p className="text-emerald-100 text-sm">Access your full medical history anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <span className="text-4xl">⚡</span>
              <div>
                <h3 className="font-semibold mb-1">Quick Appointments</h3>
                <p className="text-emerald-100 text-sm">Book visits with doctors in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
              <span className="text-4xl">📱</span>
              <div>
                <h3 className="font-semibold mb-1">Digital Prescriptions</h3>
                <p className="text-emerald-100 text-sm">Download and share prescriptions easily</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center gap-6 text-emerald-100 text-sm">
            <span>🔒 Secure & Private</span>
            <span>✓ Trusted by 1000+</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
              <p className="text-sm text-gray-500">Create Account</p>
            </div>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </Link>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-500">Join MediCare for better healthcare management</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {(['patient', 'doctor', 'receptionist', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all capitalize ${selectedRole === role ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute inset-y-4 left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="Enter your full name" />
                </div>
                {errors.name && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute inset-y-4 left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="Enter your email" />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute inset-y-4 left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="03001234567" />
                </div>
                {errors.phone && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.phone}</p>}
              </div>
              {selectedRole === 'patient' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errors.age ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="Age" />
                    {errors.age && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
              {selectedRole === 'doctor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                  <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errors.specialty ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="e.g., Cardiology, Pediatrics" />
                  {errors.specialty && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.specialty}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute inset-y-4 left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-4 right-4 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute inset-y-4 left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'} rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10`} placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-4 right-4 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.confirmPassword}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="relative my-6">
              <div className="w-full border-t border-gray-200"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">OR</div>
            </div>
            <p className="text-center text-gray-600">Already have an account? <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign In</Link></p>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">© 2024 MediCare. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
