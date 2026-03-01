"use client";

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Stethoscope, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface RootState {
  authStates: {
    loading: boolean;
    error: string | null;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth, db } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');

      const toastId = toast.loading('Signing in...');

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        toast.error('User not found in database', { id: toastId });
        return;
      }

      const userData: any = { id: userDoc.id, ...userDoc.data() };
      
      dispatch({ type: 'AUTH_SUCCESS', payload: userData });
      dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: userData, isAuthenticated: true } });

      toast.success('Welcome back!', { id: toastId });

      // Redirect based on role
      setTimeout(() => {
        const redirectPaths: Record<string, string> = {
          admin: '/admin/dashboard',
          doctor: '/doctor/dashboard',
          receptionist: '/receptionist/dashboard',
          patient: '/patient/dashboard',
        };
        router.push(redirectPaths[userData.role] || '/');
      }, 500);

    } catch (err: any) {
      let errorMessage = 'Failed to sign in';
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '16px 20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: { 
            style: { background: '#16a34a' },
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: { 
            style: { background: '#dc2626' },
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
          loading: {
            style: { background: '#0284c7' },
          },
        }}
      />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
              <Stethoscope className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">MediCare</h1>
              <p className="text-lg text-blue-100">Clinic Management System</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-5 max-w-md w-full mt-12">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Expert Healthcare</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Connect with qualified doctors and healthcare professionals</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Scheduling</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Book and manage appointments with ease</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Digital Prescriptions</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Access and download prescriptions anytime</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md">
            <p className="text-blue-100 italic text-sm leading-relaxed">
              &quot;MediCare has transformed how we manage our clinic. The system is intuitive and efficient.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Dr. Sarah Ahmed</p>
                <p className="text-blue-200 text-xs">Chief Medical Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
              <p className="text-sm text-gray-500">Clinic Management</p>
            </div>
          </div>

          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to access your account</p>
            </div>

            {/* Demo Credentials */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium mb-2">📝 Demo Credentials:</p>
              <div className="space-y-1 text-xs text-blue-600">
                <p><strong>Admin:</strong> admin@medicare.com / admin123</p>
                <p><strong>Doctor:</strong> doctor@medicare.com / doctor123</p>
                <p><strong>Patient:</strong> patient@medicare.com / patient123</p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 ${
                      errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1.5 ml-1">{errors.password}</p>}
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            © 2024 MediCare. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
