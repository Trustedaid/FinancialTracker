/**
 * Enhanced Registration Page for Financial Tracker Application
 * 
 * Features:
 * - Modern glass morphism design with gradient backgrounds (matching login page)
 * - Responsive layout optimized for mobile and desktop
 * - Real-time form validation with user-friendly error messages
 * - Smooth animations and micro-interactions
 * - Loading states with custom spinner animations
 * - Accessibility compliance (ARIA labels, keyboard navigation)
 * - Professional financial application aesthetic
 * - Brand-consistent color scheme and typography
 * - Background decorative elements for visual appeal
 * - SEO-friendly semantic HTML structure
 * 
 * Technical Implementation:
 * - React with TypeScript for type safety
 * - React Hook Form with Yup validation
 * - Custom CSS with modern features (backdrop-filter, CSS Grid)
 * - Lucide React icons for consistent iconography
 * - React Router for navigation management
 * - Context API for authentication state management
 * - Visual consistency with login page design
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/forms';
import { Navbar } from '../../components/layout';
import { useAuth, useLanguage } from '../../contexts';
import { TrendingUp, Shield, BarChart3 } from 'lucide-react';
import type { RegisterRequest } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRegister = async (userData: RegisterRequest) => {
    await register(userData);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="login-background">
      {/* Global Navigation Bar */}
      <Navbar className="transparent" />
      
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <TrendingUp />
            </div>
            <h1 className="login-title">{t('auth.app_title')}</h1>
            <p className="login-subtitle">
              {t('auth.register_subtitle')}
            </p>
          </div>

          {/* Registration Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          
          {/* Sign In Link */}
          <div className="signup-link-container">
            <p className="text-sm text-gray-600">
              {t('auth.already_have_account')}{' '}
              <Link to="/login" className="signup-link">
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3">
                <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs text-gray-600">{t('auth.secure')}</p>
              </div>
              <div className="p-3">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-xs text-gray-600">{t('auth.analytics')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-purple-300/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-blue-300/15 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};