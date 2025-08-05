import { apiCall } from './api';
import api from './api';
import type { 
  CategoryDto, 
  CreateCategoryDto, 
  UpdateCategoryDto
} from '../types/api';
import type { ApiResponse } from '../types/api';

export const categoryService = {
  // Get all categories for the current user
  getCategories: async (): Promise<ApiResponse<CategoryDto[]>> => {
    return apiCall(() => api.get<CategoryDto[]>('/categories'));
  },

  // Get a specific category by ID
  getCategoryById: async (id: number): Promise<ApiResponse<CategoryDto>> => {
    return apiCall(() => api.get<CategoryDto>(`/categories/${id}`));
  },

  // Create a new category
  createCategory: async (categoryData: CreateCategoryDto): Promise<ApiResponse<CategoryDto>> => {
    return apiCall(() => api.post<CategoryDto>('/categories', categoryData));
  },

  // Update an existing category
  updateCategory: async (id: number, categoryData: UpdateCategoryDto): Promise<ApiResponse<CategoryDto>> => {
    return apiCall(() => api.put<CategoryDto>(`/categories/${id}`, categoryData));
  },

  // Delete a category
  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(() => api.delete<void>(`/categories/${id}`));
  }
};

export default categoryService;