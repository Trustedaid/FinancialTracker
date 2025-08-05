import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { HomePage } from '../../pages';

/**
 * HomeRoute Component
 * 
 * Smart routing component that:
 * - Shows the landing page (HomePage) for unauthenticated users
 * - Redirects authenticated users directly to the dashboard
 * - Handles loading states gracefully
 */
export const HomeRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-container">
          <div className="loading-spinner-enhanced"></div>
          <p className="loading-text">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the landing page
  return <HomePage />;
};