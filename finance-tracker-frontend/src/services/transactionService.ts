import { apiCall } from './api';
import api from './api';
import type { 
  TransactionDto, 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionFilterDto,
  PaginatedTransactionsDto,
  MonthlyTrendDto,
  CategorySpendingDto
} from '../types/api';
import type { ApiResponse } from '../types/api';

export const transactionService = {
  // Get transactions with filtering and pagination
  getTransactions: async (filters?: TransactionFilterDto): Promise<ApiResponse<PaginatedTransactionsDto>> => {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type.toString());
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const url = params.toString() ? `/transactions?${params.toString()}` : '/transactions';
    return apiCall(() => api.get<PaginatedTransactionsDto>(url));
  },

  // Get a specific transaction by ID
  getTransactionById: async (id: number): Promise<ApiResponse<TransactionDto>> => {
    return apiCall(() => api.get<TransactionDto>(`/transactions/${id}`));
  },

  // Create a new transaction
  createTransaction: async (transactionData: CreateTransactionDto): Promise<ApiResponse<TransactionDto>> => {
    console.log('Creating transaction with data:', transactionData);
    return apiCall(() => api.post<TransactionDto>('/transactions', transactionData));
  },

  // Update an existing transaction
  updateTransaction: async (id: number, transactionData: UpdateTransactionDto): Promise<ApiResponse<TransactionDto>> => {
    return apiCall(() => api.put<TransactionDto>(`/transactions/${id}`, transactionData));
  },

  // Delete a transaction
  deleteTransaction: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(() => api.delete<void>(`/transactions/${id}`));
  },

  // Get monthly summary
  getMonthlySummary: async (year: number, month: number): Promise<ApiResponse<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>> => {
    return apiCall(() => api.get<{
      totalIncome: number;
      totalExpense: number;
      balance: number;
      month: number;
      year: number;
    }>(`/transactions/monthly-summary?year=${year}&month=${month}`));
  },

  // Get monthly trends for charts
  getMonthlyTrends: async (monthsBack: number = 6): Promise<ApiResponse<MonthlyTrendDto[]>> => {
    return apiCall(() => api.get<MonthlyTrendDto[]>(`/transactions/monthly-trends?monthsBack=${monthsBack}`));
  },

  // Get category spending for charts
  getCategorySpending: async (year: number, month: number): Promise<ApiResponse<CategorySpendingDto[]>> => {
    return apiCall(() => api.get<CategorySpendingDto[]>(`/transactions/category-spending?year=${year}&month=${month}`));
  }
};

export default transactionService;