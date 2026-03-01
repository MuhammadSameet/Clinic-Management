"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "@/redux/store/store";
import { Toaster } from "react-hot-toast";
import { checkAuthState } from "@/redux/store/actions/auth-actions/auth-actions";
import './globals.css';

function AppContent({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check auth state on app load
    checkAuthState()(dispatch);
  }, [dispatch]);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: { 
            style: { 
              background: '#16a34a',
              borderRadius: '8px',
            },
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: { 
            style: { 
              background: '#dc2626',
              borderRadius: '8px',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              background: '#0284c7',
              borderRadius: '8px',
            },
          },
        }}
      />
    </>
  );
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title>MediCare - Clinic Management System</title>
        <meta name="description" content="MediCare - Modern Healthcare Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <Provider store={store}>
          <AppContent>{children}</AppContent>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
