import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoginRequest } from '../../types/api';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 md:h-32 md:w-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Background decorative elements for larger screens */}
      <div className="hidden lg:block fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 rounded-full opacity-60"></div>
      </div>
      
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 transition-all duration-300 hover:shadow-lg">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-4 sm:mb-6">
              <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl">MH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 font-medium">
              Mana HR - HRMS
            </p>
          </div>
          
          {/* Form Section */}
          <form className="space-y-4 sm:space-y-6 md:space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <Input
                label="Email address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="text-sm sm:text-base"
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="text-sm sm:text-base"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 animate-fade-in">
                <p className="text-xs sm:text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              Sign in
            </Button>

            {/* Demo Credentials - Responsive Grid */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 md:p-6">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2 sm:mb-3 md:mb-4">
                Demo Credentials:
              </h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">Admin</p>
                  <p className="text-blue-700 truncate">admin@gmail.com</p>
                  <p className="text-blue-600 font-mono">superadmin@123</p>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">HR Manager</p>
                  <p className="text-blue-700 truncate">hr@gmail.com</p>
                  <p className="text-blue-600 font-mono">278601@1</p>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">Employee</p>
                  <p className="text-blue-700 truncate">atsarun2786@gmail.com</p>
                  <p className="text-blue-600 font-mono">Arun@123</p>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">Payroll Admin</p>
                  <p className="text-blue-700 truncate">acounts@gmail.com</p>
                  <p className="text-blue-600 font-mono">278601@1</p>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">Recruiter</p>
                  <p className="text-blue-700 truncate">lora@gmail.com</p>
                  <p className="text-blue-600 font-mono">278601@1</p>
                </div>
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                  <p className="font-medium text-blue-900 mb-1">Team Lead</p>
                  <p className="text-blue-700 truncate">lead@gmail.com</p>
                  <p className="text-blue-600 font-mono">278601@1</p>
                </div>
              </div>
              
              {/* Mobile-friendly scroll hint */}
              <div className="lg:hidden mt-3 text-center">
                <p className="text-xs text-blue-600 italic">Scroll horizontally to see all credentials</p>
              </div>
            </div>
          </form>

          {/* Additional Info for larger screens */}
          <div className="hidden lg:block mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Secure login powered by Mana HR - HRMS System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}