import React from 'react';
import { clsx } from 'clsx';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        primary: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        success: 'border-transparent bg-success-100 text-success-800 hover:bg-success-200',
        warning: 'border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200',
        danger: 'border-transparent bg-danger-100 text-danger-800 hover:bg-danger-200',
        info: 'border-transparent bg-info-100 text-info-800 hover:bg-info-200',
        outline: 'border-gray-200 text-gray-900 hover:bg-gray-100',
        'outline-success': 'border-success-200 text-success-700 hover:bg-success-50',
        'outline-warning': 'border-warning-200 text-warning-700 hover:bg-warning-50',
        'outline-danger': 'border-danger-200 text-danger-700 hover:bg-danger-50',
        'outline-info': 'border-info-200 text-info-700 hover:bg-info-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        )}
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };