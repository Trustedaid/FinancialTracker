import { useState, useCallback, useRef } from 'react';
import { toast } from '../components/ui/Toast';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetriesExceeded?: (error: any) => void;
}

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: any;
  canRetry: boolean;
}

export const useRetry = () => {
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = (attempt: number, options: RetryOptions): number => {
    const { initialDelay = 1000, maxDelay = 30000, backoffFactor = 2 } = options;
    const exponentialDelay = initialDelay * Math.pow(backoffFactor, attempt - 1);
    const jitteredDelay = exponentialDelay + Math.random() * 1000; // Add jitter
    return Math.min(jitteredDelay, maxDelay);
  };

  const shouldRetry = (error: any, attempt: number, options: RetryOptions): boolean => {
    const { maxRetries = 3, retryCondition } = options;
    
    if (attempt >= maxRetries) {
      return false;
    }

    if (retryCondition) {
      return retryCondition(error);
    }

    // Default retry conditions
    if (error?.response?.status) {
      const status = error.response.status;
      return status >= 500 || status === 429 || status === 408; // Server errors, rate limiting, timeout
    }

    if (error?.code) {
      return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || error.code === 'ECONNABORTED';
    }

    return true; // Retry unknown errors by default
  };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxRetries = 3, onRetry, onMaxRetriesExceeded } = options;
    let lastError: any;

    setRetryState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true,
    });

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (attempt > 1) {
          setRetryState(prev => ({
            ...prev,
            isRetrying: true,
            retryCount: attempt - 1,
          }));

          onRetry?.(attempt - 1, lastError);
        }

        const result = await operation();
        
        setRetryState({
          isRetrying: false,
          retryCount: attempt - 1,
          lastError: null,
          canRetry: true,
        });

        return result;
      } catch (error) {
        lastError = error;
        
        setRetryState(prev => ({
          ...prev,
          isRetrying: false,
          retryCount: attempt - 1,
          lastError: error,
          canRetry: attempt < maxRetries + 1,
        }));

        if (!shouldRetry(error, attempt, options)) {
          break;
        }

        if (attempt <= maxRetries) {
          const delay = calculateDelay(attempt, options);
          
          console.warn(`Retry attempt ${attempt}/${maxRetries} in ${delay}ms:`, error);

          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    setRetryState(prev => ({
      ...prev,
      canRetry: false,
    }));

    onMaxRetriesExceeded?.(lastError);
    throw lastError;
  }, []);

  const manualRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    if (!retryState.canRetry) {
      throw new Error('Maximum retries exceeded');
    }

    return executeWithRetry(operation, {
      ...options,
      maxRetries: 1, // Single retry for manual attempts
    });
  }, [retryState.canRetry, executeWithRetry]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setRetryState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true,
    });
  }, []);

  return {
    retryState,
    executeWithRetry,
    manualRetry,
    reset,
  };
};

// Higher-order hook for query operations with automatic retry
export const useRetryableQuery = <T>(
  queryFn: () => Promise<T>,
  options: RetryOptions & { 
    showRetryToasts?: boolean;
    retryToastMessage?: string;
  } = {}
) => {
  const { executeWithRetry, retryState, reset } = useRetry();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const { showRetryToasts = true, retryToastMessage = 'Retrying...', ...retryOptions } = options;

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await executeWithRetry(queryFn, {
        ...retryOptions,
        onRetry: (attempt, error) => {
          if (showRetryToasts) {
            toast.info(`${retryToastMessage} (${attempt}/${retryOptions.maxRetries || 3})`, {
              duration: 2000,
            });
          }
          retryOptions.onRetry?.(attempt, error);
        },
        onMaxRetriesExceeded: (error) => {
          if (showRetryToasts) {
            toast.error('Maximum retries exceeded. Please try again later.');
          }
          retryOptions.onMaxRetriesExceeded?.(error);
        },
      });

      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, executeWithRetry, showRetryToasts, retryToastMessage, retryOptions]);

  const retry = useCallback(async () => {
    return execute();
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    retryState,
    execute,
    retry,
    reset,
  };
};

export default useRetry;