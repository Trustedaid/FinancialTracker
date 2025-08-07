import React from 'react';
import { clsx } from 'clsx';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'default', 
    width, 
    height, 
    lines = 1, 
    animate = true,
    style,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'bg-gray-200 dark:bg-gray-700',
      animate && 'animate-pulse',
      variant === 'circular' && 'rounded-full',
      variant === 'rectangular' && 'rounded-md',
      variant === 'default' && 'rounded',
      variant === 'text' && 'rounded-sm'
    );

    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
              style={{
                height: height || '1rem',
                width: index === lines - 1 ? '75%' : width || '100%',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton width={80} height={32} />
      <Skeleton width={80} height={32} />
    </div>
  </div>
);

const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  );
};

const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-10 w-20',
    lg: 'h-12 w-24',
  };

  return (
    <Skeleton
      variant="rectangular"
      className={cn(sizeClasses[size], 'rounded-lg', className)}
    />
  );
};

const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {/* Header */}
    <div className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} width="100%" height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="100%" height={16} />
        ))}
      </div>
    ))}
  </div>
);

// Dashboard specific skeletons
const SkeletonDashboardCard: React.FC<{
  className?: string;
}> = ({ className }) => (
  <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700', className)}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton variant="circular" className="w-8 h-8" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-16" />
  </div>
);

const SkeletonTransaction: React.FC<{
  className?: string;
}> = ({ className }) => (
  <div className={cn('flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="text-right space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

const SkeletonForm: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className }) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-4 pt-4">
      <SkeletonButton size="lg" className="flex-1" />
      <SkeletonButton size="lg" />
    </div>
  </div>
);

const SkeletonChart: React.FC<{ 
  type?: 'bar' | 'line' | 'pie';
  className?: string;
}> = ({ type = 'bar', className }) => {
  if (type === 'pie') {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Skeleton variant="circular" className="w-48 h-48" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <div className="flex justify-between items-center">
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={16} />
      </div>
      <div className="flex items-end justify-center space-x-2 h-48">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton
            key={i}
            className="w-8"
            style={{ height: `${Math.random() * 120 + 40}px` }}
          />
        ))}
      </div>
      <div className="flex justify-center space-x-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width={60} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonChart, 
  SkeletonAvatar,
  SkeletonButton,
  SkeletonDashboardCard,
  SkeletonTransaction,
  SkeletonForm
};