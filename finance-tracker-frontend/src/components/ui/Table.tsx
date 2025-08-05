import React from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'minimal' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortKey?: string;
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
  align?: 'left' | 'center' | 'right';
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'numeric' | 'status' | 'action';
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'border-collapse border-spacing-0',
      minimal: 'border-collapse border-spacing-0',
      bordered: 'border-collapse border-spacing-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
      striped: 'border-collapse border-spacing-0'
    };

    const sizes = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
        <div className="overflow-x-auto">
          <table
            ref={ref}
            className={clsx(
              'min-w-full',
              variants[variant],
              sizes[size],
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={clsx(
        'bg-gradient-to-r from-gray-50/90 via-blue-50/30 to-indigo-50/30 dark:from-gray-800/90 dark:via-gray-700/30 dark:to-gray-600/30 border-b border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={clsx('bg-white divide-y divide-gray-100', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-indigo-50/40 hover:to-purple-50/20 dark:hover:from-gray-700/80 dark:hover:via-gray-600/40 dark:hover:to-gray-500/20 hover:shadow-sm hover:scale-[1.01] border-b border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ 
    className, 
    children, 
    sortable = false, 
    sortKey, 
    sortConfig, 
    onSort, 
    align = 'left',
    ...props 
  }, ref) => {
    const handleSort = () => {
      if (sortable && sortKey && onSort) {
        onSort(sortKey);
      }
    };

    const getSortIcon = () => {
      if (!sortable) return null;
      
      if (sortConfig && sortConfig.key === sortKey) {
        return sortConfig.direction === 'asc' ? 
          <ChevronUp size={16} className="text-primary-600" /> : 
          <ChevronDown size={16} className="text-primary-600" />;
      }
      
      return <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />;
    };

    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    return (
      <th
        ref={ref}
        className={clsx(
          'px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700',
          alignmentClasses[align],
          sortable && 'cursor-pointer select-none hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-200',
          className
        )}
        onClick={handleSort}
        {...props}
      >
        <div className={clsx(
          'flex items-center gap-2',
          align === 'right' && 'justify-end',
          align === 'center' && 'justify-center'
        )}>
          <span>{children}</span>
          {getSortIcon()}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', variant = 'default', ...props }, ref) => {
    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };

    const variantClasses = {
      default: 'text-gray-900 dark:text-gray-100',
      numeric: 'text-gray-900 dark:text-gray-100 font-mono',
      status: 'text-gray-700 dark:text-gray-300',
      action: 'text-gray-500 dark:text-gray-400'
    };

    return (
      <td
        ref={ref}
        className={clsx(
          'px-6 py-5 whitespace-nowrap',
          alignmentClasses[align],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={clsx(
        'bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={clsx('mt-4 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};