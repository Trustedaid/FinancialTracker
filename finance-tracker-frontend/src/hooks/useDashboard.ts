import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';

// Query keys for dashboard data
export const dashboardKeys = {
  all: ['dashboard'] as const,
  monthlyData: () => [...dashboardKeys.all, 'monthly-data'] as const,
  chartData: (type: string, params?: any) => [...dashboardKeys.all, 'chart', type, params] as const,
} as const;

// Mock monthly data calculation from transactions
export const useMonthlyData = () => {
  return useQuery({
    queryKey: dashboardKeys.monthlyData(),
    queryFn: async () => {
      // Get current month transactions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const response = await transactionService.getTransactions({
        page: 1,
        pageSize: 1000, // Get all transactions for the month
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      });

      if (response.data?.transactions) {
        const transactions = response.data.transactions;
        const income = transactions
          .filter((t: any) => t.type === 1)
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const expenses = transactions
          .filter((t: any) => t.type === 2)
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        return {
          totalIncome: income,
          totalExpense: expenses,
          balance: income - expenses,
          transactionCount: transactions.length,
        };
      }

      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Chart data hooks with caching
export const useIncomeExpenseChartData = (monthsBack: number = 6) => {
  return useQuery({
    queryKey: dashboardKeys.chartData('income-expense', { monthsBack }),
    queryFn: async () => {
      // This would normally call a specific chart data endpoint
      // For now, we'll use a placeholder that fetches recent transactions
      const response = await transactionService.getTransactions({
        page: 1,
        pageSize: 100,
      });
      return response.data?.transactions || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategorySpendingChartData = () => {
  return useQuery({
    queryKey: dashboardKeys.chartData('category-spending'),
    queryFn: async () => {
      // This would call a category spending aggregation endpoint
      const response = await transactionService.getTransactions({
        page: 1,
        pageSize: 100,
        type: 2, // Expenses only
      });
      return response.data?.transactions || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
};

export const useBudgetProgressChartData = () => {
  return useQuery({
    queryKey: dashboardKeys.chartData('budget-progress'),
    queryFn: async () => {
      // This would call a budget progress endpoint
      const response = await transactionService.getTransactions({
        page: 1,
        pageSize: 50,
        type: 2, // Expenses only
      });
      return response.data?.transactions || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
  });
};

export const useMonthlyComparisonChartData = () => {
  return useQuery({
    queryKey: dashboardKeys.chartData('monthly-comparison'),
    queryFn: async () => {
      // This would call a monthly comparison endpoint
      const response = await transactionService.getTransactions({
        page: 1,
        pageSize: 100,
      });
      return response.data?.transactions || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes
  });
};