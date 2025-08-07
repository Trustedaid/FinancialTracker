import { useState, useCallback, useRef } from 'react';
import { toast } from '../components/ui/Toast';

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  originalData?: T;
}

export interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (data: T, operation: OptimisticUpdate<T>) => void;
  onError?: (error: any, operation: OptimisticUpdate<T>) => void;
  rollbackDelay?: number;
  showToasts?: boolean;
}

export const useOptimisticUpdate = <T extends { id?: string | number }>(
  initialData: T[],
  options: UseOptimisticUpdateOptions<T> = {}
) => {
  const {
    onSuccess,
    onError,
    rollbackDelay = 5000,
    showToasts = true,
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [pendingOperations, setPendingOperations] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const rollbackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateOperationId = () => `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addOptimisticUpdate = useCallback((
    operation: Omit<OptimisticUpdate<T>, 'id' | 'timestamp'>
  ) => {
    const operationId = generateOperationId();
    const optimisticUpdate: OptimisticUpdate<T> = {
      ...operation,
      id: operationId,
      timestamp: Date.now(),
    };

    setPendingOperations(prev => new Map(prev.set(operationId, optimisticUpdate)));

    // Apply optimistic update to data
    switch (operation.operation) {
      case 'create':
        setData(prev => [...prev, operation.data]);
        if (showToasts) {
          toast.info('Adding item...', { duration: 2000 });
        }
        break;

      case 'update':
        setData(prev => prev.map(item => 
          item.id === operation.data.id ? { ...item, ...operation.data } : item
        ));
        if (showToasts) {
          toast.info('Updating item...', { duration: 2000 });
        }
        break;

      case 'delete':
        setData(prev => prev.filter(item => item.id !== operation.data.id));
        if (showToasts) {
          toast.info('Deleting item...', { duration: 2000 });
        }
        break;
    }

    return operationId;
  }, [showToasts]);

  const confirmOptimisticUpdate = useCallback((operationId: string, serverData?: T) => {
    const operation = pendingOperations.get(operationId);
    if (!operation) return;

    // Clear rollback timeout
    const timeout = rollbackTimeouts.current.get(operationId);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(operationId);
    }

    // Update with server data if provided
    if (serverData && (operation.operation === 'create' || operation.operation === 'update')) {
      setData(prev => {
        switch (operation.operation) {
          case 'create':
            return prev.map(item => 
              JSON.stringify(item) === JSON.stringify(operation.data) ? serverData : item
            );
          case 'update':
            return prev.map(item => 
              item.id === operation.data.id ? { ...item, ...serverData } : item
            );
          default:
            return prev;
        }
      });
    }

    setPendingOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });

    onSuccess?.(serverData || operation.data, operation);

    if (showToasts) {
      const operationText = {
        create: 'created',
        update: 'updated',
        delete: 'deleted',
      }[operation.operation];
      toast.success(`Item ${operationText} successfully!`);
    }
  }, [pendingOperations, onSuccess, showToasts]);

  const rollbackOptimisticUpdate = useCallback((operationId: string, error?: any) => {
    const operation = pendingOperations.get(operationId);
    if (!operation) return;

    // Clear rollback timeout
    const timeout = rollbackTimeouts.current.get(operationId);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(operationId);
    }

    // Rollback the optimistic update
    switch (operation.operation) {
      case 'create':
        setData(prev => prev.filter(item => 
          JSON.stringify(item) !== JSON.stringify(operation.data)
        ));
        break;

      case 'update':
        if (operation.originalData) {
          setData(prev => prev.map(item => 
            item.id === operation.data.id ? operation.originalData! : item
          ));
        }
        break;

      case 'delete':
        if (operation.originalData) {
          setData(prev => [...prev, operation.originalData!]);
        }
        break;
    }

    setPendingOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(operationId);
      return newMap;
    });

    onError?.(error, operation);

    if (showToasts) {
      const operationText = {
        create: 'create',
        update: 'update',
        delete: 'delete',
      }[operation.operation];
      toast.error(`Failed to ${operationText} item. Changes reverted.`);
    }
  }, [pendingOperations, onError, showToasts]);

  const optimisticCreate = useCallback(async (
    newItem: T,
    serverOperation: () => Promise<T>
  ) => {
    const operationId = addOptimisticUpdate({
      data: newItem,
      operation: 'create',
    });

    // Set up automatic rollback
    const timeout = setTimeout(() => {
      rollbackOptimisticUpdate(operationId, new Error('Operation timeout'));
    }, rollbackDelay);
    rollbackTimeouts.current.set(operationId, timeout);

    try {
      const serverData = await serverOperation();
      confirmOptimisticUpdate(operationId, serverData);
      return serverData;
    } catch (error) {
      rollbackOptimisticUpdate(operationId, error);
      throw error;
    }
  }, [addOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate, rollbackDelay]);

  const optimisticUpdate = useCallback(async (
    itemId: string | number,
    updates: Partial<T>,
    serverOperation: () => Promise<T>
  ) => {
    const originalItem = data.find(item => item.id === itemId);
    if (!originalItem) {
      throw new Error('Item not found for update');
    }

    const updatedItem = { ...originalItem, ...updates };
    const operationId = addOptimisticUpdate({
      data: updatedItem,
      originalData: originalItem,
      operation: 'update',
    });

    // Set up automatic rollback
    const timeout = setTimeout(() => {
      rollbackOptimisticUpdate(operationId, new Error('Operation timeout'));
    }, rollbackDelay);
    rollbackTimeouts.current.set(operationId, timeout);

    try {
      const serverData = await serverOperation();
      confirmOptimisticUpdate(operationId, serverData);
      return serverData;
    } catch (error) {
      rollbackOptimisticUpdate(operationId, error);
      throw error;
    }
  }, [data, addOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate, rollbackDelay]);

  const optimisticDelete = useCallback(async (
    itemId: string | number,
    serverOperation: () => Promise<void>
  ) => {
    const originalItem = data.find(item => item.id === itemId);
    if (!originalItem) {
      throw new Error('Item not found for deletion');
    }

    const operationId = addOptimisticUpdate({
      data: originalItem,
      originalData: originalItem,
      operation: 'delete',
    });

    // Set up automatic rollback
    const timeout = setTimeout(() => {
      rollbackOptimisticUpdate(operationId, new Error('Operation timeout'));
    }, rollbackDelay);
    rollbackTimeouts.current.set(operationId, timeout);

    try {
      await serverOperation();
      confirmOptimisticUpdate(operationId);
    } catch (error) {
      rollbackOptimisticUpdate(operationId, error);
      throw error;
    }
  }, [data, addOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate, rollbackDelay]);

  const isPending = useCallback((itemId: string | number) => {
    return Array.from(pendingOperations.values()).some(op => 
      op.data.id === itemId
    );
  }, [pendingOperations]);

  const getPendingOperations = useCallback(() => {
    return Array.from(pendingOperations.values());
  }, [pendingOperations]);

  const clearPendingOperations = useCallback(() => {
    // Clear all timeouts
    rollbackTimeouts.current.forEach(timeout => clearTimeout(timeout));
    rollbackTimeouts.current.clear();
    
    setPendingOperations(new Map());
  }, []);

  return {
    data,
    setData,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    isPending,
    getPendingOperations,
    clearPendingOperations,
    pendingCount: pendingOperations.size,
  };
};

export default useOptimisticUpdate;