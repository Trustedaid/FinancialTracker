import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { CreateCategoryDto, UpdateCategoryDto } from '../types';

// Query keys for categories
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
} as const;

// Get all categories with caching
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.getCategories(),
    select: (data) => data.data || [],
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryDto) => 
      categoryService.createCategory(categoryData),
    onSuccess: (newCategory) => {
      // Optimistically update the categories list
      queryClient.setQueryData(categoryKeys.list(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: [...oldData.data, newCategory.data]
          };
        }
        return oldData;
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...categoryData }: UpdateCategoryDto & { id: number }) => 
      categoryService.updateCategory(id, categoryData),
    onSuccess: (updatedCategory, variables) => {
      // Optimistically update the categories list
      queryClient.setQueryData(categoryKeys.list(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: oldData.data.map((cat: any) => 
              cat.id === variables.id ? { ...cat, ...updatedCategory.data } : cat
            )
          };
        }
        return oldData;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Optimistically remove from categories list
      queryClient.setQueryData(categoryKeys.list(), (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: oldData.data.filter((cat: any) => cat.id !== deletedId)
          };
        }
        return oldData;
      });

      // Remove specific category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
    },
  });
};