import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Wifi, WifiOff, Home, ArrowLeft, Bug } from 'lucide-react';
import { Button } from './Button';
import { ErrorAlert } from './ErrorAlert';
import { cn } from '../../utils/cn';
import { toast } from './Toast';

export interface ErrorRecoveryProps {
  error: Error | any;
  onRetry: () => void | Promise<void>;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onReportBug?: (error: any) => void;
  showDetails?: boolean;
  className?: string;
  variant?: 'inline' | 'page' | 'modal';
  title?: string;
  description?: string;
  retryButtonText?: string;
  maxRetries?: number;
  currentRetries?: number;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onGoBack,
  onGoHome,
  onReportBug,
  showDetails = false,
  className,
  variant = 'inline',
  title,
  description,
  retryButtonText = 'Try Again',
  maxRetries = 3,
  currentRetries = 0,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [localRetryCount, setLocalRetryCount] = useState(currentRetries);

  const handleRetry = async () => {
    if (localRetryCount >= maxRetries) {
      toast.warning('Maximum retry attempts reached. Please try again later.');
      return;
    }

    setIsRetrying(true);
    setLocalRetryCount(prev => prev + 1);

    try {
      await onRetry();
      setLocalRetryCount(0); // Reset on success
      toast.success('Operation succeeded!');
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      if (localRetryCount + 1 >= maxRetries) {
        toast.error('All retry attempts failed. Please contact support if the issue persists.');
      } else {
        toast.error(`Retry failed. ${maxRetries - localRetryCount - 1} attempts remaining.`);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReportBug = () => {
    if (onReportBug) {
      onReportBug(error);
      toast.info('Bug report submitted. Thank you for helping us improve!');
    }
  };

  const getErrorIcon = () => {
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return WifiOff;
    }
    return AlertCircle;
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'Connection Error';
    }
    
    if (error?.response?.status >= 500) {
      return 'Server Error';
    }
    
    if (error?.response?.status === 404) {
      return 'Not Found';
    }
    
    return 'Something went wrong';
  };

  const getErrorDescription = () => {
    if (description) return description;
    
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'Please check your internet connection and try again.';
    }
    
    if (error?.response?.status >= 500) {
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    }
    
    if (error?.response?.status === 404) {
      return 'The requested resource could not be found.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const ErrorIcon = getErrorIcon();
  const canRetry = localRetryCount < maxRetries;

  const renderActions = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {canRetry && (
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          variant="primary"
          className="flex items-center justify-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
          {isRetrying ? 'Retrying...' : retryButtonText}
          {localRetryCount > 0 && ` (${localRetryCount}/${maxRetries})`}
        </Button>
      )}
      
      {onGoBack && (
        <Button
          onClick={onGoBack}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      )}
      
      {onGoHome && (
        <Button
          onClick={onGoHome}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Button>
      )}
      
      {onReportBug && (
        <Button
          onClick={handleReportBug}
          variant="ghost"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <Bug className="w-4 h-4" />
          Report Issue
        </Button>
      )}
    </div>
  );

  const renderNetworkStatus = () => {
    if (!navigator.onLine) {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
          <WifiOff className="w-4 h-4" />
          <span>You appear to be offline</span>
        </div>
      );
    }
    return null;
  };

  if (variant === 'page') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4', className)}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
              <ErrorIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getErrorTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getErrorDescription()}
            </p>
          </div>
          
          {renderNetworkStatus()}
          
          {showDetails && (
            <ErrorAlert
              error={error}
              variant="error"
              showDetails={true}
              className="text-left"
            />
          )}
          
          {renderActions()}
          
          {!canRetry && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Maximum retry attempts reached. Please contact support if the issue persists.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6', className)}>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <ErrorIcon className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {getErrorTitle()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getErrorDescription()}
              </p>
            </div>
          </div>
          
          {renderNetworkStatus()}
          
          {showDetails && (
            <div className="mb-4">
              <ErrorAlert
                error={error}
                variant="error"
                showDetails={true}
              />
            </div>
          )}
          
          {renderActions()}
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={cn('rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <ErrorIcon className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-red-800 dark:text-red-200 mb-1">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {getErrorDescription()}
          </p>
          
          {renderNetworkStatus()}
          
          {showDetails && (
            <div className="mb-4">
              <ErrorAlert
                error={error}
                variant="error"
                showDetails={true}
              />
            </div>
          )}
          
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error recovery
export const withErrorRecovery = <P extends object>(
  Component: React.ComponentType<P>,
  errorRecoveryProps?: Partial<ErrorRecoveryProps>
) => {
  return React.forwardRef<any, P & { 
    error?: any; 
    onRetry?: () => void; 
    showErrorRecovery?: boolean;
  }>((props, ref) => {
    const { error, onRetry, showErrorRecovery = true, ...componentProps } = props;

    if (error && showErrorRecovery && onRetry) {
      return (
        <ErrorRecovery
          error={error}
          onRetry={onRetry}
          {...errorRecoveryProps}
        />
      );
    }

    return <Component ref={ref} {...(componentProps as P)} />;
  });
};

export default ErrorRecovery;