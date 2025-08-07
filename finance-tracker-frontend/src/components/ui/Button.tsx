import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger' | 'info' | 'gradient' | 'minimal' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    fullWidth = false,
    rounded = false,
    shadow = 'md',
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95 relative overflow-hidden';
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm border border-primary-500/20 transition-all duration-200',
      secondary: 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-500 text-gray-900 dark:text-gray-100 hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:via-gray-500 dark:hover:to-gray-400 hover:scale-[1.02] active:scale-[0.98] transform shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-300/30 dark:border-gray-600/30 transition-all duration-200',
      outline: 'border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50/90 dark:hover:bg-gray-700/90 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-[1.02] active:scale-[0.98] transform shadow-sm hover:shadow-md transition-all duration-200',
      ghost: 'text-gray-700 dark:text-gray-300 hover:bg-primary-50/80 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-[1.02] active:scale-[0.98] transform backdrop-blur-sm transition-all duration-200',
      success: 'bg-gradient-to-r from-success-600 via-success-700 to-success-800 text-white hover:from-success-700 hover:via-success-800 hover:to-success-900 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm border border-success-500/20 transition-all duration-200',
      warning: 'bg-gradient-to-r from-warning-600 via-warning-700 to-warning-800 text-white hover:from-warning-700 hover:via-warning-800 hover:to-warning-900 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm border border-warning-500/20 transition-all duration-200',
      danger: 'bg-gradient-to-r from-danger-600 via-danger-700 to-danger-800 text-white hover:from-danger-700 hover:via-danger-800 hover:to-danger-900 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm border border-danger-500/20 transition-all duration-200',
      info: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm border border-blue-500/20 transition-all duration-200',
      gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 hover:scale-[1.02] active:scale-[0.98] transform shadow-lg hover:shadow-xl backdrop-blur-sm relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity transition-all duration-200',
      minimal: 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-200 dark:hover:border-primary-700 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
      link: 'bg-transparent text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-2 decoration-2 decoration-primary-400 dark:decoration-primary-500 font-semibold transition-all duration-200',
    };

    const sizes = {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
    };

    const roundedClasses = rounded ? 'rounded-full' : 'rounded-2xl';
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm hover:shadow-md',
      md: 'shadow-md hover:shadow-lg',
      lg: 'shadow-lg hover:shadow-xl',
      xl: 'shadow-xl hover:shadow-2xl',
    };

    return (
      <button
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          roundedClasses,
          shadowClasses[shadow],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Yükleniyor...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

// Memoize the Button component to prevent unnecessary re-renders
const Button = React.memo(ButtonComponent);

export { Button };