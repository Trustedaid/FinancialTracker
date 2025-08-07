import React from 'react';
import { Toaster, ToastBar, toast as hotToast } from 'react-hot-toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="z-50"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
          border: '1px solid var(--toast-border)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '420px',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
          duration: 6000,
        },
        loading: {
          iconTheme: {
            primary: '#6b7280',
            secondary: 'white',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 mr-3">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                {message}
              </div>
              {t.type !== 'loading' && (
                <button
                  className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => hotToast.dismiss(t.id)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

// Custom toast functions with enhanced styling and functionality
export const toast = {
  success: (message: string, options?: any) => {
    return hotToast.success(message, {
      icon: <CheckCircle className="w-5 h-5" />,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    return hotToast.error(message, {
      icon: <AlertCircle className="w-5 h-5" />,
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      duration: 6000,
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    return hotToast(message, {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fed7aa',
      },
      duration: 5000,
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    return hotToast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
      },
      ...options,
    });
  },

  loading: (message: string, options?: any) => {
    return hotToast.loading(message, {
      style: {
        background: '#f9fafb',
        color: '#374151',
        border: '1px solid #e5e7eb',
      },
      ...options,
    });
  },

  // Network-specific toasts
  networkError: (message: string = 'Network error. Please check your connection.', options?: any) => {
    return hotToast.error(message, {
      icon: <WifiOff className="w-5 h-5" />,
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      duration: 8000,
      ...options,
    });
  },

  connectionRestored: (message: string = 'Connection restored', options?: any) => {
    return hotToast.success(message, {
      icon: <Wifi className="w-5 h-5" />,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
      duration: 3000,
      ...options,
    });
  },

  // Validation error toast
  validation: (message: string, options?: any) => {
    return hotToast(message, {
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      style: {
        background: '#fff7ed',
        color: '#9a3412',
        border: '1px solid #fed7aa',
      },
      duration: 5000,
      ...options,
    });
  },

  // Custom toast with action button
  withAction: (
    message: string, 
    actionLabel: string, 
    onAction: () => void, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const styles = {
      success: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
      error: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      warning: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fed7aa',
      },
      info: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
      },
    };

    return hotToast.custom((t) => (
      <div 
        className={cn(
          "flex items-center justify-between p-4 rounded-lg shadow-lg max-w-md w-full",
          t.visible ? 'animate-enter' : 'animate-leave'
        )}
        style={styles[type]}
      >
        <div className="flex items-center">
          <div className="mr-3">
            {type === 'success' && <CheckCircle className="w-5 h-5" />}
            {type === 'error' && <AlertCircle className="w-5 h-5" />}
            {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <span className="text-sm font-medium">{message}</span>
        </div>
        <div className="flex items-center ml-4">
          <button
            onClick={() => {
              onAction();
              hotToast.dismiss(t.id);
            }}
            className="text-xs font-semibold underline hover:no-underline mr-2"
          >
            {actionLabel}
          </button>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
    });
  },

  // Promise-based toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        },
        error: {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        },
        ...options,
      }
    );
  },

  dismiss: (toastId?: string) => hotToast.dismiss(toastId),
  remove: (toastId: string) => hotToast.remove(toastId),
};

export default toast;