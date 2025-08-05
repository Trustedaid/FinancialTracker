import React from 'react';
import { clsx } from 'clsx';

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
    const baseClasses = clsx(
      'bg-gray-200',
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
        <div ref={ref} className={clsx('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={clsx(
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
        className={clsx(baseClasses, className)}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('p-6 space-y-4', className)}>
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

const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={clsx('space-y-4', className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} width="100%" height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="100%" height={16} />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('space-y-4', className)}>
    <div className="flex justify-between items-center">
      <Skeleton width={120} height={20} />
      <Skeleton width={80} height={16} />
    </div>
    <Skeleton variant="rectangular" width="100%" height={300} />
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

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart };