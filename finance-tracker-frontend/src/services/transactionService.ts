import { apiCall } from './api';
import api from './api';
import type { 
  TransactionDto, 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionFilterDto,
  PaginatedTransactionsDto
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
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return apiCall(async () => {
      const response = await api.get<PaginatedTransactionsDto>(`/transactions?startDate=${startDate}&endDate=${endDate}&pageSize=1000`);
      
      const totalIncome = response.data.transactions
        .filter(t => t.type === 1) // Income
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpense = response.data.transactions
        .filter(t => t.type === 2) // Expense
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        ...response,
        data: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense
        }
      };
    });
  }
};

export default transactionService;