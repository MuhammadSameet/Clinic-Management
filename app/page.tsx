"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Stethoscope, Calendar, FileText, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.authStates);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (mounted && isAuthenticated && currentUser) {
      const redirectPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        patient: '/patient/dashboard',
      };
      router.push(redirectPaths[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, router, mounted]);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointments',
      description: 'Book and manage appointments with just a few clicks',
      color: 'blue',
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Access and download prescriptions anytime, anywhere',
      color: 'green',
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals',
      color: 'purple',
    },
    {
      icon: Stethoscope,
      title: 'Medical History',
      description: 'Complete timeline of your health records',
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-100', icon: 'bg-blue-500', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', icon: 'bg-green-500', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', icon: 'bg-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', icon: 'bg-orange-500', text: 'text-orange-600' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediCare</h1>
                <p className="text-xs text-gray-500">Clinic Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <CheckCircle className="w-4 h-4" />
            Trusted by 1000+ Healthcare Providers
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Modern Healthcare
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your clinic operations, manage appointments, and provide better patient care with our comprehensive platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
            >
              Login to Account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-8 h-8 ${colors.icon} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className={`text-lg font-bold ${colors.text} mb-2`}>{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">1000+</p>
              <p className="text-blue-100 text-sm">Active Users</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">50+</p>
              <p className="text-blue-100 text-sm">Expert Doctors</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">10k+</p>
              <p className="text-blue-100 text-sm">Appointments</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">99%</p>
              <p className="text-blue-100 text-sm">Satisfaction</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
          <p className="text-gray-600 mb-12">Get started in three simple steps</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Create Account</h4>
              <p className="text-gray-600 text-sm">Sign up in seconds with your email</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Book Appointment</h4>
              <p className="text-gray-600 text-sm">Choose your doctor and schedule</p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Get Treatment</h4>
              <p className="text-gray-600 text-sm">Visit doctor and get prescription</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">MediCare</p>
                <p className="text-xs text-gray-500">Clinic Management System</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 MediCare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
