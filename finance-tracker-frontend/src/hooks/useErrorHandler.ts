import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
  context?: Record<string, any>;
  timestamp: string;
  traceId: string;
  correlationId?: string;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastType?: 'error' | 'warning' | 'info';
  customMessage?: string;
  onError?: (error: Error | ApiError) => void;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: Error | ApiError | any,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastType = 'error',
      customMessage,
      onError
    } = options;

    let message = customMessage;
    let errorDetails: Partial<ApiError> = {};

    // Handle different error types
    if (error?.response?.data) {
      // Axios error with API response
      errorDetails = error.response.data;
      message = message || errorDetails.detail || errorDetails.title || 'An error occurred';
    } else if (error?.detail) {
      // Direct API error object
      errorDetails = error;
      message = message || error.detail || error.title || 'An error occurred';
    } else if (error?.message) {
      // JavaScript Error object
      message = message || error.message;
    } else if (typeof error === 'string') {
      message = message || error;
    } else {
      message = message || 'An unexpected error occurred';
    }

    // Show toast notification
    if (showToast) {
      const toastOptions = {
        duration: getToastDuration(toastType, errorDetails.status),
        position: 'top-right' as const,
      };

      switch (toastType) {
        case 'error':
          toast.error(message, toastOptions);
          break;
        case 'warning':
          toast(message, { 
            ...toastOptions, 
            icon: '⚠️',
            style: { background: '#f59e0b', color: 'white' }
          });
          break;
        case 'info':
          toast(message, {
            ...toastOptions,
            icon: 'ℹ️',
            style: { background: '#3b82f6', color: 'white' }
          });
          break;
      }
    }

    // Log error details for debugging
    console.error('Error handled:', {
      originalError: error,
      processedMessage: message,
      errorDetails,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler
    onError?.(errorDetails.status ? errorDetails as ApiError : error);

    return {
      message,
      errorDetails,
      isApiError: !!errorDetails.status
    };
  }, []);

  const handleApiError = useCallback((error: any, customMessage?: string) => {
    return handleError(error, { customMessage });
  }, [handleError]);

  const handleValidationError = useCallback((error: any) => {
    const result = handleError(error, { 
      customMessage: 'Please check your input and try again',
      toastType: 'warning'
    });
    
    // Return validation errors for form handling
    if (result.errorDetails.errors) {
      return result.errorDetails.errors;
    }
    
    return null;
  }, [handleError]);

  const handleNetworkError = useCallback((error: any) => {
    if (!navigator.onLine) {
      return handleError(error, {
        customMessage: 'You appear to be offline. Please check your connection and try again.',
        toastType: 'warning'
      });
    }
    
    return handleError(error, {
      customMessage: 'Network error occurred. Please try again.',
    });
  }, [handleError]);

  const handleAuthError = useCallback((error: any) => {
    return handleError(error, {
      customMessage: 'Authentication required. Please log in again.',
      onError: () => {
        // Redirect to login or trigger auth refresh
        window.location.href = '/login';
      }
    });
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    handleAuthError
  };
};

const getToastDuration = (type: string, status?: number): number => {
  if (type === 'error' && status && status >= 500) {
    return 8000; // Longer duration for server errors
  }
  if (type === 'warning') {
    return 6000;
  }
  return 4000; // Default duration
};

export default useErrorHandler;