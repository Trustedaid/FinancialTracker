import { apiCall } from './api';
import api from './api';
import type { 
  BudgetDto, 
  CreateBudgetDto, 
  UpdateBudgetDto, 
  BudgetFilterDto,
  BudgetProgressDto
} from '../types/api';
import type { ApiResponse } from '../types/api';

export const budgetService = {
  // Get budgets with filtering
  getBudgets: async (filters?: BudgetFilterDto): Promise<ApiResponse<BudgetDto[]>> => {
    const params = new URLSearchParams();
    
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());

    const url = params.toString() ? `/budgets?${params.toString()}` : '/budgets';
    return apiCall(() => api.get<BudgetDto[]>(url));
  },

  // Get a specific budget by ID
  getBudgetById: async (id: number): Promise<ApiResponse<BudgetDto>> => {
    return apiCall(() => api.get<BudgetDto>(`/budgets/${id}`));
  },

  // Create a new budget
  createBudget: async (budgetData: CreateBudgetDto): Promise<ApiResponse<BudgetDto>> => {
    return apiCall(() => api.post<BudgetDto>('/budgets', budgetData));
  },

  // Update an existing budget
  updateBudget: async (id: number, budgetData: UpdateBudgetDto): Promise<ApiResponse<BudgetDto>> => {
    return apiCall(() => api.put<BudgetDto>(`/budgets/${id}`, budgetData));
  },

  // Delete a budget
  deleteBudget: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(() => api.delete<void>(`/budgets/${id}`));
  },

  // Get current month budgets
  getCurrentMonthBudgets: async (): Promise<ApiResponse<BudgetDto[]>> => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    return budgetService.getBudgets({ month: currentMonth, year: currentYear });
  },

  // Get budget progress for charts
  getBudgetProgress: async (year: number, month: number): Promise<ApiResponse<BudgetProgressDto[]>> => {
    return apiCall(() => api.get<BudgetProgressDto[]>(`/budgets/progress?year=${year}&month=${month}`));
  }
};

export default budgetService;