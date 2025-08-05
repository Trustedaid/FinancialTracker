/**
 * Theme Toggle Component for Financial Tracker Application
 * 
 * Features:
 * - Animated sun/moon icons with smooth transitions
 * - Accessible design with proper ARIA labels
 * - Glass morphism styling consistent with app design
 * - Keyboard navigation support
 * - Loading state handling
 * - Hover effects and visual feedback
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, toggleTheme, isLoading } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  const handleToggle = () => {
    if (!isLoading) {
      toggleTheme();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  if (isLoading) {
    return (
      <div className={`theme-toggle-skeleton ${sizeClasses[size]} ${className}`}>
        <div className="animate-spin">
          <div className="theme-toggle-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-toggle-container ${showLabel ? 'with-label' : ''} ${className}`}>
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`theme-toggle ${sizeClasses[size]} ${theme}`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-pressed={theme === 'dark'}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        type="button"
      >
        <div className="theme-toggle-track">
          <div className={`theme-toggle-thumb ${theme}`}>
            <div className="theme-toggle-icon-container">
              {theme === 'light' ? (
                <Sun 
                  size={iconSizes[size]} 
                  className="theme-toggle-icon sun-icon"
                />
              ) : (
                <Moon 
                  size={iconSizes[size]} 
                  className="theme-toggle-icon moon-icon"
                />
              )}
            </div>
          </div>
        </div>
      </button>
      
      {showLabel && (
        <span className="theme-toggle-label">
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;