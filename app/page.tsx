"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Stethoscope, Calendar, FileText, Users, ArrowRight, Shield, Zap, CheckCircle, Clock, Star } from 'lucide-react';
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
      title: 'Smart Appointments',
      description: 'Book, manage, and reschedule appointments with ease. Get reminders and notifications automatically.',
      color: 'violet',
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Access prescriptions anytime, anywhere. Share with pharmacies and keep your records organized.',
      color: 'indigo',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and HIPAA compliant. We prioritize your privacy.',
      color: 'teal',
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals. View credentials and specialties.',
      color: 'emerald',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    violet: { bg: 'bg-violet-50', icon: 'bg-violet-600', text: 'text-violet-700' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-700' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-600', text: 'text-teal-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-700' },
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-slate-900">MediCare</h1>
              <p className="text-xs text-slate-500">Healthcare Management</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/login" 
              className="px-4 sm:px-5 py-2 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 sm:px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 sm:top-10 lg:top-20 right-0 sm:right-10 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-violet-100/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 sm:-bottom-10 left-0 sm:left-10 lg:left-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-indigo-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' } as any} />
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-violet-50/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' } as any} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Badge with Glassmorphism */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 backdrop-blur-sm border border-violet-200/50 rounded-full mb-4 sm:mb-6 w-fit hover:border-violet-300 transition-all">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-violet-600 animate-bounce" />
                <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">Welcome to MediCare</span>
              </div>
            </div>

            {/* Main Heading with Enhanced Gradient */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-3 sm:mb-5 leading-tight tracking-tight">
              Your Health,<br className="hidden xs:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient">Our Priority</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl font-medium">
              Manage your healthcare efficiently. Book appointments, access prescriptions, and connect with expert doctors all in one place.
            </p>

            {/* CTA Buttons with Enhanced Styling */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 mb-10 sm:mb-12 lg:mb-14">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-slate-300 hover:border-violet-400 text-slate-700 hover:text-slate-900 font-semibold rounded-lg sm:rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                Learn More
              </button>
            </div>

            {/* Trust Signals/Badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8 lg:pb-10 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-emerald-200 hover:shadow-md transition-all">
                <CheckCircle className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-emerald-600" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <Clock className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-600" />
                <span className="font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 bg-amber-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-amber-200 hover:shadow-md transition-all">
                <Star className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-amber-600" />
                <span className="font-medium">4.9/5 Rating</span>
              </div>
            </div>

            {/* Stats Section with Enhanced Interactive Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
              {[
                { stat: '10K+', label: 'Active Users', icon: Users, color: 'from-violet-500 to-purple-500' },
                { stat: '500+', label: 'Doctors', icon: CheckCircle, color: 'from-indigo-500 to-blue-500' },
                { stat: '99%', label: 'Satisfaction', icon: Star, color: 'from-emerald-500 to-teal-500' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-white/60 backdrop-blur-md border border-white/80 rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 lg:p-6 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-default"
                  >
                    <div className="flex items-center justify-between mb-1.5 xs:mb-2 sm:mb-3">
                      <div className={`w-9 xs:w-10 sm:w-12 h-9 xs:h-10 sm:h-12 rounded-lg bg-gradient-to-br ${item.color} p-1.5 xs:p-2 sm:p-2.5 text-white group-hover:scale-110 transition-transform flex items-center justify-center`}>
                        <Icon className="w-5 xs:w-5 sm:w-6 h-5 xs:h-5 sm:h-6" />
                      </div>
                    </div>
                    <p className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-0.5 sm:mb-1 leading-tight">
                      {item.stat}
                    </p>
                    <p className="text-xs xs:text-xs sm:text-sm text-slate-600 font-medium group-hover:text-slate-700 transition-colors">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive healthcare management designed for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorMap[feature.color];

              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-7 sm:p-9 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: '01', title: 'Create Account', description: 'Sign up in minutes with your email' },
              { number: '02', title: 'Complete Profile', description: 'Add your medical information' },
              { number: '03', title: 'Book Appointment', description: 'Schedule with your preferred doctor' },
              { number: '04', title: 'Get Care', description: 'Receive healthcare services online' },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 -right-3 w-6 h-0.5 bg-gradient-to-r from-violet-400 to-transparent" />
                )}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-violet-200 transition-all">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-violet-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust MediCare for their healthcare management.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-violet-600 font-semibold rounded-xl hover:shadow-xl transition-all group"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">MediCare</span>
              </div>
              <p className="text-sm text-slate-400">Modern healthcare management system.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@medicare.com" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm">
            <p>© 2024 MediCare. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
