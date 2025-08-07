import { useState, useCallback, useRef } from 'react';
import { toast } from '../components/ui/Toast';

export interface RefreshConfig {
  showToast?: boolean;
  silentRefresh?: boolean;
  errorMessage?: string;
  successMessage?: string;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface RefreshState {
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  refreshCount: number;
  error: any;
}

export const useRefreshData = <T = any>(
  refreshFunction: () => Promise<T>,
  config: RefreshConfig = {}
) => {
  const {
    showToast = true,
    silentRefresh = false,
    errorMessage = 'Failed to refresh data',
    successMessage = 'Data refreshed successfully',
    retryOnFailure = true,
    maxRetries = 3,
  } = config;

  const [state, setState] = useState<RefreshState>({
    isRefreshing: false,
    lastRefreshed: null,
    refreshCount: 0,
    error: null,
  });

  const retryCount = useRef(0);
  const refreshPromise = useRef<Promise<T> | null>(null);

  const refresh = useCallback(async (options: Partial<RefreshConfig> = {}): Promise<T | null> => {
    const mergedConfig = { ...config, ...options };

    // Prevent multiple simultaneous refresh calls
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    setState(prev => ({
      ...prev,
      isRefreshing: true,
      error: null,
    }));

    if (showToast && !silentRefresh && !mergedConfig.silentRefresh) {
      toast.loading('Refreshing data...', { id: 'refresh-toast' });
    }

    const executeRefresh = async (): Promise<T> => {
      try {
        const result = await refreshFunction();
        
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          lastRefreshed: new Date(),
          refreshCount: prev.refreshCount + 1,
          error: null,
        }));

        retryCount.current = 0;

        if (showToast && !silentRefresh && !mergedConfig.silentRefresh) {
          toast.dismiss('refresh-toast');
          toast.success(mergedConfig.successMessage || successMessage);
        }

        return result;
      } catch (error) {
        console.error('Refresh failed:', error);

        if (retryOnFailure && retryCount.current < maxRetries) {
          retryCount.current++;
          
          if (showToast && !mergedConfig.silentRefresh) {
            toast.warning(`Refresh failed. Retrying... (${retryCount.current}/${maxRetries})`, {
              duration: 2000,
            });
          }

          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCount.current - 1) * 1000)
          );

          return executeRefresh();
        }

        setState(prev => ({
          ...prev,
          isRefreshing: false,
          error,
        }));

        if (showToast && !mergedConfig.silentRefresh) {
          toast.dismiss('refresh-toast');
          toast.error(mergedConfig.errorMessage || errorMessage);
        }

        throw error;
      }
    };

    refreshPromise.current = executeRefresh();

    try {
      const result = await refreshPromise.current;
      return result;
    } finally {
      refreshPromise.current = null;
    }
  }, [
    refreshFunction,
    showToast,
    silentRefresh,
    errorMessage,
    successMessage,
    retryOnFailure,
    maxRetries,
    config
  ]);

  const silentRefresh = useCallback(() => {
    return refresh({ silentRefresh: true, showToast: false });
  }, [refresh]);

  const forceRefresh = useCallback(() => {
    retryCount.current = 0;
    return refresh();
  }, [refresh]);

  const canRefresh = !state.isRefreshing;

  return {
    ...state,
    refresh,
    silentRefresh,
    forceRefresh,
    canRefresh,
  };
};

// Hook for managing multiple data sources with refresh capability
export const useMultiRefreshData = <T extends Record<string, any>>(
  refreshFunctions: { [K in keyof T]: () => Promise<T[K]> },
  config: RefreshConfig = {}
) => {
  const [states, setStates] = useState<{ [K in keyof T]: RefreshState }>(() => {
    const initialStates = {} as { [K in keyof T]: RefreshState };
    Object.keys(refreshFunctions).forEach((key) => {
      initialStates[key as keyof T] = {
        isRefreshing: false,
        lastRefreshed: null,
        refreshCount: 0,
        error: null,
      };
    });
    return initialStates;
  });

  const refresh = useCallback(async (
    keys?: (keyof T)[],
    options: Partial<RefreshConfig> = {}
  ): Promise<Partial<T>> => {
    const keysToRefresh = keys || Object.keys(refreshFunctions) as (keyof T)[];
    const mergedConfig = { ...config, ...options };

    // Update states to show refreshing
    setStates(prev => {
      const newStates = { ...prev };
      keysToRefresh.forEach(key => {
        newStates[key] = {
          ...prev[key],
          isRefreshing: true,
          error: null,
        };
      });
      return newStates;
    });

    if (config.showToast && !mergedConfig.silentRefresh) {
      const message = keysToRefresh.length === 1 
        ? 'Refreshing data...'
        : `Refreshing ${keysToRefresh.length} data sources...`;
      toast.loading(message, { id: 'multi-refresh-toast' });
    }

    const results: Partial<T> = {};
    const errors: { [K in keyof T]?: any } = {};

    // Execute all refresh functions in parallel
    await Promise.allSettled(
      keysToRefresh.map(async (key) => {
        try {
          const result = await refreshFunctions[key]();
          results[key] = result;
          
          setStates(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              isRefreshing: false,
              lastRefreshed: new Date(),
              refreshCount: prev[key].refreshCount + 1,
              error: null,
            },
          }));
        } catch (error) {
          errors[key] = error;
          
          setStates(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              isRefreshing: false,
              error,
            },
          }));
        }
      })
    );

    const successCount = Object.keys(results).length;
    const errorCount = Object.keys(errors).length;

    if (config.showToast && !mergedConfig.silentRefresh) {
      toast.dismiss('multi-refresh-toast');
      
      if (errorCount === 0) {
        toast.success(`Successfully refreshed ${successCount} data source${successCount === 1 ? '' : 's'}`);
      } else if (successCount === 0) {
        toast.error('Failed to refresh all data sources');
      } else {
        toast.warning(`Refreshed ${successCount}/${keysToRefresh.length} data sources. ${errorCount} failed.`);
      }
    }

    return results;
  }, [refreshFunctions, config]);

  const refreshSingle = useCallback((key: keyof T, options: Partial<RefreshConfig> = {}) => {
    return refresh([key], options);
  }, [refresh]);

  const refreshAll = useCallback((options: Partial<RefreshConfig> = {}) => {
    return refresh(undefined, options);
  }, [refresh]);

  const silentRefreshAll = useCallback(() => {
    return refresh(undefined, { silentRefresh: true, showToast: false });
  }, [refresh]);

  const isRefreshing = Object.values(states).some(state => state.isRefreshing);
  const hasErrors = Object.values(states).some(state => state.error);
  const lastRefreshed = Object.values(states)
    .map(state => state.lastRefreshed)
    .filter(Boolean)
    .reduce((latest, current) => 
      !latest || (current && current > latest) ? current : latest
    , null as Date | null);

  return {
    states,
    refresh,
    refreshSingle,
    refreshAll,
    silentRefreshAll,
    isRefreshing,
    hasErrors,
    lastRefreshed,
  };
};

export default useRefreshData;