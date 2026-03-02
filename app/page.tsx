"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Stethoscope, Calendar, FileText, Users, ArrowRight, Zap, CheckCircle, Clock, Star } from "lucide-react";

interface RootState {
  authStates: {
    currentUser: any;
    isAuthenticated: boolean;
    authChecked?: boolean;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { currentUser, isAuthenticated, authChecked } = useSelector((state: RootState) => (state as any).authStates || {});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && authChecked && isAuthenticated && currentUser) {
      const redirectPaths: Record<string, string> = {
        admin: "/admin/dashboard",
        doctor: "/doctor/dashboard",
        receptionist: "/receptionist/dashboard",
        patient: "/patient/dashboard",
      };
      router.push(redirectPaths[currentUser.role] || "/");
    }
  }, [mounted, authChecked, isAuthenticated, currentUser, router]);

  const features = [
    {
      icon: Calendar,
      title: "Smart Appointments",
      description:
        "Book, manage, and reschedule appointments with ease. Get reminders and notifications automatically.",
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Access prescriptions anytime, anywhere. Share with pharmacies and keep your records organized.",
    },
    {
      icon: Zap,
      title: "Secure & Private",
      description: "Your health data is encrypted and HIPAA compliant.",
    },
    {
      icon: Users,
      title: "Expert Doctors",
      description: "Connect with qualified healthcare professionals. View credentials and specialties.",
    },
  ];

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-slate-900">MediCare</h1>
              <p className="text-xs text-slate-500">Healthcare Management</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 text-sm">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg text-sm">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <style>{`@keyframes gradient-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}.animate-gradient{background-size:200% 200%;animation:gradient-shift 8s ease infinite}`}</style>

      <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 sm:top-10 lg:top-20 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-violet-100/40 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 rounded-full mb-4">
              <span className="text-xs font-semibold text-violet-700">Welcome to MediCare</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
              Your Health,
              <br className="hidden sm:block" />
              <span className="text-violet-600">Our Priority</span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Manage your healthcare efficiently. Book appointments, access prescriptions, and connect with expert doctors all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/signup" className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold shadow-xl">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 border rounded-lg text-sm hover:bg-slate-50">
                Learn More
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
              <div className="text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> HIPAA Compliant</div>
              <div className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> 24/7 Support</div>
              <div className="text-sm font-medium flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> 4.9/5 Rating</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center">
                <div className="text-2xl font-extrabold text-violet-600">10K+</div>
                <div className="text-sm text-slate-500 mt-1">Active Users</div>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center">
                <div className="text-2xl font-extrabold text-violet-600">500+</div>
                <div className="text-sm text-slate-500 mt-1">Doctors</div>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center">
                <div className="text-2xl font-extrabold text-violet-600">99%</div>
                <div className="text-sm text-slate-500 mt-1">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-violet-50 rounded-lg">
                    <f.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-slate-600 mt-1">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">MediCare</div>
                  <div className="text-xs text-slate-400">Your Health, Our Priority</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">Manage appointments, prescriptions, and patient records securely.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Quick Links</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li><Link href="/signup">Get Started</Link></li>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/">Features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <div className="text-sm text-slate-400">support@medicare.example</div>
              <div className="text-sm text-slate-400 mt-3">© 2024 MediCare. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
