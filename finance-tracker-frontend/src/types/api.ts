// General API types and interfaces

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

// Common response wrapper for API calls
export interface BaseResponse {
  success: boolean;
  message?: string;
}

// Pagination types for list endpoints (for future use)
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Transaction Types
export const TransactionType = {
  Income: 1,
  Expense: 2
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface TransactionDto {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: number;
}

export interface UpdateTransactionDto {
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: number;
}

export interface TransactionFilterDto {
  type?: TransactionType;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedTransactionsDto {
  transactions: TransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Category Types
export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  color: string;
}

// Budget Types
export interface BudgetDto {
  id: number;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  month: number;
  year: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBudgetDto {
  amount: number;
  month: number;
  year: number;
  categoryId: number;
}

export interface UpdateBudgetDto {
  amount: number;
  month: number;
  year: number;
  categoryId: number;
}

export interface BudgetFilterDto {
  categoryId?: number;
  month?: number;
  year?: number;
}

// Chart Data Types
export interface MonthlyTrendDto {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySpendingDto {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface BudgetProgressDto {
  budgetId: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  isOverBudget: boolean;
  month: number;
  year: number;
}

export interface ChartDataRequestDto {
  monthsBack?: number;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}