import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budgetService';
import type { CreateBudgetDto, UpdateBudgetDto } from '../types';

// Query keys for budgets
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  currentMonth: () => [...budgetKeys.lists(), 'current-month'] as const,
  detail: (id: number) => [...budgetKeys.all, 'detail', id] as const,
} as const;

// Get current month budgets with caching
export const useCurrentMonthBudgets = () => {
  return useQuery({
    queryKey: budgetKeys.currentMonth(),
    queryFn: () => budgetService.getCurrentMonthBudgets(),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get all budgets with caching
export const useBudgets = () => {
  return useQuery({
    queryKey: budgetKeys.lists(),
    queryFn: () => budgetService.getBudgets(),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create budget mutation
export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetData: CreateBudgetDto) => 
      budgetService.createBudget(budgetData),
    onSuccess: (newBudget) => {
      // Optimistically update the budgets list
      queryClient.setQueryData(budgetKeys.currentMonth(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: [...oldData.data, newBudget.data]
          };
        }
        return oldData;
      });
      
      // Invalidate all budget queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      // Also invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Update budget mutation
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...budgetData }: UpdateBudgetDto & { id: number }) => 
      budgetService.updateBudget(id, budgetData),
    onSuccess: (updatedBudget, variables) => {
      // Optimistically update the budgets list
      queryClient.setQueryData(budgetKeys.currentMonth(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: oldData.data.map((budget: any) => 
              budget.id === variables.id ? { ...budget, ...updatedBudget.data } : budget
            )
          };
        }
        return oldData;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Delete budget mutation
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => budgetService.deleteBudget(id),
    onSuccess: (_, deletedId) => {
      // Optimistically remove from budgets list
      queryClient.setQueryData(budgetKeys.currentMonth(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: oldData.data.filter((budget: any) => budget.id !== deletedId)
          };
        }
        return oldData;
      });

      // Remove specific budget from cache
      queryClient.removeQueries({ queryKey: budgetKeys.detail(deletedId) });
      // Invalidate dashboard queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};