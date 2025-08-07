import { useState, useEffect, useCallback } from 'react';
import { toast } from '../components/ui/Toast';
import { useNetworkStatus } from './useNetworkStatus';

export interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onRetry?: (retryCount: number) => void;
}

export interface OfflineQueueState {
  queue: QueuedRequest[];
  isProcessing: boolean;
  lastSyncTime: number | null;
  totalQueued: number;
  totalFailed: number;
  totalSucceeded: number;
}

const STORAGE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 100;
const RETRY_DELAY = 2000;

export const useOfflineQueue = () => {
  const [state, setState] = useState<OfflineQueueState>({
    queue: [],
    isProcessing: false,
    lastSyncTime: null,
    totalQueued: 0,
    totalFailed: 0,
    totalSucceeded: 0,
  });

  const networkStatus = useNetworkStatus();

  // Load queue from localStorage on init
  useEffect(() => {
    const savedQueue = localStorage.getItem(STORAGE_KEY);
    if (savedQueue) {
      try {
        const parsedQueue: QueuedRequest[] = JSON.parse(savedQueue);
        setState(prev => ({
          ...prev,
          queue: parsedQueue,
          totalQueued: parsedQueue.length,
        }));
      } catch (error) {
        console.error('Failed to parse offline queue from storage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.queue));
  }, [state.queue]);

  // Process queue when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && state.queue.length > 0 && !state.isProcessing) {
      processQueue();
    }
  }, [networkStatus.isOnline, state.queue.length, state.isProcessing]);

  const generateRequestId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addToQueue = useCallback((request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) => {
    if (state.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest low-priority request to make room
      setState(prev => ({
        ...prev,
        queue: prev.queue.filter((req, index) => 
          index !== prev.queue.findIndex(r => r.priority === 'low')
        ).slice(1), // Remove oldest if no low-priority found
      }));
    }

    const queuedRequest: QueuedRequest = {
      ...request,
      id: generateRequestId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    setState(prev => ({
      ...prev,
      queue: [...prev.queue, queuedRequest],
      totalQueued: prev.totalQueued + 1,
    }));

    toast.info(`Request queued for when you're back online`, {
      duration: 3000,
    });

    return queuedRequest.id;
  }, [state.queue.length]);

  const removeFromQueue = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter(req => req.id !== id),
    }));
  }, []);

  const executeRequest = async (request: QueuedRequest): Promise<any> => {
    // This would be replaced with your actual HTTP client
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
      body: request.data ? JSON.stringify(request.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const processQueue = useCallback(async () => {
    if (state.isProcessing || !networkStatus.isOnline || state.queue.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    // Sort queue by priority and timestamp
    const sortedQueue = [...state.queue].sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // Older requests first within same priority
    });

    const results = {
      succeeded: 0,
      failed: 0,
      retried: 0,
    };

    for (const request of sortedQueue) {
      if (!networkStatus.isOnline) {
        // Lost connection during processing
        break;
      }

      try {
        const response = await executeRequest(request);
        
        // Success
        request.onSuccess?.(response);
        removeFromQueue(request.id);
        results.succeeded++;

      } catch (error) {
        console.error(`Failed to process queued request ${request.id}:`, error);
        
        if (request.retryCount < request.maxRetries) {
          // Retry
          setState(prev => ({
            ...prev,
            queue: prev.queue.map(req =>
              req.id === request.id
                ? { ...req, retryCount: req.retryCount + 1 }
                : req
            ),
          }));
          
          request.onRetry?.(request.retryCount + 1);
          results.retried++;

          // Wait before processing next request to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // Max retries exceeded
          request.onError?.(error);
          removeFromQueue(request.id);
          results.failed++;
        }
      }
    }

    setState(prev => ({
      ...prev,
      isProcessing: false,
      lastSyncTime: Date.now(),
      totalSucceeded: prev.totalSucceeded + results.succeeded,
      totalFailed: prev.totalFailed + results.failed,
    }));

    // Show summary notification
    if (results.succeeded > 0 || results.failed > 0) {
      if (results.failed === 0) {
        toast.success(
          `Successfully synced ${results.succeeded} queued request${results.succeeded === 1 ? '' : 's'}`,
          { duration: 4000 }
        );
      } else {
        toast.warning(
          `Synced ${results.succeeded} requests, ${results.failed} failed`,
          { duration: 6000 }
        );
      }
    }
  }, [state.isProcessing, state.queue, networkStatus.isOnline, removeFromQueue]);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: [],
      totalQueued: 0,
      totalFailed: 0,
      totalSucceeded: 0,
    }));
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Offline queue cleared');
  }, []);

  const retryFailedRequests = useCallback(async () => {
    if (!networkStatus.isOnline) {
      toast.warning('Cannot retry while offline');
      return;
    }

    const failedRequests = state.queue.filter(req => req.retryCount >= req.maxRetries);
    
    if (failedRequests.length === 0) {
      toast.info('No failed requests to retry');
      return;
    }

    // Reset retry count for failed requests
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(req =>
        req.retryCount >= req.maxRetries
          ? { ...req, retryCount: 0 }
          : req
      ),
    }));

    toast.info(`Retrying ${failedRequests.length} failed requests`);
    await processQueue();
  }, [networkStatus.isOnline, state.queue, processQueue]);

  const getQueueStatus = useCallback(() => {
    const pending = state.queue.filter(req => req.retryCount < req.maxRetries).length;
    const failed = state.queue.filter(req => req.retryCount >= req.maxRetries).length;
    
    return {
      pending,
      failed,
      total: state.queue.length,
      isProcessing: state.isProcessing,
      lastSyncTime: state.lastSyncTime,
    };
  }, [state.queue, state.isProcessing, state.lastSyncTime]);

  return {
    state,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    retryFailedRequests,
    getQueueStatus,
  };
};

export default useOfflineQueue;