"use client";

import React from 'react';
import { X } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string;
}

interface FormModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  fields: FormField[];
  onClose: () => void;
  onSubmit: (formData: Record<string, string>) => void;
  isLoading?: boolean;
  submitText?: string;
  icon?: React.ReactNode;
}

export default function FormModal({
  isOpen,
  title,
  description,
  fields,
  onClose,
  onSubmit,
  isLoading = false,
  submitText = 'Add',
  icon,
}: FormModalProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const initialData: Record<string, string> = {};
    fields.forEach(field => {
      initialData[field.name] = field.value || '';
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 sm:p-8 animate-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <div className="text-2xl">{icon}</div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-2">{description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-slate-900 mb-2">
                {field.label}
                {field.required && <span className="text-rose-500">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                    errors[field.name]
                      ? 'border-rose-500 bg-rose-50 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-violet-500 focus:ring-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-0`}
                >
                  <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all text-sm font-medium resize-none ${
                    errors[field.name]
                      ? 'border-rose-500 bg-rose-50 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-violet-500 focus:ring-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-0`}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                    errors[field.name]
                      ? 'border-rose-500 bg-rose-50 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-violet-500 focus:ring-violet-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-0`}
                />
              )}

              {errors[field.name] && (
                <p className="text-xs text-rose-600 mt-1.5">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
