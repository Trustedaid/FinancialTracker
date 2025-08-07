import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '../components/ui/Toast';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  recoveryTimeout?: number;
  monitoringPeriod?: number;
  expectedErrors?: string[];
  onStateChange?: (state: CircuitState) => void;
  onFailure?: (error: any) => void;
  onSuccess?: () => void;
}

export interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
  successCount: number;
}

export const useCircuitBreaker = (config: CircuitBreakerConfig = {}) => {
  const {
    failureThreshold = 5,
    recoveryTimeout = 60000, // 1 minute
    monitoringPeriod = 300000, // 5 minutes
    expectedErrors = ['NETWORK_ERROR', 'TIMEOUT'],
    onStateChange,
    onFailure,
    onSuccess
  } = config;

  const [state, setState] = useState<CircuitBreakerState>({
    state: CircuitState.CLOSED,
    failureCount: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
    successCount: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((newState: Partial<CircuitBreakerState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      
      if (updated.state !== prev.state) {
        onStateChange?.(updated.state);
        
        // Show user-friendly notifications
        switch (updated.state) {
          case CircuitState.OPEN:
            toast.warning(
              'Service temporarily unavailable due to repeated failures. Trying to recover...', 
              { duration: 8000 }
            );
            break;
          case CircuitState.HALF_OPEN:
            toast.info('Testing service recovery...', { duration: 3000 });
            break;
          case CircuitState.CLOSED:
            if (prev.state !== CircuitState.CLOSED) {
              toast.success('Service recovered successfully!', { duration: 4000 });
            }
            break;
        }
      }
      
      return updated;
    });
  }, [onStateChange]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    updateState({
      state: CircuitState.CLOSED,
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
      successCount: 0,
    });
  }, [updateState]);

  const recordSuccess = useCallback(() => {
    onSuccess?.();
    
    if (state.state === CircuitState.HALF_OPEN) {
      // Successful call in half-open state - close the circuit
      reset();
    } else if (state.state === CircuitState.CLOSED) {
      // Reset failure count on successful calls during monitoring period
      const now = Date.now();
      if (state.lastFailureTime && now - state.lastFailureTime > monitoringPeriod) {
        updateState({ failureCount: 0, lastFailureTime: null });
      }
    }
  }, [state.state, state.lastFailureTime, onSuccess, reset, updateState, monitoringPeriod]);

  const recordFailure = useCallback((error: any) => {
    onFailure?.(error);

    // Check if this is an expected error that should trip the circuit
    const isExpectedError = expectedErrors.some(expectedError => 
      error?.code === expectedError || 
      error?.type === expectedError ||
      error?.message?.includes(expectedError)
    );

    if (!isExpectedError && error?.response?.status && error.response.status < 500) {
      // Don't count client errors (4xx) as circuit breaker failures unless expected
      return;
    }

    const now = Date.now();
    const newFailureCount = state.failureCount + 1;

    updateState({
      failureCount: newFailureCount,
      lastFailureTime: now,
    });

    // Trip circuit if threshold exceeded
    if (newFailureCount >= failureThreshold && state.state === CircuitState.CLOSED) {
      const nextAttemptTime = now + recoveryTimeout;
      
      updateState({
        state: CircuitState.OPEN,
        nextAttemptTime,
      });

      // Schedule transition to half-open state
      timeoutRef.current = setTimeout(() => {
        updateState({
          state: CircuitState.HALF_OPEN,
          nextAttemptTime: null,
        });
      }, recoveryTimeout);
    }
  }, [
    state.failureCount,
    state.state,
    failureThreshold,
    recoveryTimeout,
    expectedErrors,
    onFailure,
    updateState
  ]);

  const canExecute = useCallback(() => {
    if (state.state === CircuitState.CLOSED) {
      return true;
    }

    if (state.state === CircuitState.HALF_OPEN) {
      return true;
    }

    if (state.state === CircuitState.OPEN) {
      return false;
    }

    return false;
  }, [state.state]);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!canExecute()) {
      const timeUntilRetry = state.nextAttemptTime 
        ? Math.max(0, state.nextAttemptTime - Date.now())
        : recoveryTimeout;
        
      const error = new Error(`Circuit breaker is OPEN. Try again in ${Math.ceil(timeUntilRetry / 1000)} seconds.`);
      (error as any).code = 'CIRCUIT_BREAKER_OPEN';
      (error as any).retryAfter = Math.ceil(timeUntilRetry / 1000);
      throw error;
    }

    try {
      const result = await operation();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure(error);
      throw error;
    }
  }, [canExecute, state.nextAttemptTime, recoveryTimeout, recordSuccess, recordFailure]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state: state.state,
    failureCount: state.failureCount,
    canExecute: canExecute(),
    timeUntilRetry: state.nextAttemptTime ? Math.max(0, state.nextAttemptTime - Date.now()) : null,
    execute,
    recordSuccess,
    recordFailure,
    reset,
  };
};

// Higher-order hook that combines circuit breaker with retry logic
export const useResilientOperation = <T>(
  operation: () => Promise<T>,
  circuitConfig: CircuitBreakerConfig = {},
  retryConfig: { maxRetries?: number; backoffFactor?: number } = {}
) => {
  const circuitBreaker = useCircuitBreaker(circuitConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const { maxRetries = 3, backoffFactor = 2 } = retryConfig;

  const executeResilient = useCallback(async (): Promise<T> => {
    setIsLoading(true);
    setError(null);

    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await circuitBreaker.execute(operation);
        setIsLoading(false);
        return result;
      } catch (err: any) {
        lastError = err;
        
        // Don't retry if circuit breaker is open
        if (err.code === 'CIRCUIT_BREAKER_OPEN') {
          break;
        }

        // Don't retry client errors
        if (err?.response?.status && err.response.status < 500 && err.response.status >= 400) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt <= maxRetries) {
          const delay = 1000 * Math.pow(backoffFactor, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    setError(lastError);
    setIsLoading(false);
    throw lastError;
  }, [circuitBreaker, operation, maxRetries, backoffFactor]);

  return {
    execute: executeResilient,
    isLoading,
    error,
    circuitState: circuitBreaker.state,
    canExecute: circuitBreaker.canExecute,
    timeUntilRetry: circuitBreaker.timeUntilRetry,
    reset: circuitBreaker.reset,
  };
};

export default useCircuitBreaker;