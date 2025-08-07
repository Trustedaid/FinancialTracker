import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import type { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../types';

// Query keys for transactions
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilterDto) => [...transactionKeys.lists(), filters] as const,
  recent: () => [...transactionKeys.all, 'recent'] as const,
  detail: (id: number) => [...transactionKeys.all, 'detail', id] as const,
} as const;

// Get transactions with filters and caching
export const useTransactions = (filters: TransactionFilterDto) => {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionService.getTransactions(filters),
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get recent transactions for dashboard
export const useRecentTransactions = (count: number = 5) => {
  return useQuery({
    queryKey: transactionKeys.recent(),
    queryFn: () => transactionService.getTransactions({ page: 1, pageSize: count }),
    select: (data) => data.data?.transactions || [],
    staleTime: 1 * 60 * 1000, // 1 minute for recent data
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Create transaction mutation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData: CreateTransactionDto) => 
      transactionService.createTransaction(transactionData),
    onSuccess: () => {
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // Also invalidate dashboard queries that depend on transactions
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
    },
  });
};

// Update transaction mutation
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...transactionData }: UpdateTransactionDto & { id: number }) => 
      transactionService.updateTransaction(id, transactionData),
    onSuccess: (_, variables) => {
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // Invalidate specific transaction detail
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      // Also invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
    },
  });
};

// Delete transaction mutation
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      // Remove specific transaction from cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(deletedId) });
      // Also invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
    },
  });
};