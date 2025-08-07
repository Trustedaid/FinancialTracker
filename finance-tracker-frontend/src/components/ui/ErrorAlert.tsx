import React from 'react';
import { AlertCircle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ApiError } from '../../hooks/useErrorHandler';

export interface ErrorAlertProps {
  error: Error | ApiError | string;
  title?: string;
  variant?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  retryLabel?: string;
  showTrace?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title,
  variant = 'error',
  showDetails = false,
  onRetry,
  onDismiss,
  className,
  retryLabel = 'Try Again',
  showTrace = false
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return { message: error, details: null };
    }

    if ('detail' in error) {
      // API Error
      return {
        message: error.detail || error.title || 'An error occurred',
        details: error,
        isApiError: true
      };
    }

    // JavaScript Error
    return {
      message: error.message || 'An unexpected error occurred',
      details: error,
      isApiError: false
    };
  };

  const { message, details, isApiError } = getErrorDetails();

  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: 'text-red-400',
      title: 'text-red-800 dark:text-red-200',
      message: 'text-red-700 dark:text-red-300',
      button: 'text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: 'text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200',
      message: 'text-yellow-700 dark:text-yellow-300',
      button: 'text-yellow-700 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-200'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: 'text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300',
      button: 'text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'rounded-lg border p-4',
      styles.container,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={cn('h-5 w-5', styles.icon)} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className={cn('text-sm font-medium', styles.title)}>
                  {title}
                </h3>
              )}
              <div className={cn('text-sm', title ? 'mt-1' : '', styles.message)}>
                {message}
              </div>
              
              {isApiError && details && 'errors' in details && details.errors && (
                <div className="mt-2 space-y-1">
                  {Object.entries(details.errors).map(([field, errors]) => (
                    <div key={field} className="text-xs">
                      <span className="font-medium">{field}:</span> {Array.isArray(errors) ? errors.join(', ') : errors}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="ml-4 flex space-x-2">
              {(showDetails || showTrace) && details && (
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className={cn(
                    'inline-flex items-center text-xs font-medium transition-colors',
                    styles.button
                  )}
                >
                  Details
                  {isDetailsOpen ? (
                    <ChevronUp className="ml-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              )}
              
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={cn(
                    'inline-flex items-center text-xs font-medium transition-colors',
                    styles.button
                  )}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  {retryLabel}
                </button>
              )}
              
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={cn(
                    'inline-flex items-center text-xs transition-colors',
                    styles.button
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss</span>
                </button>
              )}
            </div>
          </div>
          
          {isDetailsOpen && details && (
            <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="text-xs space-y-2">
                {isApiError && (
                  <>
                    <div>
                      <strong>Type:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{(details as ApiError).type}</code>
                    </div>
                    <div>
                      <strong>Status:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{(details as ApiError).status}</code>
                    </div>
                    {(details as ApiError).traceId && (
                      <div>
                        <strong>Trace ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{(details as ApiError).traceId}</code>
                      </div>
                    )}
                    {(details as ApiError).correlationId && (
                      <div>
                        <strong>Correlation ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{(details as ApiError).correlationId}</code>
                      </div>
                    )}
                    <div>
                      <strong>Timestamp:</strong> {new Date((details as ApiError).timestamp).toLocaleString()}
                    </div>
                  </>
                )}
                
                {showTrace && !isApiError && 'stack' in details && details.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                      {details.stack}
                    </pre>
                  </div>
                )}
                
                {isApiError && (details as ApiError).context && Object.keys((details as ApiError).context!).length > 0 && (
                  <div>
                    <strong>Context:</strong>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 text-xs overflow-x-auto">
                      {JSON.stringify((details as ApiError).context, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;