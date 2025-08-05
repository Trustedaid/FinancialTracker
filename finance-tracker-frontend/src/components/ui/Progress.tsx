import React from 'react';
import { clsx } from 'clsx';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
  formatValue?: (value: number, max: number) => string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value,
    max = 100,
    variant = 'default',
    size = 'md',
    showLabel = false,
    showPercentage = false,
    animated = true,
    striped = false,
    label,
    formatValue,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
    };

    const variantClasses = {
      default: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
    };

    const getVariantByValue = (percentage: number) => {
      if (percentage >= 100) return 'danger';
      if (percentage >= 80) return 'warning';
      return 'success';
    };

    const autoVariant = variant === 'default' ? getVariantByValue(percentage) : variant;

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {label || 'Progress'}
            </span>
            {showPercentage && (
              <span className="text-sm font-medium text-gray-700">
                {formatValue ? formatValue(value, max) : `${percentage.toFixed(1)}%`}
              </span>
            )}
          </div>
        )}
        
        <div className={clsx(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={clsx(
              'h-full transition-all duration-500 ease-out relative',
              variantClasses[autoVariant],
              striped && 'bg-stripes',
              animated && striped && 'animate-pulse',
              className
            )}
            style={{ width: `${percentage}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
          </div>
        </div>

        {/* Status indicator for over 100% */}
        {percentage > 100 && (
          <div className="flex items-center mt-2 text-danger-600 text-sm">
            <div className="w-2 h-2 bg-danger-500 rounded-full mr-2 animate-pulse" />
            <span className="font-medium">
              Exceeded by {(percentage - 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    className,
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showLabel = false,
    showPercentage = true,
    children,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const variantColors = {
      default: '#3B82F6',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
    };

    const getVariantByValue = (percentage: number) => {
      if (percentage >= 100) return 'danger';
      if (percentage >= 80) return 'warning';
      return 'success';
    };

    const autoVariant = variant === 'default' ? getVariantByValue(percentage) : variant;

    return (
      <div
        ref={ref}
        className={clsx('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={variantColors[autoVariant]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <div className="text-center">
              {showPercentage && (
                <div className="text-2xl font-bold text-gray-900">
                  {percentage.toFixed(0)}%
                </div>
              )}
              {showLabel && (
                <div className="text-xs text-gray-500 mt-1">
                  Progress
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };